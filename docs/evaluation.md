# Model Evaluation & Validation Methodology

> **Evidence status:** This document describes the intended evaluation method, not a completed validation claim. The checked-in metrics report weak text-model scores and 64 examples, while the data-quality report lists 14 records. Reconcile the dataset, splits, and scoring script before treating any score as a product result. These offline classifiers are not used by the current live diagnostic route.

## 1. Experimental Setup & Leakage Prevention
To evaluate the ML classifier reliably and prevent data leakage:
- **Group-based Split**: We split the dataset by `question_id`. Responses to questions in the test split are never seen during training, evaluating out-of-distribution transfer to novel student formulations.
- **Stratified Multi-Label Split**: Preserves category distributions for C1, C2, C3, C4, C5 across train (70%), validation (15%), and test (15%) partitions.

---

## 2. Baselines Comparison
We benchmarked three model configurations:
1. **Rule-Based Cognitive Baseline**: Deterministic regex matching on known student distractor patterns (e.g. adding numerators and denominators directly) and prerequisite violation heuristics.
2. **ML Logistic Regression (TF-IDF + Structured Features)**: L2 regularized logistic regression with TF-IDF unigram and bigram features concatenated with answer correctness and student confidence indicators.
3. **ML Linear SVM (LinearSVC with Platt Scaling)**: Maximum-margin classifier with calibrated probability output.
4. **Hybrid MIND-OS Engine**: Blends rule-based priors with ML posteriors and triggers Bayesian follow-up verification when classification uncertainty is high.

---

## 3. Ambiguity & Abstention Policy
When multiple hypotheses have overlapping likelihoods or the predicted probability falls in the ambiguous band ($0.40 \le P(C_i) \le 0.65$), the engine:
1. Flags status as `UNVERIFIED`
2. Generates a targeted disambiguation question (e.g., distinguishing whether $1/2 + 1/3 = 2/5$ was caused by a procedural miscalculation or the persistent misconception that numerators and denominators add independently)
3. Incorporates the student's follow-up reply into a Bayesian likelihood update before publishing the diagnostic report.
