export type GapType = "C1" | "C2" | "C3" | "C4" | "C5";

export interface ConceptNode {
  id: string;
  name: string;
  class_level: string;
  subject: string;
  course_variant?: string;
  chapter: string;
  description: string;
  prerequisites: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  learning_outcome?: string;
  academic_year?: string;
  has_diagnostic_items?: boolean;
  mapped_lgs?: string[];
  mapping_source?: string;
  teacher_reviewed_status?: 'reviewed' | 'pending' | 'unmapped';
}

export interface QuestionOption {
  key: string;
  text: string;
  indicates_gap?: GapType;
}

export interface CommonDistractor {
  answer: string;
  gap_type: GapType;
  misconception_name: string;
  explanation: string;
}

export interface DiagnosticQuestion {
  id: string;
  concept_id: string;
  class_level: string;
  subject: string;
  chapter: string;
  title: string;
  prompt: string;
  math_expression?: string;
  options?: QuestionOption[];
  expected_answer?: string;
  solution_steps?: string[];
  common_distractors?: CommonDistractor[];
}

export interface GapProbabilities {
  C1: number;
  C2: number;
  C3: number;
  C4: number;
  C5: number;
}

export interface BayesianStep {
  category: GapType;
  prior: number;
  likelihood: number;
  unnormalized_posterior: number;
  normalized_posterior: number;
}

export interface DiagnosticResult {
  primary_gap: GapType;
  candidate_gap?: GapType;
  secondary_gaps: GapType[];
  probabilities: GapProbabilities;
  verification_status: "UNVERIFIED" | "PROVISIONALLY_SUPPORTED" | "SUFFICIENTLY_SUPPORTED";
  evidence_for: string[];
  evidence_against: string[];
  is_ambiguous: boolean;
  entropy: number;
  is_correct?: boolean;
  concept_id?: string;
}

export interface TargetedFollowup {
  prompt: string;
  sub_type: string;
  options: {
    key: string;
    text: string;
    favors_gap: GapType;
    likelihood_ratio: number;
  }[];
}

export interface InterventionPayload {
  gap_type: GapType;
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

export interface ReassessmentResult {
  question_id: string;
  student_answer: string;
  is_correct: boolean;
  pre_score_correct: boolean;
  improved: boolean;
  completed_at: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  class_level: string;
  target_subject: string;
  completed_sessions: number;
  concept_mastery: Record<string, number>;
  flagged_gaps: GapType[];
}

export interface ModelMetrics {
  model_version: string;
  train_samples: number;
  test_samples: number;
  unseen_test_questions: string[];
  models: {
    logistic_regression: {
      macro_f1: number;
      per_class?: Record<string, { precision: number; recall: number; f1_score: number; support: number }>;
      confusion_matrices?: Record<string, number[][]>;
      brier_calibration_scores?: Record<string, number>;
    };
    linear_svm: {
      macro_f1: number;
    };
    rule_based_baseline: {
      macro_f1: number;
      description: string;
    };
  };
}

export interface DataQualityReport {
  status: string;
  total_records: number;
  sources: Record<string, { raw_count: number; validated_count?: number }>;
  taxonomy_label_distribution?: Record<string, number>;
  subject_distribution?: Record<string, number>;
  class_level_distribution?: Record<string, number>;
  missing_values_by_field?: Record<string, number>;
  schema_compliance_rate_pct: number;
}

// ==========================================
// Post-Lesson Class Check (Teacher & Student)
// ==========================================

export interface RosterStudent {
  id: string;
  name: string;
  has_submitted?: boolean;
}

export interface ClassCheck {
  id: string;
  code: string;
  title: string;
  class_level: string;
  subject: string;
  chapter: string;
  concept_id: string;
  question_id: string;
  question: DiagnosticQuestion;
  created_at: string;
  status: 'active' | 'closed';
  is_reteach?: boolean;
  parent_check_id?: string;
  submissions_count: number;
  total_roster_count: number;
}

export interface ClassCheckSubmission {
  id: string;
  check_id: string;
  student_id: string;
  student_name: string;
  student_answer: string;
  student_explanation: string;
  confidence: number;
  submitted_at: string;
  is_understood: boolean;
  detected_signal: {
    category: GapType | 'UNDERSTOOD';
    label: string;
    description: string;
    evidence: string;
    status: 'likely_understood' | 'possible_pattern' | 'needs_followup';
  };
  teacher_reviewed?: boolean;
  teacher_note?: string;
}

export interface ClassCheckPattern {
  id: string;
  name: string;
  frequency: number;
  percentage: number;
  evidence_description: string;
  category: GapType;
  status_label: 'Possible pattern' | 'Needs follow-up' | 'Understood';
  affected_students: string[]; // student names
}

export interface ClassCheckResults {
  check: ClassCheck;
  total_submissions: number;
  total_roster: number;
  understood_count: number;
  understood_percentage: number;
  needs_support_count: number;
  patterns: ClassCheckPattern[];
  student_submissions: ClassCheckSubmission[];
  suggested_reteach_activity: {
    title: string;
    description: string;
    partner_prompt: string;
    counterexample?: string;
  };
  has_linked_reteach: boolean;
  linked_reteach_id?: string;
}

export interface ClassCheckComparison {
  parent_check_id: string;
  reteach_check_id: string;
  concept_name: string;
  matched_students_count: number;
  pre_understood_count: number;
  post_understood_count: number;
  improved_students: string[];
  persistent_students: string[];
  summary: string;
}

// ==========================================
// COGNIVAULT Taxonomy & Longitudinal Types
// ==========================================

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
  category_name?: string;
  category_description?: string;
  subcategories: Record<string, string>;
  observable_signals: string;
  verification_prompt: string;
  repair_strategy: string;
  do_not_infer: string;
}

