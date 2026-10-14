


export interface ConceptNode {
  id: string;
  name: string;
  class_level: string;
  subject: string;
  course_variant?: string; // "Standard Course 041" | "Basic Course 241" | "Course 086" | "Course 087" | "Course 184"
  chapter: string;
  description: string;
  prerequisites: string[]; // Concept IDs
  difficulty: "beginner" | "intermediate" | "advanced";
  learning_outcome?: string;
  academic_year?: string;
  has_diagnostic_items?: boolean;
  mapped_lgs?: string[];
  mapping_source?: string;
  teacher_reviewed_status?: 'reviewed' | 'pending' | 'unmapped';
}

export interface DiagnosticQuestion {
  id: string;
  concept_id: string;
  class_level: string;
  subject: string;
  course_variant?: string;
  chapter: string;
  title: string;
  prompt: string;
  context?: string;
  math_expression?: string;
  options?: { key: string; text: string; indicates_gap?: string; mapped_lg?: string }[];
  expected_answer: string;
  solution_steps: string[];
  common_distractors: {
    answer: string;
    gap_type: "C1" | "C2" | "C3" | "C4" | "C5";
    misconception_name: string;
    explanation: string;
    mapped_lg?: string;
  }[];
  targeted_followup: {
    prompt: string;
    sub_type: "procedural_vs_conceptual" | "recall_vs_reasoning" | "misconception_persistence";
    options: {
      key: string;
      text: string;
      favors_gap: "C1" | "C2" | "C3" | "C4" | "C5";
      favors_lg?: string;
      likelihood_ratio: number;
    }[];
  };
  reassessment_question: {
    id: string;
    prompt: string;
    math_expression?: string;
    expected_answer: string;
    solution_steps: string[];
    options?: { key: string; text: string; indicates_gap?: string; mapped_lg?: string }[];
  };
  transfer_question?: {
    id: string;
    prompt: string;
    math_expression?: string;
    expected_answer: string;
    solution_steps: string[];
    options?: { key: string; text: string; indicates_gap?: string; mapped_lg?: string }[];
  };
  mapped_candidate_lgs?: string[];
  mapping_source?: string;
}

export const ACADEMIC_YEAR = "2025-26 (CBSE Curriculum Framework)";

