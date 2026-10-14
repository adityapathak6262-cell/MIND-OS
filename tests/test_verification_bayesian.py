#!/usr/bin/env python3
"""
Unit tests for Bayesian Likelihood Update and Shannon Entropy in MIND-OS.
"""

import unittest
import math

def compute_entropy(probs):
    s = sum(probs.values())
    if s == 0:
        return 0.0
    ent = 0.0
    for p in probs.values():
        norm = p / s
        if norm > 0:
            ent -= norm * math.log2(norm)
    return ent

def bayesian_update(priors, favored_cat, lr=4.0):
    cats = ["C1", "C2", "C3", "C4", "C5"]
    likelihoods = {
        "C1": lr if favored_cat == "C1" else 0.8,
        "C2": lr if favored_cat == "C2" else 0.7,
        "C3": lr if favored_cat == "C3" else 0.8,
        "C4": lr if favored_cat == "C4" else 0.7,
        "C5": lr if favored_cat == "C5" else 0.7,
    }
    unnorm = {c: priors[c] * likelihoods[c] for c in cats}
    z = sum(unnorm.values())
    post = {c: unnorm[c] / z for c in cats}
    return post

class TestBayesianLogic(unittest.TestCase):

    def test_bayesian_confidence_boost(self):
        prior = {"C1": 0.25, "C2": 0.10, "C3": 0.25, "C4": 0.30, "C5": 0.10}
        post = bayesian_update(prior, "C4", lr=5.0)
        self.assertGreater(post["C4"], prior["C4"])
        self.assertGreater(post["C4"], 0.50)

    def test_entropy_reduction(self):
        prior = {"C1": 0.20, "C2": 0.20, "C3": 0.20, "C4": 0.20, "C5": 0.20}
        ent_prior = compute_entropy(prior)
        post = bayesian_update(prior, "C4", lr=6.0)
        ent_post = compute_entropy(post)
        self.assertLess(ent_post, ent_prior)

if __name__ == "__main__":
    unittest.main()
