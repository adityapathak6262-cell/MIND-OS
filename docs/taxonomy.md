# MIND-OS Learning-Gap Taxonomy

## Overview
MIND-OS operates on a 5-class, multi-label learning difficulty taxonomy. Unlike standard binary auto-graders ($y \in \{0, 1\}$), MIND-OS estimates the latent cognitive and procedural causes of observed student errors without diagnosing psychological or medical conditions.

---

## 1. Five Primary Diagnostic Categories

### C1 — Conceptual Gap
- **Definition**: The student does not understand the underlying concept, structure, or invariant properties.
- **Observable Manifestation**: Inability to interpret what representations mean; applying operations without understanding conservation of value (e.g., treating $1/3$ as smaller than $1/4$ because $3 < 4$, or failing to understand that electric current requires an unbroken closed loop).
- **Intervention Protocol**: Visual representations, concrete interactive models, dual geometric scaling, physical analogies.

### C2 — Logical Reasoning Gap
- **Definition**: The student understands the definitions and isolated facts, but struggles to connect multiple premises, infer valid conclusions, or justify deductive intermediate steps.
- **Observable Manifestation**: Circular reasoning, invalid converse inference (e.g., "if all squares are rectangles, all rectangles are squares"), reversing cause and effect, or failing to chain intermediate equations.
- **Intervention Protocol**: Stepwise guided deductive prompts, premise-conclusion mapping, structured justification matrices.

### C3 — Procedural Gap
- **Definition**: The student understands the conceptual goal and principles, but executes the algorithm, formula sequence, or calculation steps incorrectly or incompletely.
- **Observable Manifestation**: Arithmetic calculation slips, sign transposition errors ($x - 3 = 5 \implies x = 2$), order-of-operations errors ($2 + 3 \times 4 = 20$), forgetting to invert when dividing fractions, or algebra balancing errors.
- **Intervention Protocol**: Structured step-by-step worked examples, faded scaffolding, procedural checklists, targeted error spot checks.

### C4 — Misconception
- **Definition**: The student demonstrates a specific, persistent, coherent incorrect mental model or overgeneralised rule formed from prior experience.
- **Observable Manifestation**: 
  - *Fractions "Add Across" Rule*: $\frac{a}{b} + \frac{c}{d} = \frac{a+c}{b+d}$ (e.g., $\frac{1}{2} + \frac{1}{3} = \frac{2}{5}$).
  - *Current Consumption Model*: Current gets "used up" by bulbs in series so the second bulb receives less current.
  - *Decimal Length Bias*: $0.25 > 0.8$ because "25 is greater than 8".
  - *Multiplication Always Increases*: $5 \times 0.5 > 5$.
- **Intervention Protocol**: Cognitive conflict induction, explicit counterexamples, side-by-side contrastive analysis of the flawed heuristic versus reality.

### C5 — Knowledge Recall Gap
- **Definition**: The student cannot retrieve or accurately recall an explicit factual definition, constant, formula, theorem statement, or statutory convention.
- **Observable Manifestation**: Forgetting the quadratic formula, confusing Ohm's Law $V = IR$ with $V = I/R$, misremembering prime definition (e.g., thinking 1 is prime), or confusing complementary and supplementary angles.
- **Intervention Protocol**: Spaced retrieval practice, flashcard micro-drills, mnemonics, active recall self-testing.

---

## 2. Multi-Label & Verification State Architecture

A single student response may exhibit multiple labels (e.g., C4 Misconception with an accompanying C3 Procedural error during execution).

### Verification Status Levels:
1. `UNVERIFIED`: Initial single-turn inference with high posterior entropy or competing explanations.
2. `PROVISIONALLY_SUPPORTED`: Follow-up response confirms error consistency with diagnostic hypothesis ($P(\text{gap}) \ge 0.65$).
3. `SUFFICIENTLY_SUPPORTED`: Converging evidence from primary question, targeted follow-up, and prerequisite check ($P(\text{gap}) \ge 0.85$, likelihood ratio $> 4.0$).
