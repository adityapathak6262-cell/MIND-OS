#!/usr/bin/env python3
"""
Unit tests for MIND-OS ML preprocessing, inference, and Bayesian verification.
"""

import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from ml.preprocessing.pipeline import normalize_math_text, extract_structured_features
from ml.inference.predict import predict_hybrid, rule_based_diagnostics

class TestMindOsPipeline(unittest.TestCase):

    def test_math_text_normalization(self):
        raw = "1  /  2  +  1 / 3 = ?"
        normalized = normalize_math_text(raw)
        self.assertEqual(normalized, "1/2 + 1/3 =")

    def test_fraction_misconception_detection(self):
        q = "Calculate: 1/2 + 1/3."
        a = "2/5"
        e = "I added 1+1 on top to get 2, and 2+3 on the bottom to get 5."
        res = predict_hybrid(q, a, e, 4)
        self.assertEqual(res["primary_gap"], "C4")
        self.assertGreater(res["probabilities"]["C4"], 0.70)
        self.assertEqual(res["verification_status"], "SUFFICIENTLY_SUPPORTED")

    def test_circuit_consumption_misconception(self):
        q = "Bulb A and Bulb B in series circuit"
        a = "Bulb A is brighter"
        e = "Bulb A uses up current before it reaches Bulb B"
        rules = rule_based_diagnostics(q, a, e)
        self.assertGreaterEqual(rules["C4"], 0.85)

    def test_structured_features(self):
        feat = extract_structured_features("2/5", "I added top and bottom", 4)
        self.assertEqual(feat["has_fraction"], 1.0)
        self.assertEqual(feat["mentions_added_terms"], 1.0)
        self.assertAlmostEqual(feat["reported_confidence"], 0.8, places=2)

if __name__ == "__main__":
    unittest.main()
