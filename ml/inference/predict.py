#!/usr/bin/env python3
"""
MIND-OS Hybrid Inference Engine
Blends ML predictions (TF-IDF + Calibrated Classifier) with rule-based distractor heuristics
and calculates Bayesian posterior probability distributions across C1-C5.
"""

import os
import sys
import json
import joblib
import numpy as np
from typing import Dict, List, Any

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
from ml.preprocessing.pipeline import normalize_math_text, extract_structured_features

CLASSES = ["C1", "C2", "C3", "C4", "C5"]

def load_models():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    artefact_path = os.path.join(base_dir, "ml", "artefacts", "mind_os_models.joblib")
    if not os.path.exists(artefact_path):
        return None
    try:
        return joblib.load(artefact_path)
    except Exception as e:
        print(f"Error loading models: {e}")
        return None

def rule_based_diagnostics(question_text: str, student_answer: str, student_explanation: str) -> Dict[str, float]:
    """Transparent teacher-reviewed misconception rules."""
    q_norm = normalize_math_text(question_text)
    ans_norm = normalize_math_text(student_answer)
    exp_norm = normalize_math_text(student_explanation)
    combined = f"{q_norm} {ans_norm} {exp_norm}"
    
    priors = {c: 0.10 for c in CLASSES}
    
    # Rule 1: Fraction "Add Across" misconception
    if ("1/2" in q_norm and "1/3" in q_norm) and ("2/5" in ans_norm or "top" in exp_norm or "bottom" in exp_norm):
        priors["C4"] = 0.88
        priors["C3"] = 0.25
        priors["C1"] = 0.35
        
    # Rule 2: Denominator integer bias (1/5 > 1/4 because 5 > 4)
    if "1/4" in q_norm and "1/5" in q_norm and ("1/5" in ans_norm or "5 is greater than 4" in exp_norm or "5 is bigger" in exp_norm):
        priors["C4"] = 0.85
        priors["C1"] = 0.70
        
    # Rule 3: Electric current consumption (bulb A brighter than bulb B in series)
    if ("series" in q_norm or "bulb" in q_norm) and ("bulb a" in ans_norm or "uses up" in exp_norm or "uses current" in exp_norm or "reaches" in exp_norm):
        priors["C4"] = 0.90
        priors["C1"] = 0.40
        
    # Rule 4: Unbroken loop violation
    if "disconnected" in q_norm and ("yes" in ans_norm or "light up" in ans_norm or "doesn't need to return" in exp_norm):
        priors["C4"] = 0.82
        priors["C1"] = 0.75
        
    # Rule 5: Formula recall confusion (Ohm's law V*R instead of V/R)
    if "resistor" in q_norm and "48" in ans_norm and ("multiplied" in exp_norm or "v*r" in exp_norm or "12 by 4" in exp_norm):
        priors["C5"] = 0.85
        priors["C3"] = 0.30
        
    # Rule 6: Algebraic sign transposition (3x + 7 = 22 -> added 7 instead of subtracted)
    if "3x + 7 = 22" in q_norm and ("29" in exp_norm or "9.66" in ans_norm or "added 7" in exp_norm):
        priors["C3"] = 0.88
        priors["C1"] = 0.20
        
    # Rule 7: Like terms conflation (4x + 3y + 2x = 9xy)
    if "4x + 3y + 2x" in q_norm and ("9xy" in ans_norm or "xy" in ans_norm):
        priors["C4"] = 0.82
        priors["C1"] = 0.65
        
    # Rule 8: Multiplicative inverse conflation with additive inverse (-5/8 -> 5/8)
    if "multiplicative inverse" in q_norm and ("5/8" in ans_norm or "flipped the sign" in exp_norm):
        priors["C5"] = 0.86
        
    # Rule 9: Exponent multiplication rule (2^3 * 2^4 = 2^12)
    if ("2^3" in q_norm or "2^4" in q_norm) and ("2^12" in ans_norm or "multiplied the exponents" in exp_norm or "3 * 4" in exp_norm):
        priors["C3"] = 0.85
        priors["C5"] = 0.40

    return priors

