/**
 * MIND-OS Pedagogical Intervention Engine
 * Generates tailored remediation activities mapped to the diagnosed learning difficulty.
 */

export interface InterventionPayload {
  gap_type: "C1" | "C2" | "C3" | "C4" | "C5";
  concept_id: string;
  title: string;
  strategy_name: string;
  summary: string;
  pedagogical_components: {
    visual_model?: {
      type: "fraction_bars" | "circuit_simulation" | "balance_scale";
      initial_state: Record<string, any>;
      interactive_instruction: string;
    };
    cognitive_conflict_counterexample?: {
      flawed_claim: string;
      contradiction: string;
      resolution: string;
    };
    worked_example?: {
      problem_statement: string;
      steps: { step_number: number; instruction: string; rationale: string }[];
    };
    guided_practice: {
      question: string;
      options: { key: string; text: string; is_correct: boolean; feedback: string }[];
    };
  };
}

export function generateIntervention(gap_type: "C1" | "C2" | "C3" | "C4" | "C5", concept_id: string): InterventionPayload {
  if (concept_id === "MATH-FRAC-ADD-DIFF-DENOM") {
    if (gap_type === "C4") {
      return {
        gap_type: "C4",
        concept_id,
        title: "Cognitive Conflict Contrast: Fraction Addition",
        strategy_name: "Counterexample & Cognitive Conflict Induction",
        summary: "Notice why adding tops and bottoms leads to a mathematical contradiction when applied to identical parts.",
        pedagogical_components: {
          cognitive_conflict_counterexample: {
            flawed_claim: "Belief: 'To add fractions, simply add the numerators together and denominators together: 1/2 + 1/2 = (1+1)/(2+2) = 2/4 = 1/2.'",
            contradiction: "If you have half a glass of milk and add another half a glass of milk, do you still only have half a glass? No! You have a full glass (1 whole). But the 'add across' rule wrongly claims 1/2 + 1/2 = 1/2!",
            resolution: "Denominators are not amounts to be added; they are unit sizes (names of the pieces). You can only sum pieces once they share the same equal unit size (common denominator)."
          },
          visual_model: {
            type: "fraction_bars",
            initial_state: { fraction1: "1/2", fraction2: "1/3", common_denom: 6 },
            interactive_instruction: "Partition the two fraction bars into 6 equal segments. Notice that 1/2 becomes 3/6 and 1/3 becomes 2/6. When placed end-to-end, they occupy 5 out of 6 blocks (5/6), not 2/5!"
          },
          worked_example: {
            problem_statement: "Calculate 1/2 + 1/3 correctly using equivalent denominators.",
            steps: [
              { step_number: 1, instruction: "Find the Least Common Denominator (LCD).", rationale: "Multiples of 2 are 2, 4, 6... Multiples of 3 are 3, 6... The smallest shared multiple is 6." },
              { step_number: 2, instruction: "Convert each fraction into sixths.", rationale: "1/2 = (1 * 3)/(2 * 3) = 3/6. 1/3 = (1 * 2)/(3 * 2) = 2/6." },
              { step_number: 3, instruction: "Sum only the numerators: 3/6 + 2/6 = 5/6.", rationale: "3 sixths + 2 sixths = 5 sixths. The denominator 6 represents the unit slice size." }
            ]
          },
          guided_practice: {
            question: "Quick Check: What is 1/4 + 1/4 using the common unit principle?",
            options: [
              { key: "A", text: "2/8 = 1/4", is_correct: false, feedback: "Incorrect: adding denominators makes the pieces smaller!" },
              { key: "B", text: "2/4 = 1/2", is_correct: true, feedback: "Correct! One quarter plus one quarter equals two quarters, which simplifies to one half." },
              { key: "C", text: "1/8", is_correct: false, feedback: "Incorrect: two positive fractions cannot be smaller than one of them." }
            ]
          }
        }
      };
    } else if (gap_type === "C3") {
      return {
        gap_type: "C3",
        concept_id,
        title: "Step-by-Step Procedural Guide: Scaling Numerators",
        strategy_name: "Worked Example & Scaling Checklist",
        summary: "Focus on the key procedural step: whenever you multiply the denominator to match LCM, you must multiply the numerator by the same factor.",
        pedagogical_components: {
          worked_example: {
            problem_statement: "Add 1/3 + 1/6.",
            steps: [
              { step_number: 1, instruction: "Notice LCM of 3 and 6 is 6.", rationale: "6 is already a multiple of 3." },
              { step_number: 2, instruction: "Scale 1/3: multiply BOTH numerator and denominator by 2.", rationale: "(1 * 2) / (3 * 2) = 2/6. Do not forget to scale the numerator!" },
              { step_number: 3, instruction: "Combine: 2/6 + 1/6 = 3/6 = 1/2.", rationale: "Add numerators only." }
            ]
          },
          guided_practice: {
            question: "When converting 2/3 to an equivalent fraction with denominator 12, what must the numerator become?",
            options: [
              { key: "A", text: "2 (unscaled)", is_correct: false, feedback: "Incorrect: you must multiply top by 4 because 3 * 4 = 12." },
              { key: "B", text: "8", is_correct: true, feedback: "Correct! 2 * 4 = 8, so 2/3 = 8/12." },
              { key: "C", text: "5", is_correct: false, feedback: "Incorrect: do not add, multiply!" }
            ]
          }
        }
      };
    }
  }

  if (concept_id === "SCI-ELEC-SERIES-CIRCUITS") {
    return {
      gap_type: gap_type,
      concept_id,
      title: "Current Conservation in Series Loops",
      strategy_name: "Closed-Loop Hydrodynamic Analogy & Conservation Check",
      summary: "Electric current is not consumed like fuel; charges circulate in a continuous incompressible loop.",
      pedagogical_components: {
        cognitive_conflict_counterexample: {
          flawed_claim: "Belief: 'The first bulb uses up current, leaving less for the second bulb.'",
          contradiction: "If current were 'consumed' in Bulb 1, negative electrons would vanish inside the filament, violating the Law of Conservation of Electric Charge! In reality, for every 10^18 electrons entering Bulb 1 per second, exactly 10^18 electrons exit Bulb 1 and enter Bulb 2.",
          resolution: "What gets consumed is electrical potential ENERGY (voltage drop), NOT the charges (current) themselves."
        },
        visual_model: {
          type: "circuit_simulation",
          initial_state: { battery_v: 9, r1: 10, r2: 10, current: 0.45 },
          interactive_instruction: "Observe the flow rate of charge markers along the wire. Notice that the speed and density of charges is identical through Bulb 1, Bulb 2, and the return wire."
        },
        worked_example: {
          problem_statement: "Two identical 5-ohm lamps are connected in series to a 10V battery.",
          steps: [
            { step_number: 1, instruction: "Calculate total resistance: R_total = 5 + 5 = 10 ohms.", rationale: "Series resistances add directly." },
            { step_number: 2, instruction: "Calculate current using Ohm's Law: I = V / R_total = 10 / 10 = 1.0 Ampere.", rationale: "I is constant throughout the single loop." },
            { step_number: 3, instruction: "Check current through each lamp.", rationale: "Lamp 1 receives 1.0 A. Lamp 2 receives 1.0 A." }
          ]
        },
        guided_practice: {
          question: "An ammeter before the first lamp reads 1.5 Amperes. What will an ammeter placed after the second lamp read?",
          options: [
            { key: "A", text: "1.5 Amperes", is_correct: true, feedback: "Correct! Current is conserved everywhere in the series circuit." },
            { key: "B", text: "0.75 Amperes", is_correct: false, feedback: "Incorrect: current does not diminish across series resistors." },
            { key: "C", text: "0 Amperes", is_correct: false, feedback: "Incorrect: current must return to the negative terminal." }
          ]
        }
      }
    };
  }

  // Generic fallback intervention
  return {
    gap_type,
    concept_id,
    title: `Guided Practice & Error Remediation (${gap_type})`,
    strategy_name: "Targeted Concept Breakdown",
    summary: "Reviewing fundamental principles and working through an explicit example to consolidate understanding.",
    pedagogical_components: {
      worked_example: {
        problem_statement: "Solving step-by-step with verified intermediate checks.",
        steps: [
          { step_number: 1, instruction: "Identify the given conditions and relevant governing law.", rationale: "Explicit problem framing prevents intuitive mistakes." },
          { step_number: 2, instruction: "Carry out the operations in sequence without skipping transposition steps.", rationale: "Self-monitoring intermediate steps catches procedural slips." }
        ]
      },
      guided_practice: {
        question: "Does the solution preserve the underlying invariant condition?",
        options: [
          { key: "A", text: "Yes, equality and units are preserved throughout", is_correct: true, feedback: "Correct!" },
          { key: "B", text: "No, units were dropped", is_correct: false, feedback: "Review the balancing steps." }
        ]
      }
    }
  };
}
