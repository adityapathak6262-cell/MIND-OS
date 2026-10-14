/**
 * COGNIVAULT — MIND-OS Learning-Gap Taxonomy, Version 1.0
 * Complete structured registry of 50 learning-pattern hypotheses (LG01–LG50)
 * across 5 primary categories (C1–C5).
 * 
 * IMPORTANT SAFEGUARD:
 * These patterns represent observable response patterns in educational tasks,
 * NOT permanent student traits, intelligence levels, personality traits,
 * mental health conditions, or learning disabilities.
 */

export interface TaxonomySubcategory {
  id: string;
  description: string;
}

export type PrimaryCategoryCode = 'C1' | 'C2' | 'C3' | 'C4' | 'C5';

export interface PrimaryCategoryInfo {
  code: PrimaryCategoryCode;
  name: string;
  description: string;
}

export interface TaxonomyEntry {
  id: string;
  name: string;
  primary_category: PrimaryCategoryCode;
  subcategories: Record<string, string>;
  observable_signals: string;
  verification_prompt: string;
  repair_strategy: string;
  do_not_infer: string;
}

export const PRIMARY_CATEGORIES: Record<PrimaryCategoryCode, PrimaryCategoryInfo> = {
  C1: {
    code: 'C1',
    name: 'Conceptual Gap',
    description: 'Fundamental understanding of domain concepts, definitions, entities, or boundary conditions is incomplete or fragile.'
  },
  C2: {
    code: 'C2',
    name: 'Logical Reasoning Gap',
    description: 'Difficulty in constructing valid causal chains, separating evidence from assumption, or tracking multi-premise arguments.'
  },
  C3: {
    code: 'C3',
    name: 'Procedural Gap',
    description: 'Execution slips, formula misapplication, algebraic transposition errors, unit conversions, or arithmetic calculation slips.'
  },
  C4: {
    code: 'C4',
    name: 'Specific Misconception',
    description: 'Deeply held alternative or intuitive mental model that systematically contradicts scientific/mathematical principles.'
  },
  C5: {
    code: 'C5',
    name: 'Knowledge Recall Gap',
    description: 'Inability to independently retrieve domain terminology, units, symbols, or formula representations without external prompts.'
  }
};