export type AttemptType = 'first_attempt' | 'follow_up' | 'revision' | 'transfer_check';

export type EvidenceStatus =
  | 'likely_understood'
  | 'insufficient_evidence'
  | 'explore_further'
  | 'strong_pattern_detected'
  | 'unresolved_mixed';

export type LearningWorkflowStatus =
  | 'not_started'
  | 'check_in_progress'
  | 'teacher_review'
  | 'repair_in_progress'
  | 're_tested'
  | 'transfer_achieved';

export type TeacherReviewDecision = 'confirmed' | 'corrected' | 'deferred' | 'dismissed';

export interface CandidateHypothesis {
  lg_id: string;
  lg_name: string;
  subcategory_id?: string;
  subcategory_description?: string;
  primary_category: 'C1' | 'C2' | 'C3' | 'C4' | 'C5';
  evidence_for: string[];
  evidence_against: string[];
  status: 'candidate' | 'supported' | 'contradicted' | 'unresolved';
}

export interface TeacherReviewRecord {
  reviewed: boolean;
  decision: TeacherReviewDecision;
  reviewed_at: string;
  teacher_notes?: string;
  confirmed_lg_id?: string;
  corrected_lg_id?: string;
}

export interface StudentAttemptRecord {
  id: string;
  student_id: string;
  student_name: string;
  check_id: string;
  academic_year: string;
  subject: string;
  course_variant?: string;
  chapter: string;
  concept_id: string;
  learning_outcome: string;
  question_id: string;
  question_type: 'diagnostic_initial' | 'targeted_followup' | 'transfer_check' | 'reassessment';
  question_version: string;
  student_answer: string;
  selected_option?: string;
  written_explanation?: string;
  working_steps?: string[];
  confidence?: number;
  attempt_timestamp: string;
  attempt_type: AttemptType;
  is_correct: boolean;
  is_understood: boolean;
  candidate_hypotheses: CandidateHypothesis[];
  contradicting_evidence: string[];
  teacher_review?: TeacherReviewRecord;
}

export interface SupportedPatternDetails {
  lg_id: string;
  name: string;
  subcategory_id?: string;
  subcategory_description?: string;
  primary_category: string;
  primary_category_name: string;
  observable_signals: string;
  verification_prompt: string;
  repair_strategy: string;
  do_not_infer: string;
  supporting_responses_count: number;
  evidence_summary: string;
}

export interface StudentTopicEvidenceSummary {
  student_id: string;
  student_name: string;
  concept_id: string;
  concept_name: string;
  subject: string;
  chapter: string;
  learning_outcome: string;
  academic_year: string;
  attempts_count: number;
  attempts: StudentAttemptRecord[];
  evidence_status: EvidenceStatus;
  learning_workflow_status: LearningWorkflowStatus;
  supported_pattern?: SupportedPatternDetails;
  unresolved_candidates: CandidateHypothesis[];
  transfer_achieved: boolean;
  teacher_review?: TeacherReviewRecord;
  plain_language_feedback: {
    summary: string;
    observed_evidence: string;
    suggested_next_step: string;
    repair_activity: string;
    safeguard_note: string;
  };
  teacher_reteach_recommendation: {
    title: string;
    activity: string;
    partner_discussion: string;
    counterexample: string;
    repair_strategy_reference: string;
  };
}

export interface CBSECurriculumCatalog {
  academic_year: string;
  source: string;
  total_concepts: number;
  configured_concepts_count: number;
  unconfigured_concepts_count: number;
  concepts: ConceptNode[];
  questions: DiagnosticQuestion[];
}


