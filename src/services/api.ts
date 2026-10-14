import {
  ConceptNode,
  DiagnosticQuestion,
  DiagnosticResult,
  TargetedFollowup,
  BayesianStep,
  InterventionPayload,
  ReassessmentResult,
  StudentProfile,
  ModelMetrics,
  DataQualityReport
} from '../types';

export const api = {
  async getClasses() {
    const res = await fetch('/curriculum/classes');
    if (!res.ok) throw new Error('Failed to fetch classes');
    return res.json();
  },

  async getSubjects() {
    const res = await fetch('/curriculum/subjects');
    if (!res.ok) throw new Error('Failed to fetch subjects');
    return res.json();
  },

  async getConceptGraph(): Promise<{ nodes: ConceptNode[]; edges: any[] }> {
    const res = await fetch('/curriculum/concept-graph');
    if (!res.ok) throw new Error('Failed to fetch concept graph');
    return res.json();
  },

  async getQuestions(concept_id?: string): Promise<{ total: number; questions: DiagnosticQuestion[] }> {
    const url = concept_id ? `/questions?concept_id=${encodeURIComponent(concept_id)}` : '/questions';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch questions');
    return res.json();
  },

  async startDiagnostic(student_id: string, question_id?: string): Promise<{ session_id: string; question: DiagnosticQuestion }> {
    const res = await fetch('/diagnostics/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_id, question_id })
    });
    if (!res.ok) throw new Error('Failed to start diagnostic session');
    return res.json();
  },

  async submitAnswer(
    session_id: string,
    student_answer: string,
    student_explanation: string,
    student_steps: string[],
    confidence: number
  ): Promise<{
    session_id: string;
    diagnosis: DiagnosticResult;
    requires_targeted_verification: boolean;
    targeted_followup?: TargetedFollowup;
  }> {
    const res = await fetch(`/diagnostics/${encodeURIComponent(session_id)}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_answer, student_explanation, student_steps, confidence })
    });
    if (!res.ok) throw new Error('Failed to submit answer');
    return res.json();
  },

  async submitVerification(
    session_id: string,
    option_key: string
  ): Promise<{
    session_id: string;
    verified_diagnosis: DiagnosticResult;
    bayesian_update: {
      bayesian_steps: BayesianStep[];
      confidence_delta: number;
      explanation: string;
    };
  }> {
    const res = await fetch(`/diagnostics/${encodeURIComponent(session_id)}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ option_key })
    });
    if (!res.ok) throw new Error('Failed to verify evidence');
    return res.json();
  },

  async getIntervention(session_id: string): Promise<{ intervention: InterventionPayload }> {
    const res = await fetch('/interventions/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id })
    });
    if (!res.ok) throw new Error('Failed to fetch intervention');
    return res.json();
  },

  async startReassessment(session_id: string): Promise<{ session_id: string; concept_id: string; reassessment_question: any }> {
    const res = await fetch('/reassessments/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id })
    });
    if (!res.ok) throw new Error('Failed to start reassessment');
    return res.json();
  },

  async submitReassessment(session_id: string, student_answer: string): Promise<{ session_id: string; reassessment_result: ReassessmentResult; feedback: string }> {
    const res = await fetch(`/reassessments/${encodeURIComponent(session_id)}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_answer })
    });
    if (!res.ok) throw new Error('Failed to submit reassessment');
    return res.json();
  },

  async getStudentProgress(student_id: string): Promise<{ profile: StudentProfile; recent_sessions: any[] }> {
    const res = await fetch(`/students/${encodeURIComponent(student_id)}/progress`);
    if (!res.ok) throw new Error('Failed to fetch student progress');
    return res.json();
  },

  async getModelMetrics(): Promise<ModelMetrics> {
    const res = await fetch('/model/metrics');
    if (!res.ok) throw new Error('Failed to fetch model metrics');
    return res.json();
  },

  async getDataQualityReport(): Promise<DataQualityReport> {
    const res = await fetch('/data/quality-report');
    if (!res.ok) throw new Error('Failed to fetch data quality report');
    return res.json();
  },

  async getTeacherAnalytics(): Promise<any> {
    const res = await fetch('/teacher/analytics');
    if (!res.ok) throw new Error('Failed to fetch teacher analytics');
    return res.json();
  },

  async submitTeacherReview(session_id: string, teacher_confirmed_gap: string, teacher_notes: string): Promise<any> {
    const res = await fetch('/teacher/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id, teacher_confirmed_gap, teacher_notes })
    });
    if (!res.ok) throw new Error('Failed to submit teacher review');
    return res.json();
  },

  // ==========================================
  // Post-Lesson Class Check Client Methods
  // ==========================================

  async getClassChecks(): Promise<{ checks: import('../types').ClassCheck[] }> {
    const res = await fetch('/class-checks');
    if (!res.ok) throw new Error('Failed to fetch class checks');
    return res.json();
  },

  async createClassCheck(payload: {
    title: string;
    class_level: string;
    subject: string;
    chapter: string;
    concept_id: string;
    question_id: string;
  }): Promise<{ check: import('../types').ClassCheck }> {
    const res = await fetch('/class-checks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create class check');
    return res.json();
  },

  async getClassCheck(id: string): Promise<{ check: import('../types').ClassCheck }> {
    const res = await fetch(`/class-checks/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Failed to fetch class check');
    return res.json();
  },

  async getClassCheckRoster(id: string): Promise<{ roster: import('../types').RosterStudent[] }> {
    const res = await fetch(`/class-checks/${encodeURIComponent(id)}/roster`);
    if (!res.ok) throw new Error('Failed to fetch check roster');
    return res.json();
  },

  async submitClassCheckAnswer(
    id: string,
    payload: {
      student_id: string;
      student_name: string;
      student_answer: string;
      student_explanation: string;
      confidence: number;
    }
  ): Promise<{ success: boolean; submission_id: string; message: string }> {
    const res = await fetch(`/class-checks/${encodeURIComponent(id)}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to submit class check response');
    return res.json();
  },

  async getClassCheckResults(id: string): Promise<{ results: import('../types').ClassCheckResults }> {
    const res = await fetch(`/class-checks/${encodeURIComponent(id)}/results`);
    if (!res.ok) throw new Error('Failed to fetch class check results');
    return res.json();
  },

  async reviewClassCheckSubmission(
    id: string,
    submission_id: string,
    teacher_note?: string,
    teacher_reviewed: boolean = true
  ): Promise<{ success: boolean; submission: any }> {
    const res = await fetch(`/class-checks/${encodeURIComponent(id)}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission_id, teacher_note, teacher_reviewed })
    });
    if (!res.ok) throw new Error('Failed to submit review');
    return res.json();
  },

  async createReteachCheck(id: string): Promise<{ reteach_check: import('../types').ClassCheck }> {
    const res = await fetch(`/class-checks/${encodeURIComponent(id)}/reteach-check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to create reteach check');
    return res.json();
  },

  async getClassCheckComparison(id: string): Promise<{ comparison: import('../types').ClassCheckComparison }> {
    const res = await fetch(`/class-checks/${encodeURIComponent(id)}/comparison`);
    if (!res.ok) throw new Error('Failed to fetch comparison');
    return res.json();
  },

  // ==========================================
  // COGNIVAULT Taxonomy & Longitudinal Evidence
  // ==========================================

  async getTaxonomy(): Promise<{
    primary_categories: Record<string, import('../types').PrimaryCategoryInfo>;
    taxonomy: Record<string, import('../types').TaxonomyEntry>;
    total_entries: number;
    version: string;
    scope: string;
  }> {
    const res = await fetch('/api/taxonomy');
    if (!res.ok) throw new Error('Failed to fetch COGNIVAULT taxonomy');
    return res.json();
  },

  async getTaxonomyEntry(id: string): Promise<{ entry: import('../types').TaxonomyEntry }> {
    const res = await fetch(`/api/taxonomy/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`Failed to fetch taxonomy entry ${id}`);
    return res.json();
  },

  async getCBSE10Curriculum(): Promise<import('../types').CBSECurriculumCatalog> {
    const res = await fetch('/api/curriculum/cbse10');
    if (!res.ok) throw new Error('Failed to fetch CBSE curriculum catalog');
    return res.json();
  },

  async getStudentEvidence(
    studentId: string,
    conceptId: string
  ): Promise<{ evidence: import('../types').StudentTopicEvidenceSummary }> {
    const res = await fetch(`/api/evidence/student/${encodeURIComponent(studentId)}/concept/${encodeURIComponent(conceptId)}`);
    if (!res.ok) throw new Error('Failed to fetch student evidence summary');
    return res.json();
  },

  async getClassConceptEvidence(
    conceptId: string
  ): Promise<{
    concept: import('../types').ConceptNode;
    total_students_tracked: number;
    transfer_achieved_count: number;
    understood_count: number;
    strong_pattern_count: number;
    insufficient_evidence_count: number;
    supported_patterns_distribution: Record<string, number>;
    students_evidence: import('../types').StudentTopicEvidenceSummary[];
  }> {
    const res = await fetch(`/api/evidence/concept/${encodeURIComponent(conceptId)}/class`);
    if (!res.ok) throw new Error('Failed to fetch class concept evidence');
    return res.json();
  },

  async recordAttempt(payload: {
    student_id: string;
    student_name: string;
    check_id?: string;
    concept_id: string;
    question_id: string;
    question_type?: 'diagnostic_initial' | 'targeted_followup' | 'transfer_check' | 'reassessment';
    student_answer: string;
    selected_option?: string;
    written_explanation?: string;
    working_steps?: string[];
    confidence?: number;
    attempt_type?: import('../types').AttemptType;
  }): Promise<{
    success: boolean;
    record: import('../types').StudentAttemptRecord;
    evidence: import('../types').StudentTopicEvidenceSummary;
  }> {
    const res = await fetch('/api/evidence/attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to record student attempt');
    return res.json();
  },

  async submitTeacherEvidenceReview(payload: {
    student_id: string;
    concept_id: string;
    decision: import('../types').TeacherReviewDecision;
    teacher_notes?: string;
    confirmed_lg_id?: string;
    corrected_lg_id?: string;
  }): Promise<{
    success: boolean;
    evidence: import('../types').StudentTopicEvidenceSummary;
  }> {
    const res = await fetch('/api/evidence/teacher-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to record teacher review');
    return res.json();
  },

  async resetDemoEvidence(): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/evidence/reset-demo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to reset demo evidence');
    return res.json();
  }
};