export const COGNIVAULT_TAXONOMY: Record<string, TaxonomyEntry> = {
  LG01: {
    id: 'LG01',
    name: 'Question Misread',
    primary_category: 'C2',
    subcategories: {
      LG01A: 'Answers a different quantity than asked',
      LG01B: 'Misses a command word such as compare, explain, calculate, justify',
      LG01C: 'Reads increase as decrease',
      LG01D: 'Misses not, except, only, or most likely'
    },
    observable_signals: 'Answer does not address the question target; explanation discusses a different concept.',
    verification_prompt: 'What exactly is the question asking you to find, compare, or explain?',
    repair_strategy: 'Highlight command words and ask the student to rewrite the question in their own words.',
    do_not_infer: 'Attention disorder, laziness, or intelligence level.'
  },
  LG02: {
    id: 'LG02',
    name: 'Goal Confusion',
    primary_category: 'C2',
    subcategories: {
      LG02A: 'Identifies given data but not the final objective',
      LG02B: 'Stops at an intermediate value',
      LG02C: 'Solves one part but misses the final conclusion'
    },
    observable_signals: 'Work contains correct calculations but no final answer to the requested output.',
    verification_prompt: 'What final quantity or conclusion does this question require?',
    repair_strategy: 'Use a Given → Need to Find → Plan template.',
    do_not_infer: 'Executive-function disorder or poor academic ability.'
  },
  LG03: {
    id: 'LG03',
    name: 'Context or Condition Ignored',
    primary_category: 'C1',
    subcategories: {
      LG03A: 'Ignores a fixed condition such as same voltage',
      LG03B: 'Ignores a medium or context such as vacuum',
      LG03C: 'Ignores stated constraints',
      LG03D: 'Uses a general rule without checking its conditions'
    },
    observable_signals: 'Response would be correct only if a stated condition were absent.',
    verification_prompt: 'Which condition in the question changes your answer most?',
    repair_strategy: 'Highlight conditions using a What stays fixed? checklist.',
    do_not_infer: 'Inability to focus.'
  },
  LG04: {
    id: 'LG04',
    name: 'Variable or Quantity Confusion',
    primary_category: 'C1',
    subcategories: {
      LG04A: 'Current versus voltage confusion',
      LG04B: 'Power versus energy confusion',
      LG04C: 'Mass versus weight confusion',
      LG04D: 'Speed versus velocity confusion',
      LG04E: 'Area versus volume confusion'
    },
    observable_signals: 'Student swaps meanings or units of related quantities.',
    verification_prompt: 'Name each quantity, what it measures, and its unit.',
    repair_strategy: 'Use a side-by-side comparison table and examples.',
    do_not_infer: 'Cognitive impairment or fixed inability.'
  },
  LG05: {
    id: 'LG05',
    name: 'Unit Meaning Gap',
    primary_category: 'C5',
    subcategories: {
      LG05A: 'Unit not written',
      LG05B: 'Incorrect unit used',
      LG05C: 'Unit treated as decorative',
      LG05D: 'Cannot explain what a unit represents'
    },
    observable_signals: 'Correct number with invalid or missing unit.',
    verification_prompt: 'What does this unit tell us about the quantity?',
    repair_strategy: 'Use quantity–symbol–unit flashcards and conversion practice.',
    do_not_infer: 'General mathematics weakness.'
  },
  LG06: {
    id: 'LG06',
    name: 'Diagram or Representation Interpretation Gap',
    primary_category: 'C1',
    subcategories: {
      LG06A: 'Misreads circuit symbols',
      LG06B: 'Misreads graph axes',
      LG06C: 'Misreads geometry diagram',
      LG06D: 'Misreads a map, timeline, table, or chart',
      LG06E: 'Cannot trace branches or arrows'
    },
    observable_signals: 'Answer conflicts with labels visible in the diagram or representation.',
    verification_prompt: 'Point out the key labels, arrows, branches, or axes before solving.',
    repair_strategy: 'Use guided diagram annotation.',
    do_not_infer: 'Visual-processing disorder.'
  },
  LG07: {
    id: 'LG07',
    name: 'Missing Information Assumption',
    primary_category: 'C2',
    subcategories: {
      LG07A: 'Assumes a value not provided',
      LG07B: 'Assumes two objects are equal without evidence',
      LG07C: 'Assumes ideal conditions without the prompt stating them',
      LG07D: 'Assumes one interpretation when multiple are possible'
    },
    observable_signals: 'Student gives an exact answer despite insufficient information.',
    verification_prompt: 'What information is missing, and what are you assuming?',
    repair_strategy: 'Use a Known / Unknown / Assumed table.',
    do_not_infer: 'Poor judgement or a permanent critical-thinking problem.'
  },
  LG08: {
    id: 'LG08',
    name: 'Irrelevant Detail Focus',
    primary_category: 'C2',
    subcategories: {
      LG08A: 'Uses an irrelevant number',
      LG08B: 'Uses an irrelevant story detail',
      LG08C: 'Gives importance to a decorative diagram element',
      LG08D: 'Confuses background information with evidence'
    },
    observable_signals: 'Solution relies on data unrelated to the concept asked.',
    verification_prompt: 'Which detail directly affects the answer, and which detail does not?',
    repair_strategy: 'Use a relevance-highlighting exercise.',
    do_not_infer: 'Attention problem.'
  },
  LG09: {
    id: 'LG09',
    name: 'Language Interpretation Gap',
    primary_category: 'C5',
    subcategories: {
      LG09A: 'Misunderstands a subject term',
      LG09B: 'Misreads comparative words such as greater, less, equal',
      LG09C: 'Misunderstands across, through, rate, or average',
      LG09D: 'Difficulty restating a word problem in their own words'
    },
    observable_signals: 'Student explanation reveals a different meaning for a key word.',
    verification_prompt: 'Explain this question in your own words before answering.',
    repair_strategy: 'Provide a concept vocabulary card with simple examples.',
    do_not_infer: 'Language disorder.'
  },
  LG10: {
    id: 'LG10',
    name: 'Formula Trigger Without Understanding',
    primary_category: 'C3',
    subcategories: {
      LG10A: 'Uses the first remembered formula',
      LG10B: 'Uses a formula before identifying the concept',
      LG10C: 'Inserts values without defining variables',
      LG10D: 'Selects a formula based only on matching visible numbers'
    },
    observable_signals: 'Formula used is not connected to the asked concept.',
    verification_prompt: 'Before choosing a formula, what physical or mathematical idea is involved?',
    repair_strategy: 'Use a Concept → Relationship → Formula sequence.',
    do_not_infer: 'A fixed rote-learner identity.'
  },
  LG11: {
    id: 'LG11',
    name: 'Current-as-Fuel Model',
    primary_category: 'C4',
    subcategories: {
      LG11A: 'Believes a bulb uses up current',
      LG11B: 'Believes current is less after a resistor',
      LG11C: 'Believes current ends after a component',
      LG11D: 'Believes the battery sends current only to the first component'
    },
    observable_signals: 'Student says less current remains after a bulb.',
    verification_prompt: 'In a simple series loop, compare current before and after the bulb. What changes at the bulb?',
    repair_strategy: 'Use a current-arrow animation and explain energy conversion.',
    do_not_infer: 'A weakness in all science topics.'
  },
  LG12: {
    id: 'LG12',
    name: 'Voltage-as-Flow Model',
    primary_category: 'C4',
    subcategories: {
      LG12A: 'Treats voltage as flowing like water',
      LG12B: 'Treats voltage and current as the same',
      LG12C: 'Believes voltage is used up before current reaches a bulb',
      LG12D: 'Treats battery voltage as a material substance'
    },
    observable_signals: 'Student treats voltage as moving charge.',
    verification_prompt: 'Which quantity is charge flow, and which is electrical push?',
    repair_strategy: 'Compare water pressure with water flow, including where the analogy stops matching.',
    do_not_infer: 'Low physics aptitude.'
  },
  LG13: {
    id: 'LG13',
    name: 'Resistance-Current Inversion',
    primary_category: 'C4',
    subcategories: {
      LG13A: 'Predicts more resistance means more current at fixed voltage',
      LG13B: 'Treats resistance as something that produces current',
      LG13C: 'Treats resistance as the same as voltage',
      LG13D: 'Believes a bigger resistor automatically gives more electricity'
    },
    observable_signals: 'Student predicts current grows with resistance when voltage is fixed.',
    verification_prompt: 'If resistance doubles while voltage is fixed, what happens to current?',
    repair_strategy: 'Use an interactive resistance slider with current arrows.',
    do_not_infer: 'Poor numeracy.'
  },
  LG14: {
    id: 'LG14',
    name: 'Series Voltage Duplication',
    primary_category: 'C4',
    subcategories: {
      LG14A: 'Believes every series bulb gets the full battery voltage',
      LG14B: 'Believes voltage increases after each series component',
      LG14C: 'Believes total voltage exceeds battery voltage',
      LG14D: 'Believes voltage does not divide in a series circuit'
    },
    observable_signals: 'Student assigns 6 V to each of two identical bulbs connected to a 6 V source.',
    verification_prompt: 'How can two identical components share the total battery voltage?',
    repair_strategy: 'Use a voltage-drop or voltage-sharing animation.',
    do_not_infer: 'Permanent misunderstanding.'
  },
  LG15: {
    id: 'LG15',
    name: 'Equal Parallel Split Assumption',
    primary_category: 'C4',
    subcategories: {
      LG15A: 'Believes current always splits equally',
      LG15B: 'Believes a higher-resistance branch gets more current',
      LG15C: 'Believes parallel branches have different voltage by default',
      LG15D: 'Believes adding a parallel branch reduces all current to zero'
    },
    observable_signals: 'Student ignores branch resistance in a parallel-current prediction.',
    verification_prompt: 'What determines how much current enters each parallel branch?',
    repair_strategy: 'Compare parallel paths with different resistances, then check where the analogy is limited.',
    do_not_infer: 'Inability to reason.'
  },
  LG16: {
    id: 'LG16',
    name: 'Current-Voltage Equivalence',
    primary_category: 'C1',
    subcategories: {
      LG16A: 'Uses current and voltage interchangeably',
      LG16B: 'Treats current and voltage as having the same unit',
      LG16C: 'Says current exists whenever voltage exists',
      LG16D: 'Says voltage exists only when current flows'
    },
    observable_signals: 'Student uses current and voltage interchangeably in an explanation.',
    verification_prompt: 'Can voltage exist across an open switch? Can current flow through it?',
    repair_strategy: 'Compare an open circuit with a closed circuit.',
    do_not_infer: 'Low science aptitude.'
  },
  LG17: {
    id: 'LG17',
    name: 'Battery Creates Charge Model',
    primary_category: 'C4',
    subcategories: {
      LG17A: 'Believes a battery creates electrons',
      LG17B: 'Believes charge is permanently consumed',
      LG17C: 'Believes battery supplies new current particles to each component',
      LG17D: 'Believes an empty battery has no charge anywhere'
    },
    observable_signals: 'Student says the battery produces charge that disappears in a bulb.',
    verification_prompt: 'Does a battery create charge, or give energy to charges already in the circuit?',
    repair_strategy: 'Use a charge-circulation model.',
    do_not_infer: 'A misunderstanding of every electricity topic.'
  },
  LG18: {
    id: 'LG18',
    name: 'One-Way Current Ending Model',
    primary_category: 'C4',
    subcategories: {
      LG18A: 'Believes current travels one way and stops',
      LG18B: 'Believes a return path is unnecessary',
      LG18C: 'Believes only the positive-terminal side matters',
      LG18D: 'Believes current exists in an incomplete circuit'
    },
    observable_signals: 'Student accepts a circuit without a closed return path.',
    verification_prompt: 'What must be true for charge to move continuously in a circuit?',
    repair_strategy: 'Use a closed-loop circuit visual.',
    do_not_infer: 'Poor spatial reasoning.'
  },
  LG19: {
    id: 'LG19',
    name: 'Power-Energy Confusion',
    primary_category: 'C1',
    subcategories: {
      LG19A: 'Treats watt and kilowatt-hour as the same',
      LG19B: 'Treats power and energy as the same',
      LG19C: 'Believes higher power always means higher total energy',
      LG19D: 'Treats energy as a rate'
    },
    observable_signals: 'Student uses W and kWh interchangeably.',
    verification_prompt: 'Which describes the rate of energy use, and which describes total energy used?',
    repair_strategy: 'Use a Power × Time = Energy visual.',
    do_not_infer: 'Mathematics weakness.'
  },
  LG20: {
    id: 'LG20',
    name: 'Appliance Wattage Absolute Rule',
    primary_category: 'C4',
    subcategories: {
      LG20A: 'Believes higher wattage always uses more energy regardless of time',
      LG20B: 'Believes a smaller appliance always uses less total energy',
      LG20C: 'Believes an electricity bill depends only on appliance wattage',
      LG20D: 'Treats usage duration as irrelevant'
    },
    observable_signals: 'Student compares appliance energy use without considering time.',
    verification_prompt: 'What two quantities determine energy consumption?',
    repair_strategy: 'Compare appliance wattage and usage-duration cards.',
    do_not_infer: 'Inability to apply concepts.'
  },
  LG21: {
    id: 'LG21',
    name: 'Premature Conclusion',
    primary_category: 'C2',
    subcategories: {
      LG21A: 'Selects the first possible answer',
      LG21B: 'Stops after one observation',
      LG21C: 'Chooses a solution before identifying a cause',
      LG21D: 'Skips alternative explanations'
    },
    observable_signals: 'One conclusion is given without considering alternatives.',
    verification_prompt: 'What are two other possible explanations?',
    repair_strategy: 'Use a Three-Hypothesis Rule on suitable reasoning tasks.',
    do_not_infer: 'Impulsivity disorder.'
  },
  LG22: {
    id: 'LG22',
    name: 'Single-Cause Bias',
    primary_category: 'C2',
    subcategories: {
      LG22A: 'Assumes one factor explains the entire result',
      LG22B: 'Ignores interacting variables',
      LG22C: 'Assumes one component alone caused a failure',
      LG22D: 'Does not consider multiple conditions'
    },
    observable_signals: 'Student ignores other relevant variables.',
    verification_prompt: 'What other factor could also affect this result?',
    repair_strategy: 'Use a multi-cause map.',
    do_not_infer: 'Personality trait.'
  },
  LG23: {
    id: 'LG23',
    name: 'Missing Evidence',
    primary_category: 'C2',
    subcategories: {
      LG23A: 'Makes a claim without data',
      LG23B: 'Makes a claim without calculation',
      LG23C: 'Makes a claim without observation',
      LG23D: 'Makes a claim without a source or rule'
    },
    observable_signals: 'Student gives a conclusion such as “This is correct because I think so” without support.',
    verification_prompt: 'What evidence, test, calculation, or rule supports your conclusion?',
    repair_strategy: 'Use a Claim → Evidence → Reason template.',
    do_not_infer: 'Dishonesty or laziness.'
  },
  LG24: {
    id: 'LG24',
    name: 'Untested Assumption',
    primary_category: 'C2',
    subcategories: {
      LG24A: 'Treats an assumption as fact',
      LG24B: 'Does not state an assumption',
      LG24C: 'Uses an assumption that cannot be checked',
      LG24D: 'Uses an assumption that contradicts question data'
    },
    observable_signals: 'Answer relies on an unstated condition.',
    verification_prompt: 'What are you assuming, and how could you test it?',
    repair_strategy: 'Use a Known / Unknown / Assumed worksheet.',
    do_not_infer: 'A permanent critical-thinking problem.'
  },
  LG25: {
    id: 'LG25',
    name: 'Causal Direction Reversal',
    primary_category: 'C2',
    subcategories: {
      LG25A: 'Presents an effect as a cause',
      LG25B: 'Reverses the sequence of events',
      LG25C: 'Treats a dependent variable as an independent cause',
      LG25D: 'Mixes up cause and result'
    },
    observable_signals: 'Explanation reverses the “because” relationship.',
    verification_prompt: 'Which change happens first, and which happens because of it?',
    repair_strategy: 'Use a Cause → Effect arrow activity.',
    do_not_infer: 'Global reasoning deficit.'
  },
  LG26: {
    id: 'LG26',
    name: 'Correlation-Causation Confusion',
    primary_category: 'C2',
    subcategories: {
      LG26A: 'Assumes an association proves a cause',
      LG26B: 'Treats coincidence as proof',
      LG26C: 'Ignores a possible third factor',
      LG26D: 'Treats one observation as a universal cause'
    },
    observable_signals: 'Student assumes linked events directly cause each other without sufficient evidence.',
    verification_prompt: 'Could another factor explain both observations?',
    repair_strategy: 'Use a third-variable scenario.',
    do_not_infer: 'Logical incapacity.'
  },
  LG27: {
    id: 'LG27',
    name: 'Overgeneralization',
    primary_category: 'C2',
    subcategories: {
      LG27A: 'Applies a rule outside its valid conditions',
      LG27B: 'Treats one example as universal',
      LG27C: 'Applies a formula to every situation',
      LG27D: 'Treats a special case as a general law'
    },
    observable_signals: 'Student uses a correct idea where its conditions do not apply.',
    verification_prompt: 'Under what condition is this rule valid?',
    repair_strategy: 'Use a Rule + Valid Conditions card.',
    do_not_infer: 'Rigid-thinking personality.'
  },
  LG28: {
    id: 'LG28',
    name: 'Exception Ignored',
    primary_category: 'C2',
    subcategories: {
      LG28A: 'Ignores a limiting case',
      LG28B: 'Ignores a change in medium or context',
      LG28C: 'Ignores an explicitly stated exception',
      LG28D: 'Ignores a model assumption'
    },
    observable_signals: 'Answer follows the main rule but misses a special condition in the question.',
    verification_prompt: 'Does the question include a special condition or exception?',
    repair_strategy: 'Use a condition-check checklist.',
    do_not_infer: 'Attention disorder.'
  },
  LG29: {
    id: 'LG29',
    name: 'Contradiction Unnoticed',
    primary_category: 'C2',
    subcategories: {
      LG29A: 'Gives two incompatible statements',
      LG29B: 'Calculation conflicts with conclusion',
      LG29C: 'Diagram conflicts with explanation',
      LG29D: 'Answer conflicts with a stated assumption'
    },
    observable_signals: 'Student gives mutually incompatible reasoning.',
    verification_prompt: 'Can both statements be true at the same time? Why?',
    repair_strategy: 'Use a consistency-check routine.',
    do_not_infer: 'Stable confusion.'
  },
  LG30: {
    id: 'LG30',
    name: 'Unsupported Analogy',
    primary_category: 'C2',
    subcategories: {
      LG30A: 'Uses an analogy beyond the valid comparison',
      LG30B: 'Uses an everyday example that conflicts with the scientific model',
      LG30C: 'Treats surface similarity as proof',
      LG30D: 'Ignores a critical difference in an analogy'
    },
    observable_signals: 'Student relies on an analogy that breaks at a key concept point.',
    verification_prompt: 'Where does this analogy stop matching the real situation?',
    repair_strategy: 'Use an Analogy Strengths / Limits table.',
    do_not_infer: 'Weak imagination.'
  },
  LG31: {
    id: 'LG31',
    name: 'Wrong Formula Selection',
    primary_category: 'C3',
    subcategories: {
      LG31A: 'Selects an unrelated formula',
      LG31B: 'Selects a formula based on a visible number',
      LG31C: 'Selects a formula from the wrong chapter',
      LG31D: 'Selects a formula that does not contain the needed quantity'
    },
    observable_signals: 'Formula has no relationship to the requested result.',
    verification_prompt: 'What relationship connects the known and unknown quantities?',
    repair_strategy: 'Use a Concept → Variables → Formula selection guide.',
    do_not_infer: 'Formula-memorisation deficit without checking other evidence.'
  },
  LG32: {
    id: 'LG32',
    name: 'Formula Variable Swap',
    primary_category: 'C3',
    subcategories: {
      LG32A: 'Swaps V, I, and R symbols',
      LG32B: 'Swaps numerator and denominator',
      LG32C: 'Isolates the wrong variable',
      LG32D: 'Forgets a symbol\'s meaning'
    },
    observable_signals: 'Correct formula structure but values are placed incorrectly.',
    verification_prompt: 'Write the meaning and unit of each symbol before substitution.',
    repair_strategy: 'Use symbol–meaning–unit cards.',
    do_not_infer: 'Dyscalculia or a medical condition.'
  },
  LG33: {
    id: 'LG33',
    name: 'Arithmetic Slip',
    primary_category: 'C3',
    subcategories: {
      LG33A: 'Addition or subtraction error',
      LG33B: 'Multiplication or division error',
      LG33C: 'Sign error',
      LG33D: 'Simple transcription error'
    },
    observable_signals: 'Method is correct but one arithmetic calculation is wrong.',
    verification_prompt: 'Recheck only this arithmetic step.',
    repair_strategy: 'Use a step-level recalculation.',
    do_not_infer: 'Conceptual gap unless the pattern repeats.'
  },
  LG34: {
    id: 'LG34',
    name: 'Proportionality Error',
    primary_category: 'C3',
    subcategories: {
      LG34A: 'Assumes a direct relationship instead of inverse',
      LG34B: 'Assumes an inverse relationship instead of direct',
      LG34C: 'Applies a doubling rule incorrectly',
      LG34D: 'Makes a ratio-comparison error'
    },
    observable_signals: 'Student predicts the wrong trend when one variable changes.',
    verification_prompt: 'If one quantity doubles while the other stays fixed, what should happen?',
    repair_strategy: 'Use an interactive ratio or slider comparison.',
    do_not_infer: 'Low mathematical ability.'
  },
  LG35: {
    id: 'LG35',
    name: 'Unit Conversion Error',
    primary_category: 'C3',
    subcategories: {
      LG35A: 'Kilo-to-base-unit error',
      LG35B: 'Hour-to-second error',
      LG35C: 'Centimetre-to-metre error',
      LG35D: 'Uses mixed units together'
    },
    observable_signals: 'Method is correct after correcting the unit conversion.',
    verification_prompt: 'Convert all values to compatible units before solving.',
    repair_strategy: 'Use a unit ladder or conversion table.',
    do_not_infer: 'Conceptual misunderstanding until verified.'
  },
  LG36: {
    id: 'LG36',
    name: 'Decimal or Magnitude Error',
    primary_category: 'C3',
    subcategories: {
      LG36A: 'Factor-of-10 error',
      LG36B: 'Factor-of-100 error',
      LG36C: 'Scientific-notation error',
      LG36D: 'Decimal-placement error'
    },
    observable_signals: 'Result is unrealistic by a power-of-ten factor.',
    verification_prompt: 'Does this magnitude make physical or mathematical sense?',
    repair_strategy: 'Use estimation and an order-of-magnitude check.',
    do_not_infer: 'Low ability.'
  },
  LG37: {
    id: 'LG37',
    name: 'Equation Interpretation Gap',
    primary_category: 'C1',
    subcategories: {
      LG37A: 'Can substitute but cannot explain the formula',
      LG37B: 'Treats an equation as a symbol pattern only',
      LG37C: 'Does not know what the equation predicts',
      LG37D: 'Cannot identify variable relationships'
    },
    observable_signals: 'Correct calculation without a conceptual explanation.',
    verification_prompt: 'Describe this equation in words.',
    repair_strategy: 'Use an equation-to-sentence activity.',
    do_not_infer: 'Lack of understanding from one attempt.'
  },
  LG38: {
    id: 'LG38',
    name: 'Multi-Step Planning Gap',
    primary_category: 'C3',
    subcategories: {
      LG38A: 'Skips an intermediate quantity',
      LG38B: 'Starts from the wrong step',
      LG38C: 'Cannot sequence steps',
      LG38D: 'Solves separate parts but cannot combine them'
    },
    observable_signals: 'Student knows formulas but cannot create a solution sequence.',
    verification_prompt: 'What must you find before finding the final quantity?',
    repair_strategy: 'Use a Plan Before Solve checklist.',
    do_not_infer: 'Executive-function problem.'
  },
  LG39: {
    id: 'LG39',
    name: 'Sign, Direction, or Polarity Error',
    primary_category: 'C3',
    subcategories: {
      LG39A: 'Positive or negative sign error',
      LG39B: 'Current-direction error',
      LG39C: 'Lens or mirror sign-convention error',
      LG39D: 'Coordinate-direction error'
    },
    observable_signals: 'Magnitude is correct but direction or sign is incorrect.',
    verification_prompt: 'Mark direction, polarity, or sign convention before calculating.',
    repair_strategy: 'Use a direction-arrow and sign-convention guide.',
    do_not_infer: 'Visual issue.'
  },
  LG40: {
    id: 'LG40',
    name: 'Answer Plausibility Not Checked',
    primary_category: 'C3',
    subcategories: {
      LG40A: 'Accepts an impossible value',
      LG40B: 'Accepts the wrong unit magnitude',
      LG40C: 'Accepts a negative answer where it is impossible',
      LG40D: 'Accepts an answer that contradicts physical expectation'
    },
    observable_signals: 'Student submits a result without a reasonableness check.',
    verification_prompt: 'Is your answer physically or logically reasonable? Why?',
    repair_strategy: 'Use an Estimate → Solve → Check routine.',
    do_not_infer: 'Lack of common sense.'
  },
  LG41: {
    id: 'LG41',
    name: 'Confidence-Evidence Mismatch',
    primary_category: 'C2',
    subcategories: {
      LG41A: 'High confidence with unsupported explanation',
      LG41B: 'High confidence with repeated error',
      LG41C: 'Low confidence with strong reasoning',
      LG41D: 'Confidence does not change after counterevidence'
    },
    observable_signals: 'Confidence rating does not align with the evidence shown.',
    verification_prompt: 'What evidence would increase or reduce your confidence?',
    repair_strategy: 'Use confidence-calibration reflection.',
    do_not_infer: 'Overconfidence personality or anxiety.'
  },
  LG42: {
    id: 'LG42',
    name: 'Recognition-Recall Confusion',
    primary_category: 'C5',
    subcategories: {
      LG42A: 'Recognises an answer after seeing it',
      LG42B: 'Cannot generate the first step independently',
      LG42C: 'Can follow an example but cannot reproduce it',
      LG42D: 'Needs answer options for recall'
    },
    observable_signals: 'Student says they understood but cannot solve without a prompt.',
    verification_prompt: 'Close the hint and explain the first step in your own words.',
    repair_strategy: 'Use a no-hint recall challenge.',
    do_not_infer: 'Poor memory or learning disability.'
  },
  LG43: {
    id: 'LG43',
    name: 'Copy-Without-Explanation',
    primary_category: 'C2',
    subcategories: {
      LG43A: 'Repeats exact solution language',
      LG43B: 'Cannot explain terms used',
      LG43C: 'Cannot give their own example',
      LG43D: 'Cannot adapt an answer to a new context'
    },
    observable_signals: 'Answer is present but explanation is absent or unrelated.',
    verification_prompt: 'Explain this to a friend in your own words.',
    repair_strategy: 'Use a teach-back prompt and own-example task.',
    do_not_infer: 'Cheating without evidence.'
  },
  LG44: {
    id: 'LG44',
    name: 'Hint Dependency',
    primary_category: 'C5',
    subcategories: {
      LG44A: 'Opens a hint before a first attempt',
      LG44B: 'Requests an answer immediately',
      LG44C: 'Cannot continue after a small difficulty',
      LG44D: 'Uses hints without trying recall'
    },
    observable_signals: 'Student consistently seeks help before attempting the question.',
    verification_prompt: 'Write one possible first step before opening a hint.',
    repair_strategy: 'Use a first-attempt gate and gradual hint release.',
    do_not_infer: 'Confidence disorder or low motivation.'
  },
  LG45: {
    id: 'LG45',
    name: 'Error Reflection Missing',
    primary_category: 'C2',
    subcategories: {
      LG45A: 'Changes answer without a reason',
      LG45B: 'Cannot identify the incorrect step',
      LG45C: 'Repeats the same error after feedback',
      LG45D: 'Cannot state what new evidence changed the answer'
    },
    observable_signals: 'Student corrects an answer but does not explain what they learned.',
    verification_prompt: 'What new evidence or rule changed your answer?',
    repair_strategy: 'Use an Error Autopsy card.',
    do_not_infer: 'Inability to learn.'
  },
  LG46: {
    id: 'LG46',
    name: 'Alternative Not Considered',
    primary_category: 'C2',
    subcategories: {
      LG46A: 'Uses only one solution method',
      LG46B: 'Proposes only one cause',
      LG46C: 'Does not compare answers',
      LG46D: 'Does not consider a counterexample'
    },
    observable_signals: 'Student presents one approach without comparison.',
    verification_prompt: 'Generate two alternative approaches or explanations.',
    repair_strategy: 'Use a Two-Alternative Rule where suitable.',
    do_not_infer: 'Inflexible personality.'
  },
  LG47: {
    id: 'LG47',
    name: 'Transfer Failure',
    primary_category: 'C1',
    subcategories: {
      LG47A: 'Correct on the original but wrong in a changed context',
      LG47B: 'Memorises a formula but cannot apply the concept',
      LG47C: 'Fails on a real-world version',
      LG47D: 'Fails on a diagram version after succeeding on a text version'
    },
    observable_signals: 'Student succeeds only in a familiar question format.',
    verification_prompt: 'Which principle remains the same in this new situation?',
    repair_strategy: 'Use near-transfer followed by far-transfer practice.',
    do_not_infer: 'No learning from one failure.'
  },
  LG48: {
    id: 'LG48',
    name: 'Explanation-Answer Mismatch',
    primary_category: 'C2',
    subcategories: {
      LG48A: 'Explanation supports a different option',
      LG48B: 'Calculation gives one answer but the final option differs',
      LG48C: 'Diagram supports a different conclusion',
      LG48D: 'Student may have selected an answer accidentally'
    },
    observable_signals: 'Explanation and selected answer conflict.',
    verification_prompt: 'Does your explanation support the option you selected?',
    repair_strategy: 'Use an answer–reason consistency check.',
    do_not_infer: 'Dishonesty.'
  },
  LG49: {
    id: 'LG49',
    name: 'Revision Resistance',
    primary_category: 'C2',
    subcategories: {
      LG49A: 'Repeats the same answer after a counterexample',
      LG49B: 'Ignores conflicting evidence',
      LG49C: 'Changes wording but retains the same incorrect model',
      LG49D: 'Rejects verification without an explanation'
    },
    observable_signals: 'Student does not engage with new evidence in the task.',
    verification_prompt: 'What part of the new evidence conflicts with your first idea?',
    repair_strategy: 'Use a Prediction → Evidence → Reconcile reflection.',
    do_not_infer: 'Stubborn personality.'
  },
  LG50: {
    id: 'LG50',
    name: 'Productive-Struggle Exit',
    primary_category: 'C5',
    subcategories: {
      LG50A: 'Leaves a task after the first difficulty',
      LG50B: 'Requests a final answer immediately',
      LG50C: 'Skips an explanation attempt',
      LG50D: 'Does not attempt a smaller first step'
    },
    observable_signals: 'Student exits before attempting a minimal action.',
    verification_prompt: 'Try one 30-second step: write what is known, unknown, and assumed.',
    repair_strategy: 'Use a micro-step scaffold and 30-second starter task.',
    do_not_infer: 'Low motivation, anxiety, or mental-health condition.'
  }
};
