# MIND-OS System Architecture

## Current live flow

```text
Student answer + explanation + working
                 |
                 v
      Active question's answer key
       and mapped distractor options
                 |
       +---------+----------+
       |                    |
       v                    v
 Answer matches       Candidate signal or
 expected answer      unresolved response
       |                    |
       |                    v
       |             Targeted follow-up
       |                    |
       |                    v
       |              Bayesian update
       |                    |
       +----------+---------+
                  v
        Teacher review / next lesson
```

The live route recognizes mapped options and a small set of explicit, question-scoped reasoning patterns. It does not infer a psychological trait. When no supported pattern matches, the response remains unresolved. Initial category probabilities stay uniform until follow-up evidence is submitted; the first response does not create calibrated confidence.

## Components

1. **Question bank**: curriculum-linked questions include answer keys, distractors, and follow-up probes.
2. **Live response analysis**: `server.ts` checks the active question, answer, explanation, and submitted working. Candidate signals remain unverified.
3. **Bayesian follow-up update**: a selected follow-up response updates the candidate distribution using the question's configured likelihood ratio. These ratios are authored inputs and still need empirical validation.
4. **Teacher review**: teachers can inspect responses and record review decisions.
5. **Intervention and reassessment**: concept-specific instructional activities and follow-up checks are served by separate engines.

## Experimental models and current limits

TF-IDF Logistic Regression and Linear SVM code remain under `ml/` for offline experiments only; they are not called by the live answer route. Their checked-in scores are low, and reported sample counts conflict with the data-quality report. The live pattern rules cover only a small set of question concepts. Unsupported questions should remain unresolved rather than inherit a guess from a different topic.