export const CONCEPT_GRAPH: ConceptNode[] = [
  // Class 6 Foundation
  {
    id: "MATH-FACTORS-MULTIPLES",
    name: "Factors, Multiples & LCM",
    class_level: "Class 6",
    subject: "Mathematics",
    chapter: "Playing with Numbers",
    description: "Understanding prime factors, multiples, and least common multiple (LCM) for finding common denominators.",
    prerequisites: [],
    difficulty: "beginner",
    learning_outcome: "Determine prime factorizations and LCM of pairs of natural numbers",
    academic_year: ACADEMIC_YEAR,
    has_diagnostic_items: false,
    mapping_source: "NCERT Class 6 Ch 3",
    teacher_reviewed_status: "pending"
  },
  {
    id: "MATH-FRAC-PARTS",
    name: "Fraction as Parts of a Whole",
    class_level: "Class 6",
    subject: "Mathematics",
    chapter: "Fractions",
    description: "Partitioning wholes into equal shares; numerator as count of parts and denominator as total parts in the unit whole.",
    prerequisites: [],
    difficulty: "beginner",
    learning_outcome: "Represent fractions visually as partition of equal unit wholes",
    academic_year: ACADEMIC_YEAR,
    has_diagnostic_items: false,
    mapping_source: "NCERT Class 6 Ch 7",
    teacher_reviewed_status: "pending"
  },
  {
    id: "MATH-FRAC-EQUIV",
    name: "Equivalent Fractions",
    class_level: "Class 6",
    subject: "Mathematics",
    chapter: "Fractions",
    description: "Multiplying or dividing numerator and denominator by identical non-zero integers maintains equal rational value.",
    prerequisites: ["MATH-FRAC-PARTS", "MATH-FACTORS-MULTIPLES"],
    difficulty: "beginner",
    learning_outcome: "Generate and verify equivalent fractions using multiplicative scaling",
    academic_year: ACADEMIC_YEAR,
    has_diagnostic_items: false,
    mapping_source: "NCERT Class 6 Ch 7",
    teacher_reviewed_status: "pending"
  },

  // Class 7 Diagnostic
  {
    id: "MATH-FRAC-ADD-DIFF-DENOM",
    name: "Addition of Fractions with Unlike Denominators",
    class_level: "Class 7",
    subject: "Mathematics",
    course_variant: "Standard Course 041",
    chapter: "Fractions and Decimals",
    description: "Converting fractions into equivalent forms with common denominator before summing numerators.",
    prerequisites: ["MATH-FRAC-EQUIV", "MATH-FACTORS-MULTIPLES"],
    difficulty: "intermediate",
    learning_outcome: "Perform addition and subtraction of fractions with unlike denominators by expressing them in terms of a common denominator",
    academic_year: ACADEMIC_YEAR,
    has_diagnostic_items: true,
    mapped_lgs: ["LG27", "LG38", "LG03", "LG01"],
    mapping_source: "CBSE Learning Outcomes Class 7 Mathematics (NCERT Ch 2)",
    teacher_reviewed_status: "reviewed"
  },
  {
    id: "MATH-ALG-LIKE-TERMS",
    name: "Algebraic Terms & Combining Like Terms",
    class_level: "Class 7",
    subject: "Mathematics",
    chapter: "Algebraic Expressions",
    description: "Differentiating between variables, coefficients, unlike terms, and distributive grouping.",
    prerequisites: [],
    difficulty: "beginner",
    learning_outcome: "Identify and combine like algebraic terms",
    academic_year: ACADEMIC_YEAR,
    has_diagnostic_items: false,
    mapping_source: "NCERT Class 7 Ch 12",
    teacher_reviewed_status: "pending"
  },

  // Class 8 Diagnostic
  {
    id: "MATH-ALG-LINEAR-EQ",
    name: "Solving Linear Equations in One Variable",
    class_level: "Class 8",
    subject: "Mathematics",
    course_variant: "Standard Course 041",
    chapter: "Linear Equations in One Variable",
    description: "Maintaining equality balance through inverse operations and transposing terms with sign changes.",
    prerequisites: ["MATH-ALG-LIKE-TERMS"],
    difficulty: "intermediate",
    learning_outcome: "Solve linear equations in one variable using algebraic balance and transposition",
    academic_year: ACADEMIC_YEAR,
    has_diagnostic_items: true,
    mapped_lgs: ["LG39", "LG10", "LG04"],
    mapping_source: "CBSE Class 8 Mathematics Framework (NCERT Ch 2)",
    teacher_reviewed_status: "reviewed"
  },

  // ==========================================
  // Class 10 CBSE Science (Course 086)
  // ==========================================
  {
    id: "SCI-ELEC-CLOSED-CIRCUIT",
    name: "Closed Electric Circuits & Potential Difference",
    class_level: "Class 10",
    subject: "Science",
    course_variant: "Course 086",
    chapter: "Electricity (Ch 11)",
    description: "Continuous unbroken conducting loop requirement and electric potential difference as driving force.",
    prerequisites: [],
    difficulty: "beginner",
    learning_outcome: "Explain the continuous path requirement for electric current and describe potential difference across terminals",
    academic_year: ACADEMIC_YEAR,
    has_diagnostic_items: false,
    mapping_source: "CBSE Secondary Curriculum 2025-26 Science",
    teacher_reviewed_status: "pending"
  },
  {
    id: "SCI-ELEC-SERIES-CIRCUITS",
    name: "Series Circuits & Current Conservation",
    class_level: "Class 10",
    subject: "Science",
    course_variant: "Course 086",
    chapter: "Electricity (Ch 11)",
    description: "Conservation of electric charge along a single branch loop; identical current through all series elements.",
    prerequisites: ["SCI-ELEC-CLOSED-CIRCUIT"],
    difficulty: "intermediate",
    learning_outcome: "Demonstrate and explain why electric current remains constant throughout a single-loop series circuit (conservation of electric charge)",
    academic_year: ACADEMIC_YEAR,
    has_diagnostic_items: true,
    mapped_lgs: ["LG11", "LG14", "LG16", "LG18"],
    mapping_source: "CBSE Class 10 Science Syllabus 2025-26, Unit IV Effects of Current",
    teacher_reviewed_status: "reviewed"
  },
  {
    id: "SCI-ELEC-OHMS-LAW",
    name: "Ohm's Law & Resistance",
    class_level: "Class 10",
    subject: "Science",
    course_variant: "Course 086",
    chapter: "Electricity (Ch 11)",
    description: "V = I * R relationship; linear proportionality of current to potential difference under constant temperature.",
    prerequisites: ["SCI-ELEC-CLOSED-CIRCUIT"],
    difficulty: "intermediate",
    learning_outcome: "State Ohm's Law and calculate resistance, current, or potential difference using V = I * R",
    academic_year: ACADEMIC_YEAR,
    has_diagnostic_items: true,
    mapped_lgs: ["LG13", "LG32", "LG34", "LG05"],
    mapping_source: "CBSE Class 10 Science Syllabus 2025-26",
    teacher_reviewed_status: "reviewed"
  },
  {
    id: "SCI-LIGHT-REFLECTION",
    name: "Spherical Mirrors & Reflection",
    class_level: "Class 10",
    subject: "Science",
    course_variant: "Course 086",
    chapter: "Light – Reflection and Refraction (Ch 9)",
    description: "Image formation by concave and convex mirrors, mirror formula, and sign convention.",
    prerequisites: [],
    difficulty: "intermediate",
    learning_outcome: "Apply mirror formula and Cartesian sign convention to determine image distance and magnification",
    academic_year: ACADEMIC_YEAR,
    has_diagnostic_items: false,
    mapping_source: "CBSE Class 10 Science Syllabus 2025-26",
    teacher_reviewed_status: "unmapped"
  },
  {
    id: "SCI-CHEM-REACTIONS",
    name: "Chemical Equations & Types of Reactions",
    class_level: "Class 10",
    subject: "Science",
    course_variant: "Course 086",
    chapter: "Chemical Reactions and Equations (Ch 1)",
    description: "Balancing chemical equations and identifying combination, decomposition, displacement, and redox reactions.",
    prerequisites: [],
    difficulty: "intermediate",
    learning_outcome: "Write balanced chemical equations obeying the Law of Conservation of Mass",
    academic_year: ACADEMIC_YEAR,
    has_diagnostic_items: false,
    mapping_source: "CBSE Class 10 Science Syllabus 2025-26",
    teacher_reviewed_status: "unmapped"
  },
  {
    id: "SCI-BIO-LIFE-PROCESSES",
    name: "Nutrition & Respiration in Organisms",
    class_level: "Class 10",
    subject: "Science",
    course_variant: "Course 086",
    chapter: "Life Processes (Ch 5)",
    description: "Autotrophic vs heterotrophic nutrition and aerobic vs anaerobic cellular respiration pathways.",
    prerequisites: [],
    difficulty: "intermediate",
    learning_outcome: "Differentiate energy pathways during aerobic and anaerobic cellular respiration",
    academic_year: ACADEMIC_YEAR,
    has_diagnostic_items: false,
    mapping_source: "CBSE Class 10 Science Syllabus 2025-26",
    teacher_reviewed_status: "unmapped"
  },

  // ==========================================
  // Class 10 CBSE Mathematics (Standard 041 & Basic 241)
  // ==========================================
  {
    id: "MATH-10-REAL-NUMBERS",
    name: "Fundamental Theorem of Arithmetic & Irrationality",
    class_level: "Class 10",
    subject: "Mathematics",
    course_variant: "Standard Course 041",
    chapter: "Real Numbers (Ch 1)",
    description: "Expressing composite numbers as unique products of primes and proof of irrationality of √2, √3, √5.",
    prerequisites: ["MATH-FACTORS-MULTIPLES"],
    difficulty: "intermediate",
    learning_outcome: "Prove irrationality of numbers using Fundamental Theorem of Arithmetic and contradiction method",
    academic_year: ACADEMIC_YEAR,
    has_diagnostic_items: true,
    mapped_lgs: ["LG23", "LG29", "LG01"],
    mapping_source: "CBSE Class 10 Mathematics Standard (041) Syllabus 2025-26",
    teacher_reviewed_status: "reviewed"
  },
  {
    id: "MATH-10-LINEAR-2VAR",
    name: "Pair of Linear Equations: Consistency & Solutions",
    class_level: "Class 10",
    subject: "Mathematics",
    course_variant: "Standard Course 041",
    chapter: "Pair of Linear Equations in Two Variables (Ch 3)",
    description: "Graphical and algebraic conditions for consistency (intersecting, parallel, coincident lines).",
    prerequisites: ["MATH-ALG-LINEAR-EQ"],
    difficulty: "intermediate",
    learning_outcome: "Determine consistency of pair of linear equations using ratio comparison a1/a2, b1/b2, c1/c2",
    academic_year: ACADEMIC_YEAR,
    has_diagnostic_items: true,
    mapped_lgs: ["LG34", "LG06", "LG03"],
    mapping_source: "CBSE Class 10 Mathematics Syllabus 2025-26",
    teacher_reviewed_status: "reviewed"
  },
  {
    id: "MATH-10-QUADRATIC",
    name: "Quadratic Equations & Nature of Roots",
    class_level: "Class 10",
    subject: "Mathematics",
    course_variant: "Standard Course 041",
    chapter: "Quadratic Equations (Ch 4)",
    description: "Standard form ax^2 + bx + c = 0, discriminant D = b^2 - 4ac, and nature of real roots.",
    prerequisites: ["MATH-ALG-LINEAR-EQ"],
    difficulty: "advanced",
    learning_outcome: "Analyze real root existence using discriminant D = b^2 - 4ac",
    academic_year: ACADEMIC_YEAR,
    has_diagnostic_items: false,
    mapping_source: "CBSE Class 10 Mathematics Syllabus 2025-26",
    teacher_reviewed_status: "unmapped"
  },
  {
    id: "MATH-10-TRIANGLES",
    name: "Similar Triangles & Basic Proportionality Theorem",
    class_level: "Class 10",
    subject: "Mathematics",
    course_variant: "Standard Course 041",
    chapter: "Triangles (Ch 6)",
    description: "Conditions for similarity (AAA, SAS, SSS) and Thales' Theorem application.",
    prerequisites: [],
    difficulty: "advanced",
    learning_outcome: "Apply Basic Proportionality Theorem (Thales' theorem) to solve geometric proportions",
    academic_year: ACADEMIC_YEAR,
    has_diagnostic_items: false,
    mapping_source: "CBSE Class 10 Mathematics Syllabus 2025-26",
    teacher_reviewed_status: "unmapped"
  },

  // ==========================================
  // Class 10 CBSE Social Science (Course 087)
  // ==========================================
  {
    id: "SST-10-HIST-NATIONALISM",
    name: "Nationalism in India & Non-Cooperation Movement",
    class_level: "Class 10",
    subject: "Social Science",
    course_variant: "Course 087",
    chapter: "India and the Contemporary World - II (History)",
    description: "First World War, Khilafat and Non-Cooperation, Salt March and Civil Disobedience.",
    prerequisites: [],
    difficulty: "intermediate",
    learning_outcome: "Analyze factors leading to the Non-Cooperation and Civil Disobedience movements",
    academic_year: ACADEMIC_YEAR,
    has_diagnostic_items: false,
    mapping_source: "CBSE Class 10 Social Science Syllabus 2025-26",
    teacher_reviewed_status: "unmapped"
  },
  {
    id: "SST-10-POL-POWER-SHARING",
    name: "Power Sharing in Democracies",
    class_level: "Class 10",
    subject: "Social Science",
    course_variant: "Course 087",
    chapter: "Democratic Politics - II (Political Science)",
    description: "Case studies of Belgium and Sri Lanka; prudential vs moral reasons for power sharing.",
    prerequisites: [],
    difficulty: "intermediate",
    learning_outcome: "Contrast majoritarianism with power-sharing arrangements using comparative country studies",
    academic_year: ACADEMIC_YEAR,
    has_diagnostic_items: false,
    mapping_source: "CBSE Class 10 Social Science Syllabus 2025-26",
    teacher_reviewed_status: "unmapped"
  },
  {
    id: "SST-10-ECON-DEVELOPMENT",
    name: "Development Indicators & Sustainability",
    class_level: "Class 10",
    subject: "Social Science",
    course_variant: "Course 087",
    chapter: "Understanding Economic Development (Economics)",
    description: "Per capita income vs Human Development Index (HDI), public facilities, and sustainable development.",
    prerequisites: [],
    difficulty: "intermediate",
    learning_outcome: "Evaluate economic development beyond national income using health and education indices",
    academic_year: ACADEMIC_YEAR,
    has_diagnostic_items: false,
    mapping_source: "CBSE Class 10 Social Science Syllabus 2025-26",
    teacher_reviewed_status: "unmapped"
  }
];

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // 1. Class 7 Fractions Addition
  {
    id: "Q-FRAC-01",
    concept_id: "MATH-FRAC-ADD-DIFF-DENOM",
    class_level: "Class 7",
    subject: "Mathematics",
    course_variant: "Standard Course 041",
    chapter: "Fractions and Decimals",
    title: "Adding Fractions with Unlike Denominators",
    prompt: "Evaluate the sum of the two fractions: 1/2 + 1/3. Write your final answer in simplest fractional form and detail your reasoning steps.",
    math_expression: "\\frac{1}{2} + \\frac{1}{3} = ?",
    options: [
      { key: "A", text: "5/6", indicates_gap: undefined },
      { key: "B", text: "2/5", indicates_gap: "C4", mapped_lg: "LG27" },
      { key: "C", text: "2/6", indicates_gap: "C3", mapped_lg: "LG38" },
      { key: "D", text: "1/5", indicates_gap: "C1", mapped_lg: "LG03" }
    ],
    expected_answer: "5/6",
    solution_steps: [
      "Identify the Least Common Multiple (LCM) of denominators 2 and 3, which is 6.",
      "Convert 1/2 into an equivalent fraction with denominator 6: (1 * 3) / (2 * 3) = 3/6.",
      "Convert 1/3 into an equivalent fraction with denominator 6: (1 * 2) / (3 * 2) = 2/6.",
      "Sum the scaled numerators while keeping the common denominator constant: 3/6 + 2/6 = 5/6."
    ],
    common_distractors: [
      {
        answer: "2/5",
        gap_type: "C4",
        misconception_name: "Fraction 'Add Across' Misconception",
        explanation: "Treats numerators and denominators as independent whole numbers, adding (1+1)/(2+3) = 2/5.",
        mapped_lg: "LG27"
      },
      {
        answer: "2/6",
        gap_type: "C3",
        misconception_name: "Unscaled Numerator Procedural Slip",
        explanation: "Identified the common denominator 6, but simply added the original numerators (1+1=2) without scaling.",
        mapped_lg: "LG38"
      },
      {
        answer: "1/5",
        gap_type: "C1",
        misconception_name: "Fraction Part-Whole Misunderstanding",
        explanation: "Fails to grasp that combining two positive fractions each > 0.3 must result in a quantity larger than 1/2.",
        mapped_lg: "LG03"
      }
    ],
    targeted_followup: {
      prompt: "Targeted verification probe: If you have half a glass of juice (1/2) and then someone pours in another third of a glass (1/3), could your total juice be less than half a glass?",
      sub_type: "procedural_vs_conceptual",
      options: [
        {
          key: "F1",
          text: "No! 2/5 is actually smaller than 1/2 (since 2.5/5 is 1/2), so 2/5 cannot be right — I must have added denominators incorrectly.",
          favors_gap: "C3",
          favors_lg: "LG38",
          likelihood_ratio: 3.8
        },
        {
          key: "F2",
          text: "Yes, because 1 portion plus 1 portion is 2 portions, out of 2 + 3 = 5 total possible servings.",
          favors_gap: "C4",
          favors_lg: "LG27",
          likelihood_ratio: 5.2
        },
        {
          key: "F3",
          text: "I don't know how to compare 2/5 and 1/2 without drawing them out.",
          favors_gap: "C1",
          favors_lg: "LG06",
          likelihood_ratio: 2.9
        }
      ]
    },
    reassessment_question: {
      id: "Q-FRAC-01-REASSESS",
      prompt: "Now calculate: 1/4 + 1/3. What is the sum in simplest form?",
      math_expression: "\\frac{1}{4} + \\frac{1}{3} = ?",
      expected_answer: "7/12",
      options: [
        { key: "A", text: "2/7", indicates_gap: "C4", mapped_lg: "LG27" },
        { key: "B", text: "7/12", indicates_gap: undefined },
        { key: "C", text: "2/12", indicates_gap: "C3", mapped_lg: "LG38" },
        { key: "D", text: "1/7", indicates_gap: "C1", mapped_lg: "LG03" }
      ],
      solution_steps: [
        "LCM of 4 and 3 is 12.",
        "1/4 = 3/12, 1/3 = 4/12.",
        "3/12 + 4/12 = 7/12."
      ]
    },
    transfer_question: {
      id: "Q-FRAC-01-TRANSFER",
      prompt: "A recipe uses 3/8 cup of olive oil and 1/4 cup of lemon juice. What is the total liquid volume in cups?",
      math_expression: "\\frac{3}{8} + \\frac{1}{4} = ?",
      expected_answer: "5/8",
      options: [
        { key: "A", text: "5/8 cup", indicates_gap: undefined },
        { key: "B", text: "4/12 (or 1/3) cup", indicates_gap: "C4", mapped_lg: "LG27" },
        { key: "C", text: "4/8 (or 1/2) cup", indicates_gap: "C3", mapped_lg: "LG38" },
        { key: "D", text: "3/32 cup", indicates_gap: "C3", mapped_lg: "LG31" }
      ],
      solution_steps: [
        "LCM of 8 and 4 is 8.",
        "1/4 converts to (1*2)/(4*2) = 2/8.",
        "3/8 + 2/8 = 5/8 cup."
      ]
    },
    mapped_candidate_lgs: ["LG27", "LG38", "LG03", "LG01"],
    mapping_source: "NCERT Class 7 Ch 2, Verified against CBSE Blueprint"
  },

  // 2. Class 10 Science: Series Circuits & Current Conservation
  {
    id: "Q-ELEC-01",
    concept_id: "SCI-ELEC-SERIES-CIRCUITS",
    class_level: "Class 10",
    subject: "Science",
    course_variant: "Course 086",
    chapter: "Electricity (Ch 11)",
    title: "Current in Series Circuits",
    prompt: "In a circuit, two identical incandescent light bulbs (Bulb 1 and Bulb 2) are connected in series with a 9V battery. Bulb 1 is connected directly to the positive terminal, and Bulb 2 is connected downstream before returning to the negative terminal. Compare the brightness and current passing through Bulb 1 and Bulb 2.",
    options: [
      { key: "A", text: "Both bulbs have identical brightness because electric current is conserved throughout the entire series loop.", indicates_gap: undefined },
      { key: "B", text: "Bulb 1 is brighter because it receives fresh current from the battery before Bulb 2 uses up the remaining current.", indicates_gap: "C4", mapped_lg: "LG11" },
      { key: "C", text: "Bulb 2 is brighter because charges speed up as they return to ground.", indicates_gap: "C2", mapped_lg: "LG25" },
      { key: "D", text: "Current depends on Ohm's law: I = V * R, so whichever has higher resistance glows brighter.", indicates_gap: "C5", mapped_lg: "LG32" }
    ],
    expected_answer: "Both bulbs have identical brightness because the rate of flow of electric charge is constant at all points in a single-loop series circuit.",
    solution_steps: [
      "In a series circuit, there is only one continuous path for electrons to flow.",
      "Charge cannot accumulate or vanish at any junction (conservation of charge).",
      "Therefore, the current I passing through Bulb 1 is identical to the current I passing through Bulb 2.",
      "Since the bulbs are identical, their resistances are equal, dissipating identical electrical power (P = I^2 * R)."
    ],
    common_distractors: [
      {
        answer: "Bulb 1 is brighter because current is used up",
        gap_type: "C4",
        misconception_name: "Current Attenuation / Consumption Model",
        explanation: "Believes electric current is a consumable fuel that diminishes sequentially as it passes each resistive load.",
        mapped_lg: "LG11"
      },
      {
        answer: "I = V * R formula inversion",
        gap_type: "C5",
        misconception_name: "Ohm's Law Recall Error",
        explanation: "Confused the fundamental definition I = V / R with a product.",
        mapped_lg: "LG32"
      }
    ],
    targeted_followup: {
      prompt: "Targeted verification probe: Imagine we insert an ammeter before Bulb 1 and a second ammeter between Bulb 1 and Bulb 2. If the first ammeter reads 0.50 Amperes, what will the second ammeter read?",
      sub_type: "misconception_persistence",
      options: [
        {
          key: "E1",
          text: "Exactly 0.50 Amperes, because current is charge per second passing through, not energy being eaten up.",
          favors_gap: "C3",
          favors_lg: "LG16",
          likelihood_ratio: 3.5
        },
        {
          key: "E2",
          text: "Less than 0.50 Amperes (e.g. 0.35 A), because Bulb 1 converted some of the amperes into light and heat.",
          favors_gap: "C4",
          favors_lg: "LG11",
          likelihood_ratio: 6.0
        },
        {
          key: "E3",
          text: "I am not sure what an ammeter measures versus a voltmeter.",
          favors_gap: "C5",
          favors_lg: "LG04",
          likelihood_ratio: 4.1
        }
      ]
    },
    reassessment_question: {
      id: "Q-ELEC-01-REASSESS",
      prompt: "Three identical resistors R1, R2, and R3 are connected in series with a 12V DC power supply. An ammeter measures 2 Amperes leaving the battery positive terminal. What is the current entering R3?",
      expected_answer: "2 Amperes",
      options: [
        { key: "A", text: "2 Amperes, identical at all points in the series circuit", indicates_gap: undefined },
        { key: "B", text: "0.67 Amperes, because current divides equally among the 3 resistors", indicates_gap: "C4", mapped_lg: "LG14" },
        { key: "C", text: "Less than 2 Amperes because R1 and R2 consume some current", indicates_gap: "C4", mapped_lg: "LG11" },
        { key: "D", text: "6 Amperes, using I = V / (something)", indicates_gap: "C3", mapped_lg: "LG31" }
      ],
      solution_steps: [
        "In a series circuit, current is identical at all points.",
        "Charge is conserved; current through R3 is 2 Amperes."
      ]
    },
    transfer_question: {
      id: "Q-ELEC-01-TRANSFER",
      prompt: "A toy train track operates on a series loop with a sound module, a motor, and a headlight. If the headlight filament burns out creating an open break, what happens to the train motor and sound module?",
      expected_answer: "Both stop immediately because charge cannot flow in an incomplete loop.",
      options: [
        { key: "A", text: "Both stop immediately because current requires an unbroken closed return path.", indicates_gap: undefined },
        { key: "B", text: "The motor keeps running if it is placed before the headlight in the circuit.", indicates_gap: "C4", mapped_lg: "LG18" },
        { key: "C", text: "Current increases through the motor because less current is consumed by the lamp.", indicates_gap: "C4", mapped_lg: "LG11" },
        { key: "D", text: "Only the sound module works because voltage stays fixed.", indicates_gap: "C1", mapped_lg: "LG16" }
      ],
      solution_steps: [
        "An open circuit stops charge flow everywhere in a single series loop.",
        "A complete return path is mandatory for steady electric current."
      ]
    },
    mapped_candidate_lgs: ["LG11", "LG14", "LG16", "LG18", "LG32"],
    mapping_source: "CBSE Class 10 Science Syllabus 2025-26, Unit IV"
  },

  // 3. Class 8/10 Mathematics: Linear Equations with Transposition
  {
    id: "Q-ALG-01",
    concept_id: "MATH-ALG-LINEAR-EQ",
    class_level: "Class 8",
    subject: "Mathematics",
    course_variant: "Standard Course 041",
    chapter: "Linear Equations in One Variable",
    title: "Solving Linear Equations with Transposition",
    prompt: "Solve the linear equation for the unknown variable x: 3x + 7 = 22. Show your intermediate steps.",
    math_expression: "3x + 7 = 22",
    options: [
      { key: "A", text: "x = 5", indicates_gap: undefined },
      { key: "B", text: "x = 9.67 (or 29/3)", indicates_gap: "C3", mapped_lg: "LG39" },
      { key: "C", text: "x = 12", indicates_gap: "C1", mapped_lg: "LG04" },
      { key: "D", text: "x = 3", indicates_gap: "C2", mapped_lg: "LG33" }
    ],
    expected_answer: "x = 5",
    solution_steps: [
      "Subtract 7 from both sides (or transpose +7 as -7): 3x = 22 - 7.",
      "Simplify the right hand side: 3x = 15.",
      "Divide both sides by the coefficient 3: x = 15 / 3.",
      "Simplify: x = 5."
    ],
    common_distractors: [
      {
        answer: "x = 29/3",
        gap_type: "C3",
        misconception_name: "Transposition Sign Error",
        explanation: "Added 7 to 22 instead of subtracting when moving across the equals sign: 3x = 22 + 7 = 29.",
        mapped_lg: "LG39"
      },
      {
        answer: "x = 12",
        gap_type: "C1",
        misconception_name: "Equation Balance Misunderstanding",
        explanation: "Subtracted 7 from 22 (15) then subtracted 3 instead of dividing by coefficient 3.",
        mapped_lg: "LG04"
      }
    ],
    targeted_followup: {
      prompt: "Targeted verification probe: If you have 3x + 7 = 22, why does moving '+ 7' across the equal sign require turning it into '- 7'?",
      sub_type: "procedural_vs_conceptual",
      options: [
        {
          key: "A1",
          text: "Because you must apply the inverse operation (subtracting 7) to both sides of the balance scale to keep the equation equal.",
          favors_gap: "C3",
          favors_lg: "LG39",
          likelihood_ratio: 4.2
        },
        {
          key: "A2",
          text: "It is just an arbitrary rule teachers teach; you just swap the sign whenever something jumps over the equals sign.",
          favors_gap: "C1",
          favors_lg: "LG10",
          likelihood_ratio: 3.9
        },
        {
          key: "A3",
          text: "I actually meant to subtract 7 from 22 to get 15, but accidentally added them or miscalculated 22 - 7 as 29.",
          favors_gap: "C3",
          favors_lg: "LG33",
          likelihood_ratio: 4.5
        }
      ]
    },
    reassessment_question: {
      id: "Q-ALG-01-REASSESS",
      prompt: "Solve for y: 4y + 5 = 29. What is the value of y?",
      math_expression: "4y + 5 = 29",
      expected_answer: "y = 6",
      options: [
        { key: "A", text: "y = 8.5 (or 34/4)", indicates_gap: "C3", mapped_lg: "LG39" },
        { key: "B", text: "y = 6", indicates_gap: undefined },
        { key: "C", text: "y = 20", indicates_gap: "C1", mapped_lg: "LG04" },
        { key: "D", text: "y = 5", indicates_gap: "C3", mapped_lg: "LG33" }
      ],
      solution_steps: [
        "4y = 29 - 5 = 24",
        "y = 24 / 4 = 6"
      ]
    },
    transfer_question: {
      id: "Q-ALG-01-TRANSFER",
      prompt: "A plumber charges a ₹250 visiting fee plus ₹150 per hour. If a customer pays ₹1,000 in total, which equation and solution correctly finds the hours worked h?",
      math_expression: "150h + 250 = 1000",
      expected_answer: "h = 5 hours",
      options: [
        { key: "A", text: "150h + 250 = 1000  =>  150h = 750  =>  h = 5 hours", indicates_gap: undefined },
        { key: "B", text: "150h + 250 = 1000  =>  150h = 1250  =>  h = 8.33 hours", indicates_gap: "C3", mapped_lg: "LG39" },
        { key: "C", text: "250h + 150 = 1000  =>  h = 3.4 hours", indicates_gap: "C1", mapped_lg: "LG04" },
        { key: "D", text: "1000 / (150 + 250) = 2.5 hours", indicates_gap: "C2", mapped_lg: "LG02" }
      ],
      solution_steps: [
        "Fixed fee is 250, variable charge is 150*h: 150h + 250 = 1000.",
        "150h = 1000 - 250 = 750.",
        "h = 750 / 150 = 5 hours."
      ]
    },
    mapped_candidate_lgs: ["LG39", "LG10", "LG04", "LG33"],
    mapping_source: "NCERT Class 8 Ch 2 / Class 10 Ch 3 Algebraic Foundations"
  },

  // 4. Class 10 CBSE Science: Ohm's Law & Resistance
  {
    id: "Q-ELEC-OHMS-01",
    concept_id: "SCI-ELEC-OHMS-LAW",
    class_level: "Class 10",
    subject: "Science",
    course_variant: "Course 086",
    chapter: "Electricity (Ch 11)",
    title: "Ohm's Law Proportionality & Resistance",
    prompt: "A cylindrical copper wire has resistance R. If its length is doubled while its cross-sectional area and temperature remain constant, how does the current passing through it change when connected to the same voltage battery?",
    options: [
      { key: "A", text: "Current is halved (I/2) because resistance doubles (R ∝ length) at constant voltage.", indicates_gap: undefined },
      { key: "B", text: "Current doubles (2I) because a longer wire carries twice as much electricity.", indicates_gap: "C4", mapped_lg: "LG13" },
      { key: "C", text: "Current remains identical because current depends only on battery voltage.", indicates_gap: "C1", mapped_lg: "LG03" },
      { key: "D", text: "Current quadruples using P = I^2 * R.", indicates_gap: "C3", mapped_lg: "LG31" }
    ],
    expected_answer: "Current is halved because resistance is directly proportional to length (R' = 2R), and from Ohm's Law I = V / R, doubling resistance halves current at constant voltage.",
    solution_steps: [
      "Resistance of a conductor is given by R = ρ * (L / A).",
      "When length L doubles while area A remains constant, new resistance is R' = 2R.",
      "By Ohm's Law, current I = V / R.",
      "At constant battery voltage V, new current I' = V / (2R) = I / 2."
    ],
    common_distractors: [
      {
        answer: "Current doubles with longer wire",
        gap_type: "C4",
        misconception_name: "Resistance-Current Direct Proportionality Inversion",
        explanation: "Believes higher resistance or longer wire produces greater current.",
        mapped_lg: "LG13"
      },
      {
        answer: "Current depends only on battery voltage",
        gap_type: "C1",
        misconception_name: "Circuit Constraint / Load Neglect",
        explanation: "Ignores the role of circuit resistance in limiting current from a fixed voltage source.",
        mapped_lg: "LG03"
      }
    ],
    targeted_followup: {
      prompt: "Targeted verification probe: If resistance opposes the flow of electric charge, what should happen to charge flow (current) when that opposition increases?",
      sub_type: "procedural_vs_conceptual",
      options: [
        {
          key: "O1",
          text: "Charge flow must decrease, because greater opposition slows down the rate of charge flow.",
          favors_gap: "C3",
          favors_lg: "LG34",
          likelihood_ratio: 4.0
        },
        {
          key: "O2",
          text: "Opposition creates more pressure so current must jump higher.",
          favors_gap: "C4",
          favors_lg: "LG13",
          likelihood_ratio: 5.5
        }
      ]
    },
    reassessment_question: {
      id: "Q-ELEC-OHMS-01-REASSESS",
      prompt: "A 12V car battery is connected across a 6 Ω resistor. If the resistor is replaced with a 24 Ω resistor, what is the new current?",
      expected_answer: "0.5 Amperes",
      options: [
        { key: "A", text: "0.5 Amperes (12V / 24Ω = 0.5A)", indicates_gap: undefined },
        { key: "B", text: "2 Amperes (unchanged)", indicates_gap: "C1", mapped_lg: "LG03" },
        { key: "C", text: "288 Amperes (using V * R = 12 * 24)", indicates_gap: "C5", mapped_lg: "LG32" },
        { key: "D", text: "4 Amperes", indicates_gap: "C3", mapped_lg: "LG34" }
      ],
      solution_steps: [
        "I = V / R = 12V / 24Ω = 0.5A."
      ]
    },
    transfer_question: {
      id: "Q-ELEC-OHMS-01-TRANSFER",
      prompt: "Two identical light bulbs in a decorative festival string are rewired from parallel to series. Assuming supply voltage stays constant, what happens to the overall current drawn from the wall outlet?",
      expected_answer: "Current decreases because series connection increases total equivalent resistance (R_eq = 2R).",
      options: [
        { key: "A", text: "Current drops to one-fourth (or decreases substantially) because series equivalent resistance is higher.", indicates_gap: undefined },
        { key: "B", text: "Current doubles because two bulbs demand double power.", indicates_gap: "C4", mapped_lg: "LG15" },
        { key: "C", text: "Current stays identical because bulbs are the same.", indicates_gap: "C1", mapped_lg: "LG03" }
      ],
      solution_steps: [
        "In parallel, R_eq = R / 2, so I_par = 2V / R.",
        "In series, R_eq = 2R, so I_ser = V / (2R) = I_par / 4.",
        "Current decreases significantly."
      ]
    },
    mapped_candidate_lgs: ["LG13", "LG32", "LG34", "LG03"],
    mapping_source: "CBSE Class 10 Science Syllabus 2025-26"
  },

  // 5. Class 10 CBSE Mathematics: Real Numbers
  {
    id: "Q-MATH-REAL-01",
    concept_id: "MATH-10-REAL-NUMBERS",
    class_level: "Class 10",
    subject: "Mathematics",
    course_variant: "Standard Course 041",
    chapter: "Real Numbers (Ch 1)",
    title: "Fundamental Theorem of Arithmetic & Rationality",
    prompt: "If p is a prime number that divides a^2 (where a is a positive integer), which statement is mathematically guaranteed by the Fundamental Theorem of Arithmetic?",
    options: [
      { key: "A", text: "p must also divide a, because p is prime and appears in the prime factorization of a.", indicates_gap: undefined },
      { key: "B", text: "p divides a only if a is also a prime number.", indicates_gap: "C2", mapped_lg: "LG27" },
      { key: "C", text: "p^2 must divide a.", indicates_gap: "C3", mapped_lg: "LG34" },
      { key: "D", text: "No conclusion can be drawn without knowing the exact numerical value of a.", indicates_gap: "C2", mapped_lg: "LG07" }
    ],
    expected_answer: "p must divide a. By the Fundamental Theorem of Arithmetic, the prime factors of a^2 are the duplicate prime factors of a.",
    solution_steps: [
      "Let prime factorization of a = p1 * p2 * ... * pn.",
      "Then a^2 = (p1 * p2 * ... * pn)^2 = p1^2 * p2^2 * ... * pn^2.",
      "The uniqueness part of Fundamental Theorem of Arithmetic guarantees that the only prime factors of a^2 are those of a.",
      "Since p is prime and divides a^2, p must be one of the prime factors of a; thus p divides a."
    ],
    common_distractors: [
      {
        answer: "Only if a is prime",
        gap_type: "C2",
        misconception_name: "Overgeneralization / Unwarranted Constraint",
        explanation: "Assumed the result only applies to prime bases rather than any positive integer.",
        mapped_lg: "LG27"
      },
      {
        answer: "No conclusion without exact number",
        gap_type: "C2",
        misconception_name: "Missing Information Assumption / Symbolic Distrust",
        explanation: "Failed to apply algebraic proof properties to generalized integers.",
        mapped_lg: "LG07"
      }
    ],
    targeted_followup: {
      prompt: "Targeted verification probe: Test with numbers: If prime 3 divides 12^2 = 144, does 3 divide 12? Does 12 have to be prime for this to work?",
      sub_type: "procedural_vs_conceptual",
      options: [
        {
          key: "T1",
          text: "Yes, 3 divides 12 (12 = 3 * 4), and 12 is composite. So the property holds for any integer a.",
          favors_gap: "C3",
          favors_lg: "LG01",
          likelihood_ratio: 4.5
        },
        {
          key: "T2",
          text: "It worked for 12 by coincidence, but for large numbers it might fail.",
          favors_gap: "C2",
          favors_lg: "LG07",
          likelihood_ratio: 3.8
        }
      ]
    },
    reassessment_question: {
      id: "Q-MATH-REAL-01-REASSESS",
      prompt: "If a prime p divides b^3, does p necessarily divide b?",
      expected_answer: "Yes, p must divide b by the uniqueness of prime factorization.",
      options: [
        { key: "A", text: "Yes, p must divide b by the Fundamental Theorem of Arithmetic.", indicates_gap: undefined },
        { key: "B", text: "No, p only divides b^2.", indicates_gap: "C3", mapped_lg: "LG34" },
        { key: "C", text: "Only if b is prime.", indicates_gap: "C2", mapped_lg: "LG27" }
      ],
      solution_steps: [
        "The prime factors of b^3 are identical to the prime factors of b.",
        "Therefore if prime p divides b^3, p must be a factor of b."
      ]
    },
    transfer_question: {
      id: "Q-MATH-REAL-01-TRANSFER",
      prompt: "In proving that √5 is irrational by contradiction, we assume √5 = a/b (where a and b are co-prime integers). We deduce 5b^2 = a^2, which implies 5 divides a^2, so 5 divides a. What contradiction arises next?",
      expected_answer: "Substituting a = 5k reveals that 5 also divides b, contradicting that a and b are co-prime (having no common factor other than 1).",
      options: [
        { key: "A", text: "We find that 5 also divides b, contradicting the assumption that a and b have no common factors other than 1.", indicates_gap: undefined },
        { key: "B", text: "We find that 5 is not a prime number.", indicates_gap: "C5", mapped_lg: "LG09" },
        { key: "C", text: "We find that a^2 is negative.", indicates_gap: "C3", mapped_lg: "LG39" }
      ],
      solution_steps: [
        "Since 5 divides a, write a = 5c.",
        "5b^2 = (5c)^2 = 25c^2  =>  b^2 = 5c^2.",
        "Thus 5 divides b^2, which implies 5 divides b.",
        "This contradicts that a and b share no common factor greater than 1."
      ]
    },
    mapped_candidate_lgs: ["LG27", "LG07", "LG23", "LG29"],
    mapping_source: "CBSE Class 10 Mathematics Standard 041, Ch 1"
  },

  // ==========================================
  // Class 10 CBSE Social Science Diagnostic Questions
  // ==========================================
  {
    id: "Q-SST-HIST-01",
    concept_id: "SST-10-HIST-NATIONALISM",
    class_level: "Class 10",
    subject: "Social Science",
    chapter: "Nationalism in India (History Ch 2)",
    title: "The Non-Cooperation Movement & Chauri Chaura Decision",
    prompt: "Why did Mahatma Gandhi abruptly call off the nationwide Non-Cooperation Movement in February 1922?",
    options: [
      {
        key: "A",
        text: "Due to violent clashes at Chauri Chaura where protesters burned a police station, violating Satyagraha principles",
        indicates_gap: undefined
      },
      {
        key: "B",
        text: "Because the British Government accepted all demands of the Khilafat committee",
        indicates_gap: "C5"
      },
      {
        key: "C",
        text: "Because Indian industrialists refused to boycott Manchester foreign cloth goods",
        indicates_gap: "C1"
      },
      {
        key: "D",
        text: "Because Gandhi decided to immediately launch the Salt March to Dandi instead",
        indicates_gap: "C3"
      }
    ],
    expected_answer: "Due to violent clashes at Chauri Chaura where protesters burned a police station, violating Satyagraha principles",
    solution_steps: [
      "In February 1922, a peaceful demonstration turned violent at Chauri Chaura in Gorakhpur, Uttar Pradesh.",
      "A mob set fire to a police station, killing 22 policemen.",
      "Mahatma Gandhi felt the movement was turning violent in many places and satyagrahis needed to be properly trained before they would be ready for mass struggles.",
      "Consequently, he called off the Non-Cooperation Movement."
    ],
    common_distractors: [
      {
        answer: "Because Gandhi decided to immediately launch the Salt March to Dandi instead",
        gap_type: "C3",
        misconception_name: "Historical Chronology Inversion",
        explanation: "Confused the 1922 Non-Cooperation movement with the 1930 Civil Disobedience and Dandi March."
      },
      {
        answer: "Because the British Government accepted all demands of the Khilafat committee",
        gap_type: "C5",
        misconception_name: "Event Outcome Recall Gap",
        explanation: "Misremembered the resolution of the movement as an imperial concession rather than an internal withdrawal."
      }
    ],
    targeted_followup: {
      prompt: "Targeted verification probe: What core philosophical condition distinguished Gandhi's doctrine of Satyagraha from passive resistance or armed rebellion?",
      sub_type: "recall_vs_reasoning",
      options: [
        {
          key: "F1",
          text: "Strict adherence to non-violence (Ahimsa) and appealing to the conscience of the oppressor, rejecting violent retaliation under any provocation.",
          favors_gap: "C1",
          likelihood_ratio: 5.0
        },
        {
          key: "F2",
          text: "Violence was permissible if the colonial police struck first.",
          favors_gap: "C4",
          likelihood_ratio: 4.2
        }
      ]
    },
    reassessment_question: {
      id: "Q-SST-HIST-01-REASSESS",
      prompt: "When peasant leaders like Baba Ramchandra organized the Oudh Kisan Sabha, how did their methods in Awadh differ from Gandhi's strict non-violent vision?",
      expected_answer: "Peasants attacked talukdars' houses, looted grain bazaars, and used violence, which Gandhi disapproved of.",
      options: [
        { key: "A", text: "Peasants raided talukdars' houses and bazars using violence, which conflicted with Congress guidance", indicates_gap: undefined },
        { key: "B", text: "They strictly followed passive non-cooperation without any local grievances", indicates_gap: "C1" },
        { key: "C", text: "They allied with the British colonial forces", indicates_gap: "C5" }
      ],
      solution_steps: [
        "The peasant movement developed in forms that Congress leadership was unhappy with, as houses of talukdars were attacked and bazaars looted."
      ]
    },
    transfer_question: {
      id: "Q-SST-HIST-01-TRANSFER",
      prompt: "How did Alluri Sitaram Raju's tribal rebellion in the Gudem Hills of Andhra Pradesh both admire and contradict Mahatma Gandhi's philosophy?",
      expected_answer: "Raju praised Gandhi and persuaded people to wear khadi and give up drinking, but asserted India could be liberated only by force, not non-violence.",
      options: [
        { key: "A", text: "He praised Gandhi and promoted khadi, but insisted that liberation required force, not non-violence", indicates_gap: undefined },
        { key: "B", text: "He fully rejected Gandhi's ideas and joined the British Army", indicates_gap: "C5" },
        { key: "C", text: "He used only court litigation and legal petitions", indicates_gap: "C3" }
      ],
      solution_steps: [
        "Raju was inspired by the Non-Cooperation Movement and persuaded people to wear khadi, but believed force was essential."
      ]
    },
    mapped_candidate_lgs: ["LG27", "LG38", "LG01"],
    mapping_source: "NCERT Class 10 History Ch 2"
  },
  {
    id: "Q-SST-POL-01",
    concept_id: "SST-10-POL-POWER-SHARING",
    class_level: "Class 10",
    subject: "Social Science",
    chapter: "Power Sharing (Political Science Ch 1)",
    title: "Majoritarianism vs Accommodation: Sri Lanka and Belgium",
    prompt: "Why did Belgium successfully prevent ethnic division while Sri Lanka suffered a prolonged civil war?",
    options: [
      {
        key: "A",
        text: "Belgium recognized linguistic diversity through constitutional power sharing, whereas Sri Lanka imposed majoritarian Sinhala dominance over Tamils",
        indicates_gap: undefined
      },
      {
        key: "B",
        text: "Because Belgium expelled all linguistic minorities to neighboring countries",
        indicates_gap: "C5"
      },
      {
        key: "C",
        text: "Because Sri Lanka adopted a federal power-sharing model that gave equal rights to Tamils",
        indicates_gap: "C4"
      },
      {
        key: "D",
        text: "Because economic growth in Belgium automatically eliminated cultural identities",
        indicates_gap: "C1"
      }
    ],
    expected_answer: "Belgium recognized linguistic diversity through constitutional power sharing, whereas Sri Lanka imposed majoritarian Sinhala dominance over Tamils",
    solution_steps: [
      "Between 1970 and 1993, Belgian leaders amended their constitution four times to ensure equal minister representation for Dutch and French-speaking communities.",
      "In contrast, the democratically elected government in Sri Lanka adopted Majoritarian measures in the 1956 Act (declaring Sinhala the only official language and favoring Sinhala applicants for universities and government jobs), alienating Sri Lankan Tamils and sparking civil war."
    ],
    common_distractors: [
      {
        answer: "Because Sri Lanka adopted a federal power-sharing model that gave equal rights to Tamils",
        gap_type: "C4",
        misconception_name: "Concept Inversion Misconception",
        explanation: "Confused majoritarianism with federal accommodation."
      }
    ],
    targeted_followup: {
      prompt: "Targeted verification probe: What is the prudential reason (as opposed to moral reason) for power sharing in a democracy?",
      sub_type: "procedural_vs_conceptual",
      options: [
        {
          key: "P1",
          text: "Prudential reasons emphasize that power sharing reduces the possibility of conflict between social groups and ensures political stability.",
          favors_gap: "C3",
          likelihood_ratio: 4.8
        },
        {
          key: "P2",
          text: "Prudential reasons mean the constitution says so in democratic theory.",
          favors_gap: "C1",
          likelihood_ratio: 3.5
        }
      ]
    },
    reassessment_question: {
      id: "Q-SST-POL-01-REASSESS",
      prompt: "What is horizontal distribution of power sharing in a constitutional democracy?",
      expected_answer: "Power shared among different organs of government, such as the legislature, executive, and judiciary.",
      options: [
        { key: "A", text: "Power shared among legislature, executive, and judiciary placed at the same level", indicates_gap: undefined },
        { key: "B", text: "Power divided between central, state, and local governments", indicates_gap: "C3" },
        { key: "C", text: "Power concentrated entirely in the head of state", indicates_gap: "C4" }
      ],
      solution_steps: [
        "Horizontal distribution places legislature, executive, and judiciary at the same level to exercise different powers, creating checks and balances."
      ]
    },
    mapped_candidate_lgs: ["LG10", "LG18", "LG01"],
    mapping_source: "NCERT Class 10 Political Science Ch 1"
  },
  {
    id: "Q-SST-ECON-01",
    concept_id: "SST-10-ECON-DEVELOPMENT",
    class_level: "Class 10",
    subject: "Social Science",
    chapter: "Development (Economics Ch 1)",
    title: "National Income vs Human Development Index (HDI)",
    prompt: "Why is Per Capita Income alone insufficient to measure the true developmental level of a country?",
    options: [
      {
        key: "A",
        text: "Because it hides income distribution disparities and ignores crucial human welfare indicators like health, literacy, and life expectancy",
        indicates_gap: undefined
      },
      {
        key: "B",
        text: "Because Per Capita Income cannot be calculated in international dollars",
        indicates_gap: "C5"
      },
      {
        key: "C",
        text: "Because rich countries always have the lowest life expectancy",
        indicates_gap: "C4"
      },
      {
        key: "D",
        text: "Because international agencies only count agricultural output",
        indicates_gap: "C2"
      }
    ],
    expected_answer: "Because it hides income distribution disparities and ignores crucial human welfare indicators like health, literacy, and life expectancy",
    solution_steps: [
      "Per capita income is an average that conceals inequalities; a country with high average income may have extreme poverty if wealth is concentrated in a tiny elite.",
      "Development also requires non-material goals such as quality education, healthcare, gender equality, and environmental sustainability, as reflected in the UNDP's Human Development Report."
    ],
    common_distractors: [
      {
        answer: "Because Per Capita Income cannot be calculated in international dollars",
        gap_type: "C5",
        misconception_name: "Economic Metric Recall Gap",
        explanation: "Unaware of Purchasing Power Parity (PPP) international dollar conversions."
      }
    ],
    targeted_followup: {
      prompt: "Targeted verification probe: Two countries, A and B, both have an identical average per capita income of ₹50,000. In Country A, 5 citizens earn ₹10,000 each. In Country B, 4 citizens earn ₹2,000 and 1 citizen earns ₹42,000. Which country would citizens prefer to live in?",
      sub_type: "procedural_vs_conceptual",
      options: [
        {
          key: "D1",
          text: "Country A, because income is equitably distributed and citizens are neither extremely rich nor impoverished.",
          favors_gap: "C3",
          likelihood_ratio: 4.5
        },
        {
          key: "D2",
          text: "Either country, since the average income is identical.",
          favors_gap: "C1",
          likelihood_ratio: 4.0
        }
      ]
    },
    reassessment_question: {
      id: "Q-SST-ECON-01-REASSESS",
      prompt: "What three indicators does the UNDP Human Development Index (HDI) combine to rank countries?",
      expected_answer: "Per capita income, life expectancy at birth, and educational attainment (literacy/mean years of schooling).",
      options: [
        { key: "A", text: "Per capita income, life expectancy at birth, and educational levels", indicates_gap: undefined },
        { key: "B", text: "Total population, military expenditure, and gold reserves", indicates_gap: "C4" },
        { key: "C", text: "Foreign investment, inflation rate, and export volume", indicates_gap: "C3" }
      ],
      solution_steps: [
        "HDI published by UNDP compares countries based on educational levels of the people, their health status, and per capita income."
      ]
    },
    mapped_candidate_lgs: ["LG12", "LG24", "LG01"],
    mapping_source: "NCERT Class 10 Economics Ch 1"
  }
];