def predict_hybrid(question_text: str, student_answer: str, student_explanation: str, confidence: int = 3) -> Dict[str, Any]:
    models = load_models()
    rule_probs = rule_based_diagnostics(question_text, student_answer, student_explanation)
    
    ml_probs = {c: 0.20 for c in CLASSES}
    if models is not None:
        try:
            vec = models["vectorizer"]
            lr = models["lr_model"]
            raw_text = f"{normalize_math_text(question_text)} [SEP] {normalize_math_text(student_answer)} [SEP] {normalize_math_text(student_explanation)}"
            x_vec = vec.transform([raw_text])
            proba = lr.predict_proba(x_vec)[0]
            for idx, c in enumerate(CLASSES):
                ml_probs[c] = float(proba[idx])
        except Exception as e:
            pass
            
    # Hybrid blending: 0.60 Rule-based heuristic + 0.40 Calibrated ML
    blended_probs = {}
    for c in CLASSES:
        val = 0.60 * rule_probs[c] + 0.40 * ml_probs[c]
        blended_probs[c] = round(float(np.clip(val, 0.05, 0.95)), 3)
        
    # Determine top categories
    sorted_classes = sorted(CLASSES, key=lambda c: blended_probs[c], reverse=True)
    primary = sorted_classes[0]
    secondary = [c for c in sorted_classes[1:] if blended_probs[c] >= 0.35]
    
    # Calculate Shannon entropy to determine ambiguity
    p_norm = np.array([blended_probs[c] for c in CLASSES])
    p_norm = p_norm / np.sum(p_norm)
    entropy = float(-np.sum(p_norm * np.log2(p_norm + 1e-9)))
    
    is_ambiguous = (blended_probs[sorted_classes[0]] - blended_probs[sorted_classes[1]] < 0.18) or (entropy > 2.0)
    
    verification_status = "UNVERIFIED" if is_ambiguous else ("SUFFICIENTLY_SUPPORTED" if blended_probs[primary] >= 0.75 else "PROVISIONALLY_SUPPORTED")

    evidence_for = []
    evidence_against = []
    
    if primary == "C4":
        evidence_for.append(f"Student demonstrated characteristic error pattern matching documented cognitive misconception in {question_text[:30]}...")
        evidence_for.append(f"Explanation reveals persistent overgeneralisation ('{student_explanation[:45]}...')")
        evidence_against.append("Student did not exhibit a simple procedural typo or random guessing.")
    elif primary == "C3":
        evidence_for.append("Student demonstrated understanding of the problem goal but executed calculation or symbolic transposition steps incorrectly.")
        evidence_against.append("Student showed awareness of the correct operation type, discounting fundamental conceptual ignorance.")
    elif primary == "C1":
        evidence_for.append("Student answer indicates lack of grasp of invariant relational properties or physical conservation.")
        evidence_against.append("Error is too systematic to be an isolated slip.")
    elif primary == "C5":
        evidence_for.append("Student confused statutory definitions or inverted a known canonical equation.")
        evidence_against.append("Student attempted structured computation rather than failing to reason.")
    elif primary == "C2":
        evidence_for.append("Student struggled with logical deduction from given conditions to conclusion.")
        evidence_against.append("Basic definitions were correctly cited.")

    return {
        "primary_gap": primary,
        "secondary_gaps": secondary,
        "probabilities": blended_probs,
        "entropy": round(entropy, 3),
        "is_ambiguous": is_ambiguous,
        "verification_status": verification_status,
        "evidence_for": evidence_for,
        "evidence_against": evidence_against,
        "rule_probabilities": rule_probs,
        "ml_probabilities": ml_probs
    }

if __name__ == "__main__":
    test_q = "Calculate: 1/2 + 1/3. Give your answer in simplest form."
    test_a = "2/5"
    test_e = "I added 1+1 on top to get 2, and 2+3 on the bottom to get 5."
    res = predict_hybrid(test_q, test_a, test_e, 4)
    print(json.dumps(res, indent=2))
