# Model Card — MIND-OS Diagnostic Baseline Classifier

## Model Details
- **Model Name**: MIND-OS Experimental Diagnostic Baselines (v1.2.0)
- **Model Types**:
  - Baseline 1: TF-IDF + Logistic Regression (Multi-label One-vs-Rest)
  - Baseline 2: TF-IDF + Linear Support Vector Machine (LinearSVC with Platt Scaling / CalibratedClassifierCV)
  - Previous prototype blend: ML and rule-based matching with Bayesian follow-up. This blended path is not used by the current live route.
- **Developers**: MIND-OS Engineering Team
- **Current Runtime**: The live diagnostic route uses question-specific answer-key and distractor matching, with a small number of concept-scoped reasoning checks. It does not use the TF-IDF classifiers below to assign its candidate.
- **Experimental Use**: TF-IDF classifiers are retained for offline evaluation only. Their current reported results are not strong enough to support confident live classification.
- **Out of Scope**: Diagnosing learning disabilities (e.g. dyscalculia, ADHD), psycho-medical evaluations, or automated punitive grading.

---

## Factors & Subgroups
- **Curriculum Bands**: CBSE Class 6–8 (Middle School), Class 9–10 (Secondary).
- **Domains**: Mathematics (Fractions, Linear Equations, Rational Numbers), Science (Basic Electricity & Electric Circuits).
- **Response Formats**: Short text explanation + arithmetic intermediate steps + confidence self-report (1–5 scale).

---

## Quantitative Metrics
- The checked-in evaluation artifact reports 36 training samples and 28 test samples.
- Reported held-out Macro-F1: Logistic Regression 0.222; Linear SVM 0.273.
- A rule-based baseline is listed as 0.735, but its evaluation provenance should be reproduced before using it as a product claim.
- These results do not support using the text classifier as a confident diagnostic. The runtime therefore relies on question-specific answer and distractor evidence and abstains when no supported pattern matches.
- The separate data quality report lists 14 records; this does not reconcile with the 64 samples in the model evaluation artifact. Dataset and split provenance must be resolved before publishing model metrics.
- The previous higher Macro-F1, ECE, and per-class figures are removed because they are not supported by the checked-in evaluation artifact.

---

## Ethical Considerations & Limitations
- Confidence ratings are explicitly treated as subjective metacognitive markers, not ground truth of competence (to counter the Dunning-Kruger effect).
- A single response is a candidate signal only. When the active question has no matching supported response pattern, the system requests more evidence rather than guessing a category.
