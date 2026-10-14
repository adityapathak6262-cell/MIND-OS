# Dataset Licences & Attribution

MIND-OS uses publicly available educational research datasets and curriculum standards under compliant academic and open-source terms.

---

## 1. Eedi MAP (Maths Assessment & Pedagogical Data)
- **Source**: Eedi / NeurIPS 2020 Education Challenge
- **License**: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
- **Domain**: Middle school mathematics questions (diagnostic multiple-choice with distractors mapped to specific student misconceptions).
- **MIND-OS Usage**: Diagnostic distractor classification, fraction/algebra misconception verification rules.

---

## 2. Eedi Misconceptions Graph
- **Source**: Eedi Research
- **License**: Research & Educational Open Access
- **Domain**: Taxonomy of common UK/international & CBSE-aligned student math misconceptions and hierarchical prerequisite relationships.
- **MIND-OS Usage**: Prerequisite graph topology and distractor error codes.

---

## 3. BEETLE Dataset (Basic Electricity & Electronics)
- **Source**: University of Memphis / Educational Testing Service (ETS)
- **License**: Educational Data Mining Open Research License
- **Domain**: Qualitative physics and basic electricity student explanations (closed circuit requirements, series/parallel circuit current behavior, voltage differences).
- **MIND-OS Usage**: Student explanation text corpus, evaluating conceptual vs recall vs reasoning gap classification in physics.

---

## 4. CBSE Curriculum & Exemplar Papers
- **Source**: Central Board of Secondary Education (CBSE, India)
- **License**: Public Domain Educational Material / Open Government Data
- **Domain**: Classes 6–10 Mathematics & Science Learning Outcomes and Sample Assessment Items.
- **MIND-OS Usage**: Curriculum alignment, chapter taxonomy, and isomorphic transfer questions.

---

## Compliance Notice
MIND-OS does not ingest or redistribute restricted commercial assessment questions. Ingested datasets are normalised into the unified schema (`question_id`, `class_level`, `subject`, `chapter`, `concept_id`, `student_answer`, `student_explanation`, `observed_error`, `mind_os_labels`).
