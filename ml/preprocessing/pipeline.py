#!/usr/bin/env python3
"""
MIND-OS Text Processing & Feature Extraction Pipeline
Normalizes student explanations and intermediate steps while preserving mathematical notation.
"""

import re
from typing import List, Dict, Any
import numpy as np

def normalize_math_text(text: str) -> str:
    """
    Cleans text while rigorously preserving fractions, exponents, variables, and signs.
    """
    if not text:
        return ""
    
    t = text.strip().lower()
    # Normalize unicode fraction slash & arithmetic symbols
    t = t.replace("⁄", "/").replace("÷", "/").replace("×", "*").replace("−", "-")
    
    # Normalize fraction expressions like "1 / 2" to "1/2"
    t = re.sub(r'(\d+)\s*/\s*(\d+)', r'\1/\2', t)
    
    # Normalize algebraic terms like "3 * x" to "3x"
    t = re.sub(r'(\d+)\s*\*\s*([a-z])', r'\1\2', t)
    
    # Normalize equations like "3x + 7 = 22"
    t = re.sub(r'\s*=\s*', ' = ', t)
    t = re.sub(r'\s*\+\s*', ' + ', t)
    
    # Remove extraneous punctuation while keeping math symbols
    t = re.sub(r'[^a-z0-9\s\+\-\*\/\^\=\.\(\)]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def extract_structured_features(student_answer: str, student_explanation: str, confidence: int = 3) -> Dict[str, float]:
    """
    Extracts structured cognitive markers from student response.
    """
    ans_norm = normalize_math_text(student_answer or "")
    exp_norm = normalize_math_text(student_explanation or "")
    combined = f"{ans_norm} {exp_norm}"
    
    features = {
        "has_fraction": 1.0 if "/" in combined else 0.0,
        "has_algebraic_var": 1.0 if bool(re.search(r'[a-z]', combined)) else 0.0,
        "has_equality": 1.0 if "=" in combined else 0.0,
        "has_exponent": 1.0 if "^" in combined else 0.0,
        "mentions_added_terms": 1.0 if any(w in exp_norm for w in ["added", "plus", "sum", "together", "top", "bottom"]) else 0.0,
        "mentions_multiplied": 1.0 if any(w in exp_norm for w in ["multiplied", "times", "product"]) else 0.0,
        "mentions_current_flow": 1.0 if any(w in exp_norm for w in ["current", "bulb", "battery", "flows", "terminal", "wire"]) else 0.0,
        "mentions_uses_up": 1.0 if any(w in exp_norm for w in ["uses up", "consumed", "used", "decreases", "obstacle"]) else 0.0,
        "mentions_rules_or_formula": 1.0 if any(w in exp_norm for w in ["formula", "rule", "definition", "inverse", "law"]) else 0.0,
        "reported_confidence": float(confidence) / 5.0,
        "explanation_length_words": min(len(exp_norm.split()) / 30.0, 1.0)
    }
    return features
