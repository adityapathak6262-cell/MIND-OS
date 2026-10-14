import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { CONCEPT_GRAPH, DIAGNOSTIC_QUESTIONS } from './backend/app/curriculum/data.ts';
import type { DiagnosticQuestion } from './backend/app/curriculum/data.ts';
import { updateBeliefWithEvidence, computeShannonEntropy } from './backend/app/verification/bayesian.ts';
import type { GapProbabilities } from './backend/app/verification/bayesian.ts';
import { generateIntervention } from './backend/app/interventions/engine.ts';
import { COGNIVAULT_TAXONOMY, PRIMARY_CATEGORIES } from './backend/app/curriculum/cognivault_taxonomy.ts';
import {
  recordStudentAttempt,
  evaluateStudentTopicEvidence,
  recordTeacherReview,
  resetLongitudinalData,
  getConceptClassEvidenceSummary
} from './backend/app/evidence/longitudinal_engine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory persistent stores for sessions and student progress
interface DiagnosticSession {
  id: string;
  student_id: string;
  student_name: string;
  question_id: string;
  concept_id: string;
  started_at: string;
  question: DiagnosticQuestion;
  student_answer?: string;
  student_explanation?: string;
  student_steps?: string[];
  reported_confidence?: number;
  initial_diagnosis?: {
    primary_gap: keyof GapProbabilities;
    candidate_gap?: keyof GapProbabilities;
    secondary_gaps: (keyof GapProbabilities)[];
    probabilities: GapProbabilities;
    verification_status: "UNVERIFIED" | "PROVISIONALLY_SUPPORTED" | "SUFFICIENTLY_SUPPORTED";
    evidence_for: string[];
    evidence_against: string[];
    is_ambiguous: boolean;
    entropy: number;
    is_correct?: boolean;
    concept_id?: string;
  };
  followup_evidence?: {
    option_key: string;
    option_text: string;
    favors_gap: keyof GapProbabilities;
    likelihood_ratio: number;
    submitted_at: string;
  };
  verified_diagnosis?: {
    primary_gap: keyof GapProbabilities;
    candidate_gap?: keyof GapProbabilities;
    secondary_gaps: (keyof GapProbabilities)[];
    probabilities: GapProbabilities;
    verification_status: "UNVERIFIED" | "PROVISIONALLY_SUPPORTED" | "SUFFICIENTLY_SUPPORTED";
    evidence_for: string[];
    evidence_against: string[];
    is_ambiguous: boolean;
    entropy: number;
    explanation: string;
    bayesian_steps: any[];
    concept_id?: string;
  };
  reassessment?: {
    question_id: string;
    student_answer: string;
    is_correct: boolean;
    pre_score_correct: boolean;
    improved: boolean;
    completed_at: string;
  };
  teacher_reviewed?: boolean;
  teacher_note?: string;
}

const sessions = new Map<string, DiagnosticSession>();
const studentProfiles = new Map<string, any>();

// Initialize a demo student
studentProfiles.set("STD-101", {
  id: "STD-101",
  name: "Aarav Sharma",
  class_level: "Class 7",
  target_subject: "Mathematics",
  completed_sessions: 2,
  concept_mastery: {
    "MATH-FACTORS-MULTIPLES": 0.85,
    "MATH-FRAC-PARTS": 0.80,
    "MATH-FRAC-EQUIV": 0.65,
    "MATH-FRAC-ADD-DIFF-DENOM": 0.35,
    "MATH-ALG-LIKE-TERMS": 0.75,
    "MATH-ALG-LINEAR-EQ": 0.50
  },
  flagged_gaps: ["C4", "C3"]
});

// Keep diagnosis tied to the active question. The tiny text model performed poorly
// on held-out items, so it must not override explicit distractor evidence.
function executeDiagnosis(
  question: DiagnosticQuestion,
  studentAnswer: string,
  studentExplanation: string,
  studentSteps: string[] = []
): any {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9./=+-]/g, '').replace(/\s+/g, '');
  const answer = normalize(studentAnswer || '');
  const explanation = [studentExplanation || '', ...studentSteps].join(' ').toLowerCase();
  const options = question.options || [];
  const matchedOption = options.find((option) => {
    const key = normalize(option.key);
    const text = normalize(option.text);
    return answer === key || answer === text || (text.length > 2 && answer.includes(text));
  });
  const expected = normalize(question.expected_answer || '');
  const correctOption = options.find((option) => !option.indicates_gap);
  const answerIsCorrect = (!!expected && (answer === expected || (expected.length > 3 && answer.includes(expected)))) ||
    (!!correctOption && (answer === normalize(correctOption.key) || answer === normalize(correctOption.text)));

  let gap: keyof GapProbabilities | undefined;
  let signal = '';
  if (question.concept_id === 'MATH-FRAC-ADD-DIFF-DENOM') {
    if (/\b(top|numerator)\b/.test(explanation) && /\b(bottom|denominator)\b/.test(explanation) && /\b(add|added|adding|plus|sum)\b/.test(explanation)) {
      gap = 'C4'; signal = 'The explanation says the numerator and denominator were added separately.';
    } else if (/common denominator|lcm|sixths/.test(explanation) && /2\/6|2\/12/.test(answer + explanation)) {
      gap = 'C3'; signal = 'The explanation identifies a common denominator but does not scale both numerators.';
    }
  } else if (question.concept_id === 'MATH-ALG-LINEAR-EQ' && (/29\/3|9\.67/.test(answer) || /added 7|22\s*\+\s*7/.test(explanation))) {
    gap = 'C3'; signal = 'The response adds 7 to 22 when isolating the variable.';
  } else if (question.concept_id === 'SCI-ELEC-SERIES-CIRCUITS' && /uses? up|consum(ed|es)|less current|fresh current/.test(explanation)) {
    gap = 'C4'; signal = 'The explanation describes current as being used up by the first bulb.';
  }
  if (!gap && !answerIsCorrect && matchedOption?.indicates_gap) {
    gap = matchedOption.indicates_gap as keyof GapProbabilities;
    signal = `The response matches option ${matchedOption.key}: “${matchedOption.text}”.`;
  }
  const isCorrect = answerIsCorrect && !gap;

  // Keep an uninformative prior until follow-up evidence arrives; 0.6/0.1 values
  // would look calibrated even though they are only hand-authored heuristics.
  const probs: GapProbabilities = { C1: 0.2, C2: 0.2, C3: 0.2, C4: 0.2, C5: 0.2 };
  const entropy = computeShannonEntropy(probs);

  return {
    primary_gap: gap || 'C1',
    candidate_gap: gap,
    secondary_gaps: [],
    probabilities: probs,
    entropy: Math.round(entropy * 100) / 100,
    is_ambiguous: true,
    verification_status: 'UNVERIFIED',
    is_correct: isCorrect,
    evidence_for: isCorrect
      ? [`The submitted response matches the expected answer for “${question.title}”. No learning-gap hypothesis was raised.`]
      : gap
        ? [signal, studentSteps.length > 0
            ? `Observed working: “${studentSteps.join(' → ')}”.`
            : `Observed answer: “${studentAnswer}”.`]
        : [`The answer “${studentAnswer}” does not match the expected answer, but it does not match a supported misconception pattern for this question.`],
    evidence_against: gap ? ['One response is not enough to confirm a persistent learning pattern.'] : []
  };
}

// REST Endpoints

// GET /health
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    product: 'MIND-OS',
    version: '1.2.0',
    curriculum_concepts_count: CONCEPT_GRAPH.length,
    diagnostic_questions_count: DIAGNOSTIC_QUESTIONS.length,
    timestamp: new Date().toISOString()
  });
});

// GET /curriculum/classes
app.get('/curriculum/classes', (_req, res) => {
  res.json({
    classes: [
      { id: 'Class 6', label: 'CBSE Class 6 (Middle School Foundation)' },
      { id: 'Class 7', label: 'CBSE Class 7 (Intermediate Rational Operations)' },
      { id: 'Class 8', label: 'CBSE Class 8 (Pre-Algebra & Exponents)' },
      { id: 'Class 9', label: 'CBSE Class 9 (Deductive Geometry & Polynomials)' },
      { id: 'Class 10', label: 'CBSE Class 10 (Secondary Physics & Real Numbers)' }
    ]
  });
});

// GET /curriculum/subjects
app.get('/curriculum/subjects', (_req, res) => {
  res.json({
    subjects: [
      {
        id: 'Mathematics',
        name: 'Mathematics',
        chapters: [
          'Fractions and Decimals',
          'Linear Equations in One Variable',
          'Playing with Numbers',
          'Rational Numbers'
        ],
        concept_count: 6
      },
      {
        id: 'Science',
        name: 'Science (Physics Focus)',
        chapters: [
          'Electricity',
          'Light - Reflection and Refraction'
        ],
        concept_count: 3
      }
    ]
  });
});

// GET /curriculum/concept-graph
app.get('/curriculum/concept-graph', (_req, res) => {
  res.json({
    nodes: CONCEPT_GRAPH,
    edges: CONCEPT_GRAPH.flatMap((node) =>
      node.prerequisites.map((prereq) => ({
        source: prereq,
        target: node.id,
        relationship: 'prerequisite_of'
      }))
    )
  });
});

// GET /questions
app.get('/questions', (req, res) => {
  const { concept_id, class_level, subject } = req.query;
  let filtered = DIAGNOSTIC_QUESTIONS;

  if (concept_id) {
    filtered = filtered.filter((q) => q.concept_id === concept_id);
  }
  if (class_level) {
    filtered = filtered.filter((q) => q.class_level === class_level);
  }
  if (subject) {
    filtered = filtered.filter((q) => q.subject === subject);
  }

  res.json({
    total: filtered.length,
    questions: filtered.map((q) => ({
      id: q.id,
      concept_id: q.concept_id,
      class_level: q.class_level,
      subject: q.subject,
      chapter: q.chapter,
      title: q.title,
      prompt: q.prompt,
      math_expression: q.math_expression,
      options: q.options
    }))
  });
});

// POST /diagnostics/start
app.post('/diagnostics/start', (req, res) => {
  const { student_id = 'STD-101', student_name = 'Aarav Sharma', question_id } = req.body;
  const question = DIAGNOSTIC_QUESTIONS.find((q) => q.id === question_id) || DIAGNOSTIC_QUESTIONS[0];

  const session_id = `SES-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const session: DiagnosticSession = {
    id: session_id,
    student_id,
    student_name,
    question_id: question.id,
    concept_id: question.concept_id,
    started_at: new Date().toISOString(),
    question
  };

  sessions.set(session_id, session);

  res.json({
    session_id,
    student_id,
    question: {
      id: question.id,
      concept_id: question.concept_id,
      class_level: question.class_level,
      subject: question.subject,
      chapter: question.chapter,
      title: question.title,
      prompt: question.prompt,
      math_expression: question.math_expression,
      options: question.options
    }
  });
});

// POST /diagnostics/:session_id/answer
app.post('/diagnostics/:session_id/answer', async (req, res) => {
  const { session_id } = req.params;
  const { student_answer, student_explanation = '', student_steps = [], confidence = 3 } = req.body;

  const session = sessions.get(session_id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  session.student_answer = student_answer;
  session.student_explanation = student_explanation;
  session.student_steps = student_steps;
  session.reported_confidence = confidence;

  // Use the active question's answer key and distractor map; the text model is
  // excluded until its held-out performance is strong enough to trust.
  const diagResult: any = executeDiagnosis(session.question, student_answer, student_explanation, student_steps);

  session.initial_diagnosis = {
    primary_gap: diagResult.primary_gap,
    candidate_gap: diagResult.candidate_gap,
    secondary_gaps: diagResult.secondary_gaps || [],
    probabilities: diagResult.probabilities,
    verification_status: diagResult.verification_status,
    evidence_for: diagResult.evidence_for || [],
    evidence_against: diagResult.evidence_against || [],
    is_ambiguous: diagResult.is_ambiguous || false,
    entropy: diagResult.entropy || 1.8,
    is_correct: diagResult.is_correct,
    concept_id: session.concept_id
  };

  res.json({
    session_id,
    diagnosis: session.initial_diagnosis,
    requires_targeted_verification: !diagResult.is_correct,
    targeted_followup: !diagResult.is_correct ? session.question.targeted_followup : undefined
  });
});

// POST /diagnostics/:session_id/verify
app.post('/diagnostics/:session_id/verify', (req, res) => {
  const { session_id } = req.params;
  const { option_key } = req.body;

  const session = sessions.get(session_id);
  if (!session || !session.initial_diagnosis) {
    res.status(404).json({ error: 'Session or initial diagnosis not found' });
    return;
  }

  const followupOption = session.question.targeted_followup.options.find((o) => o.key === option_key);
  if (!followupOption) {
    res.status(400).json({ error: 'Invalid follow-up option selected' });
    return;
  }

  session.followup_evidence = {
    option_key: followupOption.key,
    option_text: followupOption.text,
    favors_gap: followupOption.favors_gap,
    likelihood_ratio: followupOption.likelihood_ratio,
    submitted_at: new Date().toISOString()
  };

  // Perform Bayesian Evidence Update
  const updateResult = updateBeliefWithEvidence(
    session.initial_diagnosis.probabilities,
    followupOption.favors_gap,
    followupOption.likelihood_ratio
  );

  session.verified_diagnosis = {
    primary_gap: updateResult.primary_gap,
    candidate_gap: updateResult.primary_gap,
    secondary_gaps: updateResult.secondary_gaps,
    probabilities: updateResult.updated_probabilities,
    verification_status: updateResult.verification_status,
    evidence_for: [
      ...(session.initial_diagnosis.evidence_for || []),
      `The selected follow-up response favors candidate ${updateResult.primary_gap} (configured likelihood ratio: ${followupOption.likelihood_ratio}x).`
    ],
    evidence_against: [
      ...(session.initial_diagnosis.evidence_against || []),
      'Other explanations may still be possible; teacher review remains available.'
    ],
    is_ambiguous: false,
    entropy: updateResult.entropy,
    explanation: updateResult.explanation,
    bayesian_steps: updateResult.bayesian_steps,
    concept_id: session.concept_id
  };

  res.json({
    session_id,
    verified_diagnosis: session.verified_diagnosis,
    bayesian_update: updateResult
  });
});

// POST /interventions/recommend
app.post('/interventions/recommend', (req, res) => {
  const { session_id, gap_type, concept_id } = req.body;
  let targetGap = gap_type;
  let targetConcept = concept_id;

  if (session_id) {
    const session = sessions.get(session_id);
    if (session) {
      targetGap = session.verified_diagnosis?.primary_gap || session.initial_diagnosis?.primary_gap || 'C4';
      targetConcept = session.concept_id;
    }
  }

  const intervention = generateIntervention(targetGap || 'C4', targetConcept || 'MATH-FRAC-ADD-DIFF-DENOM');
  res.json({
    session_id,
    intervention
  });
});

// POST /reassessments/start
app.post('/reassessments/start', (req, res) => {
  const { session_id } = req.body;
  const session = sessions.get(session_id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  res.json({
    session_id,
    concept_id: session.concept_id,
    reassessment_question: session.question.reassessment_question
  });
});

// POST /reassessments/:session_id/submit
app.post('/reassessments/:session_id/submit', (req, res) => {
  const { session_id } = req.params;
  const { student_answer } = req.body;

  const session = sessions.get(session_id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  const expected = session.question.reassessment_question.expected_answer.toLowerCase().trim();
  const actual = (student_answer || '').toLowerCase().trim();
  const isCorrect = actual.includes(expected) || actual === expected;
  const preScoreCorrect = session.student_answer?.toLowerCase().trim() === session.question.expected_answer.toLowerCase().trim();

  session.reassessment = {
    question_id: session.question.reassessment_question.id,
    student_answer,
    is_correct: isCorrect,
    pre_score_correct: preScoreCorrect,
    improved: isCorrect && !preScoreCorrect,
    completed_at: new Date().toISOString()
  };

  // Update student profile mastery
  const profile = studentProfiles.get(session.student_id);
  if (profile) {
    const currentMastery = profile.concept_mastery[session.concept_id] || 0.4;
    profile.concept_mastery[session.concept_id] = isCorrect
      ? Math.min(0.95, currentMastery + 0.35)
      : Math.max(0.15, currentMastery - 0.1);
    profile.completed_sessions = (profile.completed_sessions || 0) + 1;
  }

  res.json({
    session_id,
    reassessment_result: session.reassessment,
    feedback: isCorrect
      ? 'Congratulations! You successfully transferred the concept to a new problem.'
      : 'The error pattern persisted. We recommend reviewing the prerequisite concepts.'
  });
});

// GET /students/:student_id/progress
app.get('/students/:student_id/progress', (req, res) => {
  const { student_id } = req.params;
  const profile = studentProfiles.get(student_id) || {
    id: student_id,
    name: 'Student',
    class_level: 'Class 7',
    concept_mastery: {
      'MATH-FRAC-PARTS': 0.70,
      'MATH-FRAC-EQUIV': 0.60,
      'MATH-FRAC-ADD-DIFF-DENOM': 0.40
    },
    completed_sessions: 0,
    flagged_gaps: ['C4']
  };

  const studentSessions = Array.from(sessions.values()).filter((s) => s.student_id === student_id);

  res.json({
    profile,
    recent_sessions: studentSessions.map((s) => ({
      id: s.id,
      question_title: s.question.title,
      concept_id: s.concept_id,
      started_at: s.started_at,
      primary_gap: s.verified_diagnosis?.primary_gap || s.initial_diagnosis?.primary_gap,
      reassessment_improved: s.reassessment?.improved
    }))
  });
});

// GET /model/metrics
app.get('/model/metrics', (_req, res) => {
  const metricsPath = path.join(__dirname, 'ml', 'artefacts', 'evaluation_metrics.json');
  if (fs.existsSync(metricsPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(metricsPath, 'utf-8'));
      res.json(data);
      return;
    } catch (e) {
      // fallback
    }
  }

  res.status(503).json({ error: 'Evaluation artifact is unavailable.' });
});

// GET /data/quality-report
app.get('/data/quality-report', (_req, res) => {
  const reportPath = path.join(__dirname, 'data', 'processed', 'data_quality_report.json');
  if (fs.existsSync(reportPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
      res.json(data);
      return;
    } catch (e) {
      // fallback
    }
  }

  res.status(503).json({ error: 'Data quality report is unavailable.' });
});

// GET /teacher/analytics
app.get('/teacher/analytics', (_req, res) => {
  const allSessions = Array.from(sessions.values());
  const gapCounts = { C1: 0, C2: 0, C3: 0, C4: 0, C5: 0 };
  allSessions.forEach((s) => {
    const p = s.verified_diagnosis?.primary_gap;
    if (p) gapCounts[p] = (gapCounts[p] || 0) + 1;
  });

  const reviewQueue = allSessions
    .filter((s) => s.initial_diagnosis?.is_ambiguous && !s.initial_diagnosis?.is_correct && !s.teacher_reviewed)
    .map((s) => ({
      session_id: s.id,
      student_id: s.student_id,
      student_name: s.student_name,
      question_title: s.question.title,
      student_answer: s.student_answer,
      student_explanation: s.student_explanation,
      probabilities: s.initial_diagnosis?.probabilities,
      entropy: s.initial_diagnosis?.entropy
    }));

  const topGap = Object.entries(gapCounts).sort((a, b) => b[1] - a[1])[0];
  const gapNames: Record<string, string> = {
    C1: 'Underlying concept model', C2: 'Logical deduction', C3: 'Procedural accuracy',
    C4: 'Systematic misconception', C5: 'Formula and recall'
  };

  res.json({
    total_diagnostics_run: allSessions.length,
    active_class: 'Class 7 - Mathematics',
    learning_gap_distribution: gapCounts,
    most_prevalent_misconception: topGap && topGap[1] > 0 ? gapNames[topGap[0]] : 'No verified pattern yet',
    review_queue: reviewQueue
  });
});

// POST /teacher/review
app.post('/teacher/review', (req, res) => {
  const { session_id, teacher_confirmed_gap, teacher_notes } = req.body;
  const session = sessions.get(session_id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  session.teacher_reviewed = true;
  session.teacher_note = teacher_notes;
  if (teacher_confirmed_gap && session.verified_diagnosis) {
    session.verified_diagnosis.primary_gap = teacher_confirmed_gap;
    session.verified_diagnosis.verification_status = 'SUFFICIENTLY_SUPPORTED';
  }

  res.json({ success: true, session_id, reviewed_at: new Date().toISOString() });
});

// ==========================================
// Post-Lesson Class Check Backend Engine
// ==========================================

const DEMO_ROSTER: { id: string; name: string }[] = [
  { id: 'STD-101', name: 'Aarav Sharma' },
  { id: 'STD-102', name: 'Diya Patel' },
  { id: 'STD-103', name: 'Rohan Gupta' },
  { id: 'STD-104', name: 'Priya Patel' },
  { id: 'STD-105', name: 'Ananya Singh' },
  { id: 'STD-106', name: 'Kabir Verma' },
  { id: 'STD-107', name: 'Meera Nair' },
  { id: 'STD-108', name: 'Vihaan Joshi' }
];

interface StoredClassCheck {
  id: string;
  code: string;
  title: string;
  class_level: string;
  subject: string;
  chapter: string;
  concept_id: string;
  question_id: string;
  created_at: string;
  status: 'active' | 'closed';
  is_reteach: boolean;
  parent_check_id?: string;
}

interface StoredSubmission {
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
    category: string;
    label: string;
    description: string;
    evidence: string;
    status: 'likely_understood' | 'possible_pattern' | 'needs_followup';
  };
  teacher_reviewed?: boolean;
  teacher_note?: string;
}

const classChecks = new Map<string, StoredClassCheck>();
const classSubmissions = new Map<string, StoredSubmission[]>();

// Helper to analyze a student response against a question's expected answer and distractors
function analyzeQuizResponse(question: DiagnosticQuestion, answer: string, explanation: string = '') {
  const result = executeDiagnosis(question, answer, explanation);
  if (result.is_correct) {
    return {
      is_understood: true,
      category: 'UNDERSTOOD',
      label: 'Answer matches the key',
      description: 'The final answer matches the expected answer. Review the written reasoning separately when it is available.',
      evidence: result.evidence_for.join(' '),
      status: 'likely_understood' as const
    };
  }
  return {
    is_understood: false,
    category: result.candidate_gap || 'UNRESOLVED',
    label: result.candidate_gap ? 'Candidate pattern · follow-up needed' : 'Unresolved · needs teacher review',
    description: result.evidence_for[0] || 'This response does not match a supported pattern for this question.',
    evidence: result.evidence_for.join(' '),
    status: 'needs_followup' as const
  };
}

// Seed Initial Post-Lesson Class Check: Class 7 Fractions Exit Ticket
const SEED_CHECK_1: StoredClassCheck = {
  id: 'CHK-DEMO-01',
  code: 'FRAC-7A',
  title: 'Exit Ticket: Adding Unlike Fractions (1/2 + 1/3)',
  class_level: 'Class 7',
  subject: 'Mathematics',
  chapter: 'Fractions and Decimals',
  concept_id: 'MATH-FRAC-ADD-DIFF-DENOM',
  question_id: 'Q-FRAC-01',
  created_at: new Date(Date.now() - 7200000).toISOString(),
  status: 'active',
  is_reteach: false
};
classChecks.set(SEED_CHECK_1.id, SEED_CHECK_1);

// Seed 6 real student submissions for this check (with Meera and Vihaan remaining to submit)
const SEED_SUBMISSIONS_1: StoredSubmission[] = [
  {
    id: 'SUB-01',
    check_id: 'CHK-DEMO-01',
    student_id: 'STD-101',
    student_name: 'Aarav Sharma',
    student_answer: '5/6',
    student_explanation: 'Converted 1/2 into 3/6 and 1/3 into 2/6. Added 3/6 + 2/6 = 5/6.',
    confidence: 5,
    submitted_at: new Date(Date.now() - 5400000).toISOString(),
    is_understood: true,
    detected_signal: {
      category: 'UNDERSTOOD',
      label: 'Appears Understood',
      description: 'Response matches target principle and accurate calculation.',
      evidence: 'Correct answer 5/6 with proper LCM common denominator scaling steps.',
      status: 'likely_understood'
    },
    teacher_reviewed: true,
    teacher_note: 'Demonstrates solid mastery of common denominators.'
  },
  {
    id: 'SUB-02',
    check_id: 'CHK-DEMO-01',
    student_id: 'STD-102',
    student_name: 'Diya Patel',
    student_answer: '5/6',
    student_explanation: 'LCM of 2 and 3 is 6. So 3/6 + 2/6 = 5/6.',
    confidence: 4,
    submitted_at: new Date(Date.now() - 4800000).toISOString(),
    is_understood: true,
    detected_signal: {
      category: 'UNDERSTOOD',
      label: 'Appears Understood',
      description: 'Response matches target principle and accurate calculation.',
      evidence: 'Correct answer 5/6 with accurate step notes.',
      status: 'likely_understood'
    }
  },
  {
    id: 'SUB-03',
    check_id: 'CHK-DEMO-01',
    student_id: 'STD-103',
    student_name: 'Rohan Gupta',
    student_answer: '2/5',
    student_explanation: 'I added 1+1 on top to get 2, and 2+3 on the bottom to get 5.',
    confidence: 4,
    submitted_at: new Date(Date.now() - 4200000).toISOString(),
    is_understood: false,
    detected_signal: {
      category: 'C4',
      label: 'Possible Misconception: Added tops and bottoms directly across',
      description: 'Student response suggests treating numerators and denominators as independent whole numbers (1/2 + 1/3 = 2/5).',
      evidence: 'Selected/wrote 2/5. Explicitly confirmed adding 1+1 and 2+3.',
      status: 'possible_pattern'
    }
  },
  {
    id: 'SUB-04',
    check_id: 'CHK-DEMO-01',
    student_id: 'STD-104',
    student_name: 'Priya Patel',
    student_answer: '2/5',
    student_explanation: '1 piece plus 1 piece is 2 slices out of 5 slices total.',
    confidence: 3,
    submitted_at: new Date(Date.now() - 3600000).toISOString(),
    is_understood: false,
    detected_signal: {
      category: 'C4',
      label: 'Possible Misconception: Added tops and bottoms directly across',
      description: 'Student response suggests treating numerators and denominators as independent whole numbers (1/2 + 1/3 = 2/5).',
      evidence: 'Answer 2/5 with whole-number piece summation model.',
      status: 'possible_pattern'
    }
  },
  {
    id: 'SUB-05',
    check_id: 'CHK-DEMO-01',
    student_id: 'STD-105',
    student_name: 'Ananya Singh',
    student_answer: '2/6',
    student_explanation: 'Common denominator is 6, so I added the top numbers 1 + 1 = 2.',
    confidence: 3,
    submitted_at: new Date(Date.now() - 3000000).toISOString(),
    is_understood: false,
    detected_signal: {
      category: 'C3',
      label: 'Possible Step Slip: Found common denominator but unscaled numerators',
      description: 'Student correctly identified common denominator 6, but simply added numerators without multiplying by equivalence factors.',
      evidence: 'Answer 2/6. Common denominator correct, numerator scaling omitted.',
      status: 'possible_pattern'
    }
  },
  {
    id: 'SUB-06',
    check_id: 'CHK-DEMO-01',
    student_id: 'STD-106',
    student_name: 'Kabir Verma',
    student_answer: '2/5',
    student_explanation: 'Added both top and bottom.',
    confidence: 4,
    submitted_at: new Date(Date.now() - 2400000).toISOString(),
    is_understood: false,
    detected_signal: {
      category: 'C4',
      label: 'Possible Misconception: Added tops and bottoms directly across',
      description: 'Student response suggests treating numerators and denominators as independent whole numbers (1/2 + 1/3 = 2/5).',
      evidence: 'Answer 2/5. Followed "add across" rule.',
      status: 'possible_pattern'
    }
  }
];
classSubmissions.set(SEED_CHECK_1.id, SEED_SUBMISSIONS_1);

// Seed Linked Reteach Check (Isomorphic check on 1/4 + 1/3)
const SEED_CHECK_RETEACH: StoredClassCheck = {
  id: 'CHK-DEMO-01-RETEACH',
  code: 'FRAC-7B',
  title: 'Follow-Up Check: Transfer on Unlike Fractions (1/4 + 1/3)',
  class_level: 'Class 7',
  subject: 'Mathematics',
  chapter: 'Fractions and Decimals',
  concept_id: 'MATH-FRAC-ADD-DIFF-DENOM',
  question_id: 'Q-FRAC-01-REASSESS',
  created_at: new Date(Date.now() - 1800000).toISOString(),
  status: 'active',
  is_reteach: true,
  parent_check_id: 'CHK-DEMO-01'
};
classChecks.set(SEED_CHECK_RETEACH.id, SEED_CHECK_RETEACH);

// Seed post-reteach submissions showing genuine improvement for Rohan and Priya
const SEED_SUBMISSIONS_RETEACH: StoredSubmission[] = [
  {
    id: 'SUB-R01',
    check_id: 'CHK-DEMO-01-RETEACH',
    student_id: 'STD-101',
    student_name: 'Aarav Sharma',
    student_answer: '7/12',
    student_explanation: '1/4 is 3/12 and 1/3 is 4/12. 3/12 + 4/12 = 7/12.',
    confidence: 5,
    submitted_at: new Date(Date.now() - 1500000).toISOString(),
    is_understood: true,
    detected_signal: {
      category: 'UNDERSTOOD',
      label: 'Appears Understood',
      description: 'Response matches target principle.',
      evidence: 'Correct 7/12 with equivalent sixths/twelfths scaling.',
      status: 'likely_understood'
    }
  },
  {
    id: 'SUB-R02',
    check_id: 'CHK-DEMO-01-RETEACH',
    student_id: 'STD-103',
    student_name: 'Rohan Gupta',
    student_answer: '7/12',
    student_explanation: 'After seeing the pizza model, I knew 2/7 was wrong. 3/12 + 4/12 = 7/12.',
    confidence: 4,
    submitted_at: new Date(Date.now() - 1200000).toISOString(),
    is_understood: true,
    detected_signal: {
      category: 'UNDERSTOOD',
      label: 'Appears Understood',
      description: 'Correct calculation following visual model intervention.',
      evidence: 'Shifted from 2/5 to 7/12 with valid common denominator rationale.',
      status: 'likely_understood'
    }
  },
  {
    id: 'SUB-R03',
    check_id: 'CHK-DEMO-01-RETEACH',
    student_id: 'STD-104',
    student_name: 'Priya Patel',
    student_answer: '7/12',
    student_explanation: 'Converted both to 12ths: 3/12 and 4/12.',
    confidence: 4,
    submitted_at: new Date(Date.now() - 900000).toISOString(),
    is_understood: true,
    detected_signal: {
      category: 'UNDERSTOOD',
      label: 'Appears Understood',
      description: 'Proper equivalence scaling demonstrated.',
      evidence: 'Correct solution 7/12.',
      status: 'likely_understood'
    }
  },
  {
    id: 'SUB-R04',
    check_id: 'CHK-DEMO-01-RETEACH',
    student_id: 'STD-106',
    student_name: 'Kabir Verma',
    student_answer: '2/7',
    student_explanation: '1+1=2, 4+3=7.',
    confidence: 3,
    submitted_at: new Date(Date.now() - 600000).toISOString(),
    is_understood: false,
    detected_signal: {
      category: 'C4',
      label: 'Possible Misconception: Added tops and bottoms directly across',
      description: 'Pattern persisted on reassessment. 1-on-1 concrete fractional manipulative practice recommended.',
      evidence: 'Answer 2/7 matches add-across pattern.',
      status: 'needs_followup'
    }
  }
];
classSubmissions.set(SEED_CHECK_RETEACH.id, SEED_SUBMISSIONS_RETEACH);

// Helper to look up question
function getQuestionById(qid: string): DiagnosticQuestion {
  const direct = DIAGNOSTIC_QUESTIONS.find((q) => q.id === qid);
  if (direct) return direct;
  // Check if it's reassessment
  for (const q of DIAGNOSTIC_QUESTIONS) {
    if (q.reassessment_question.id === qid) {
      return {
        id: q.reassessment_question.id,
        concept_id: q.concept_id,
        class_level: q.class_level,
        subject: q.subject,
        chapter: q.chapter,
        title: `${q.title} (Follow-Up Check)`,
        prompt: q.reassessment_question.prompt,
        math_expression: q.reassessment_question.math_expression,
        options: q.reassessment_question.options,
        expected_answer: q.reassessment_question.expected_answer,
        solution_steps: q.reassessment_question.solution_steps,
        common_distractors: q.common_distractors,
        targeted_followup: q.targeted_followup,
        reassessment_question: q.reassessment_question
      };
    }
  }
  return DIAGNOSTIC_QUESTIONS[0];
}

// 1. GET /class-checks: List all class checks
app.get('/class-checks', (_req, res) => {
  const list = Array.from(classChecks.values()).map((c) => {
    const subs = classSubmissions.get(c.id) || [];
    return {
      ...c,
      question: getQuestionById(c.question_id),
      submissions_count: subs.length,
      total_roster_count: DEMO_ROSTER.length
    };
  });
  res.json({ checks: list });
});

// 2. POST /class-checks: Create a new class check
app.post('/class-checks', (req, res) => {
  const { title, class_level, subject, chapter, concept_id, question_id } = req.body;

  if (!title || !concept_id || !question_id) {
    res.status(400).json({ error: 'title, concept_id, and question_id are required' });
    return;
  }

  const newId = `CHK-${Date.now()}`;
  const code = `CHK-${Math.floor(100 + Math.random() * 900)}`;

  const newCheck: StoredClassCheck = {
    id: newId,
    code,
    title: title.trim(),
    class_level: class_level || 'Class 7',
    subject: subject || 'Mathematics',
    chapter: chapter || 'General',
    concept_id,
    question_id,
    created_at: new Date().toISOString(),
    status: 'active',
    is_reteach: false
  };

  classChecks.set(newId, newCheck);
  classSubmissions.set(newId, []);

  res.json({
    check: {
      ...newCheck,
      question: getQuestionById(question_id),
      submissions_count: 0,
      total_roster_count: DEMO_ROSTER.length
    }
  });
});

// 3. GET /class-checks/:id: Get check details
app.get('/class-checks/:id', (req, res) => {
  const { id } = req.params;
  const check = classChecks.get(id);
  if (!check) {
    res.status(404).json({ error: 'Class check not found' });
    return;
  }

  const subs = classSubmissions.get(check.id) || [];
  res.json({
    check: {
      ...check,
      question: getQuestionById(check.question_id),
      submissions_count: subs.length,
      total_roster_count: DEMO_ROSTER.length
    }
  });
});

// 4. GET /class-checks/:id/roster: Get roster with submission statuses
app.get('/class-checks/:id/roster', (req, res) => {
  const { id } = req.params;
  const check = classChecks.get(id);
  if (!check) {
    res.status(404).json({ error: 'Class check not found' });
    return;
  }

  const subs = classSubmissions.get(check.id) || [];
  const submittedStudentIds = new Set(subs.map((s) => s.student_id));

  const rosterWithStatus = DEMO_ROSTER.map((student) => ({
    id: student.id,
    name: student.name,
    has_submitted: submittedStudentIds.has(student.id)
  }));

  res.json({ roster: rosterWithStatus });
});

// 5. POST /class-checks/:id/submit: Student submits answer
app.post('/class-checks/:id/submit', (req, res) => {
  const { id } = req.params;
  const { student_id, student_name, student_answer, student_explanation, confidence = 3 } = req.body;

  const check = classChecks.get(id);
  if (!check) {
    res.status(404).json({ error: 'Class check not found' });
    return;
  }

  if (!student_answer || typeof student_answer !== 'string' || !student_answer.trim()) {
    res.status(400).json({ error: 'Answer is required' });
    return;
  }

  const question = getQuestionById(check.question_id);
  const signal = analyzeQuizResponse(question, student_answer, student_explanation);

  const subId = `SUB-${Date.now()}-${Math.floor(Math.random() * 100)}`;
  const submission: StoredSubmission = {
    id: subId,
    check_id: id,
    student_id: student_id || `STD-${Date.now()}`,
    student_name: student_name || 'Student',
    student_answer: student_answer.trim(),
    student_explanation: (student_explanation || '').trim(),
    confidence: Number(confidence) || 3,
    submitted_at: new Date().toISOString(),
    is_understood: signal.is_understood,
    detected_signal: signal
  };

  const existingSubs = classSubmissions.get(id) || [];
  // If student already submitted, replace or append
  const filtered = existingSubs.filter((s) => s.student_id !== submission.student_id);
  filtered.push(submission);
  classSubmissions.set(id, filtered);

  // Also record in longitudinal evidence store
  try {
    recordStudentAttempt({
      student_id: submission.student_id,
      student_name: submission.student_name,
      check_id: id,
      academic_year: '2025-26 (CBSE Curriculum Framework)',
      subject: check.subject,
      chapter: check.chapter,
      concept_id: check.concept_id,
      learning_outcome: 'Solve assigned topic diagnostic problem',
      question_id: check.question_id,
      question_type: check.is_reteach ? 'transfer_check' : 'diagnostic_initial',
      question_version: 'v1.0',
      student_answer: submission.student_answer,
      written_explanation: submission.student_explanation,
      confidence: submission.confidence,
      attempt_timestamp: submission.submitted_at,
      attempt_type: check.is_reteach ? 'transfer_check' : 'first_attempt',
      expectedAnswer: question.expected_answer
    });
  } catch (err) {
    console.error('Error logging to longitudinal engine:', err);
  }

  res.json({
    success: true,
    submission_id: subId,
    message: 'Response recorded successfully! Your teacher will review class patterns to plan the next lesson.'
  });
});

// 6. GET /class-checks/:id/results: Compute actual aggregate results and teacher action panel
app.get('/class-checks/:id/results', (req, res) => {
  const { id } = req.params;
  const check = classChecks.get(id);
  if (!check) {
    res.status(404).json({ error: 'Class check not found' });
    return;
  }

  const subs = classSubmissions.get(id) || [];
  const totalSubmissions = subs.length;
  const understoodCount = subs.filter((s) => s.is_understood).length;
  const understoodPct = totalSubmissions > 0 ? Math.round((understoodCount / totalSubmissions) * 100) : 0;
  const needsSupportCount = totalSubmissions - understoodCount;

  // Group non-understood responses into real patterns
  const patternGroups = new Map<string, {
    name: string;
    category: string;
    evidence: string;
    status_label: 'Possible pattern' | 'Needs follow-up' | 'Understood';
    students: string[];
  }>();

  for (const s of subs) {
    if (!s.is_understood) {
      const sig = s.detected_signal;
      const key = sig.label;
      if (!patternGroups.has(key)) {
        patternGroups.set(key, {
          name: sig.label,
          category: sig.category,
          evidence: sig.evidence,
          status_label: sig.status === 'possible_pattern' ? 'Possible pattern' : 'Needs follow-up',
          students: [s.student_name]
        });
      } else {
        patternGroups.get(key)!.students.push(s.student_name);
      }
    }
  }

  const patterns = Array.from(patternGroups.entries()).map(([key, val], idx) => ({
    id: `PAT-${idx + 1}`,
    name: val.name,
    frequency: val.students.length,
    percentage: totalSubmissions > 0 ? Math.round((val.students.length / totalSubmissions) * 100) : 0,
    evidence_description: val.evidence,
    category: val.category as any,
    status_label: val.status_label,
    affected_students: val.students
  }));

  // Suggested instructional next steps tied to the actual concept and observed patterns
  let reteachActivity = {
    title: '5-Minute Visual Counterexample Mini-Lesson',
    description: 'Notice that multiple students added tops and bottoms directly. Open the interactive fraction bar sandbox and demonstrate why 1/2 + 1/3 cannot equal 2/5 (which is smaller than half a glass!).',
    partner_prompt: 'Ask student pairs: "If I give you half an apple (1/2) and then another third (1/3), how could the total ever be less than half an apple?"',
    counterexample: '1/2 (0.50) + 1/3 (0.33) = 5/6 (0.83). The flawed rule gives 2/5 = 0.40.'
  };

  if (check.concept_id === 'SCI-ELEC-SERIES-CIRCUITS') {
    reteachActivity = {
      title: 'Current Conservation Analogy & Ammeter Demonstration',
      description: 'Several students suggested Bulb 1 consumes current before Bulb 2. Demonstrate the closed hydrodynamic water pipe loop where water cannot accumulate or disappear in a continuous loop.',
      partner_prompt: 'Ask pairs: "What is actually used up by the bulb—the flowing electrons (current) or the energy they carry (voltage drop)?"',
      counterexample: 'Ammeters placed before and after Bulb 1 read identical amperes (e.g. 0.50A).'
    };
  } else if (check.concept_id === 'MATH-ALG-LINEAR-EQ') {
    reteachActivity = {
      title: 'Equation Balance Scale Demonstration',
      description: 'Show that +7 is undone by subtracting 7 from both sides to keep the scales balanced, not by an arbitrary sign-swap rule.',
      partner_prompt: 'Ask pairs: "Why does adding 7 to 22 unbalance the scale if 3x + 7 was already equal to 22?"',
      counterexample: '3(5) + 7 = 22. If x were 29/3, 3(29/3) + 7 = 36 != 22.'
    };
  }

  // Find linked reteach check if any
  let linkedReteachId: string | undefined = undefined;
  for (const [cId, c] of classChecks.entries()) {
    if (c.parent_check_id === id) {
      linkedReteachId = cId;
      break;
    }
  }

  res.json({
    results: {
      check: {
        ...check,
        question: getQuestionById(check.question_id),
        submissions_count: totalSubmissions,
        total_roster_count: DEMO_ROSTER.length
      },
      total_submissions: totalSubmissions,
      total_roster: DEMO_ROSTER.length,
      understood_count: understoodCount,
      understood_percentage: understoodPct,
      needs_support_count: needsSupportCount,
      patterns,
      student_submissions: subs,
      suggested_reteach_activity: reteachActivity,
      has_linked_reteach: Boolean(linkedReteachId),
      linked_reteach_id: linkedReteachId
    }
  });
});

// 7. POST /class-checks/:id/review: Teacher records note or marks case reviewed
app.post('/class-checks/:id/review', (req, res) => {
  const { id } = req.params;
  const { submission_id, teacher_note, teacher_reviewed = true } = req.body;

  const subs = classSubmissions.get(id);
  if (!subs) {
    res.status(404).json({ error: 'Class check not found' });
    return;
  }

  const sub = subs.find((s) => s.id === submission_id);
  if (!sub) {
    res.status(404).json({ error: 'Submission not found' });
    return;
  }

  sub.teacher_reviewed = Boolean(teacher_reviewed);
  if (teacher_note !== undefined) {
    sub.teacher_note = String(teacher_note).trim();
  }

  res.json({ success: true, submission: sub });
});

// 8. POST /class-checks/:id/reteach-check: Create linked follow-up reteach check
app.post('/class-checks/:id/reteach-check', (req, res) => {
  const { id } = req.params;
  const parent = classChecks.get(id);
  if (!parent) {
    res.status(404).json({ error: 'Parent class check not found' });
    return;
  }

  const parentQuestion = getQuestionById(parent.question_id);
  const reteachQid = parentQuestion.reassessment_question?.id || parent.question_id;

  const reteachId = `${parent.id}-RETEACH`;
  const reteachCode = `${parent.code}B`;

  const reteachCheck: StoredClassCheck = {
    id: reteachId,
    code: reteachCode,
    title: `Follow-Up Check: ${parent.title}`,
    class_level: parent.class_level,
    subject: parent.subject,
    chapter: parent.chapter,
    concept_id: parent.concept_id,
    question_id: reteachQid,
    created_at: new Date().toISOString(),
    status: 'active',
    is_reteach: true,
    parent_check_id: parent.id
  };

  classChecks.set(reteachId, reteachCheck);
  if (!classSubmissions.has(reteachId)) {
    classSubmissions.set(reteachId, []);
  }

  res.json({
    reteach_check: {
      ...reteachCheck,
      question: getQuestionById(reteachQid),
      submissions_count: (classSubmissions.get(reteachId) || []).length,
      total_roster_count: DEMO_ROSTER.length
    }
  });
});

// 9. GET /class-checks/:id/comparison: Compare real responses between pre-check and reteach-check
app.get('/class-checks/:id/comparison', (req, res) => {
  const { id } = req.params;
  const current = classChecks.get(id);
  if (!current) {
    res.status(404).json({ error: 'Class check not found' });
    return;
  }

  let parent: StoredClassCheck | undefined = undefined;
  let reteachCheck: StoredClassCheck | undefined = undefined;

  if (current.is_reteach && current.parent_check_id) {
    reteachCheck = current;
    parent = classChecks.get(current.parent_check_id);
  } else {
    parent = current;
    for (const c of classChecks.values()) {
      if (c.parent_check_id === id) {
        reteachCheck = c;
        break;
      }
    }
  }

  if (!parent || !reteachCheck) {
    res.status(404).json({ error: 'No linked follow-up reteach check found for this check' });
    return;
  }

  const preSubs = classSubmissions.get(parent.id) || [];
  const postSubs = classSubmissions.get(reteachCheck.id) || [];

  const preMap = new Map(preSubs.map((s) => [s.student_id, s]));
  const postMap = new Map(postSubs.map((s) => [s.student_id, s]));

  const matchedStudents: string[] = [];
  const improvedStudents: string[] = [];
  const persistentStudents: string[] = [];
  let preUnderstood = 0;
  let postUnderstood = 0;

  for (const [studentId, preSub] of preMap.entries()) {
    if (postMap.has(studentId)) {
      const postSub = postMap.get(studentId)!;
      matchedStudents.push(preSub.student_name);

      if (preSub.is_understood) preUnderstood++;
      if (postSub.is_understood) postUnderstood++;

      if (!preSub.is_understood && postSub.is_understood) {
        improvedStudents.push(preSub.student_name);
      } else if (!preSub.is_understood && !postSub.is_understood) {
        persistentStudents.push(preSub.student_name);
      }
    }
  }

  const summary = matchedStudents.length > 0
    ? `${improvedStudents.length} of ${matchedStudents.length} students who took both checks demonstrated improved reasoning following the reteach.`
    : 'No students have completed both checks yet.';

  res.json({
    comparison: {
      parent_check_id: parent.id,
      reteach_check_id: reteachCheck.id,
      concept_name: parent.title,
      matched_students_count: matchedStudents.length,
      pre_understood_count: preUnderstood,
      post_understood_count: postUnderstood,
      improved_students: improvedStudents,
      persistent_students: persistentStudents,
      summary
    }
  });
});

// ==========================================
// COGNIVAULT Structured Taxonomy Endpoints
// ==========================================

// 10. GET /api/taxonomy: Full taxonomy registry (LG01 - LG50 and C1 - C5)
app.get('/api/taxonomy', (_req, res) => {
  res.json({
    primary_categories: PRIMARY_CATEGORIES,
    taxonomy: COGNIVAULT_TAXONOMY,
    total_entries: Object.keys(COGNIVAULT_TAXONOMY).length,
    version: '1.0',
    scope: 'Class 10 CBSE Learning Patterns Registry'
  });
});

// 11. GET /api/taxonomy/:id: Single taxonomy entry with signals & safeguards
app.get('/api/taxonomy/:id', (req, res) => {
  const { id } = req.params;
  const upper = id.toUpperCase();
  const entry = COGNIVAULT_TAXONOMY[upper];
  if (!entry) {
    res.status(404).json({ error: `Taxonomy entry ${id} not found in COGNIVAULT 1.0` });
    return;
  }
  const categoryInfo = PRIMARY_CATEGORIES[entry.primary_category];
  res.json({
    entry: {
      ...entry,
      category_name: categoryInfo?.name,
      category_description: categoryInfo?.description
    }
  });
});

// ==========================================
// Class 10 CBSE Curriculum Mapping
// ==========================================

// 12. GET /api/curriculum/cbse10: Official curriculum catalog with coverage status
app.get('/api/curriculum/cbse10', (_req, res) => {
  const totalConcepts = CONCEPT_GRAPH.length;
  const configured = CONCEPT_GRAPH.filter((c) => c.has_diagnostic_items);
  const unconfigured = CONCEPT_GRAPH.filter((c) => !c.has_diagnostic_items);

  res.json({
    academic_year: '2025-26 (CBSE Curriculum Framework)',
    source: 'Central Board of Secondary Education (CBSE) Class 10 Framework',
    total_concepts: totalConcepts,
    configured_concepts_count: configured.length,
    unconfigured_concepts_count: unconfigured.length,
    concepts: CONCEPT_GRAPH,
    questions: DIAGNOSTIC_QUESTIONS
  });
});

// ==========================================
// Longitudinal Evidence Workflow Endpoints
// ==========================================

// 13. GET /api/evidence/student/:student_id/concept/:concept_id: Per-student longitudinal timeline
app.get('/api/evidence/student/:student_id/concept/:concept_id', (req, res) => {
  const { student_id, concept_id } = req.params;
  const concept = CONCEPT_GRAPH.find((c) => c.id === concept_id);
  const student = DEMO_ROSTER.find((s) => s.id === student_id);

  const summary = evaluateStudentTopicEvidence(
    student_id,
    concept_id,
    concept?.name || 'Class 10 Concept',
    concept?.subject || 'Mathematics',
    concept?.chapter || 'General',
    concept?.learning_outcome || 'Demonstrate concept application',
    student?.name || `Student ${student_id}`
  );

  res.json({ evidence: summary });
});

// 14. GET /api/evidence/concept/:concept_id/class: Class-level longitudinal evidence breakdown
app.get('/api/evidence/concept/:concept_id/class', (req, res) => {
  const { concept_id } = req.params;
  const concept = CONCEPT_GRAPH.find((c) => c.id === concept_id);
  const studentsEvidence = getConceptClassEvidenceSummary(concept_id);

  // Compute actual counts without hardcoded mock ratios
  const supportedCounts: Record<string, number> = {};
  let totalTracked = studentsEvidence.length;
  let understoodCount = 0;
  let transferAchievedCount = 0;
  let strongPatternCount = 0;
  let insufficientEvidenceCount = 0;

  for (const se of studentsEvidence) {
    if (se.transfer_achieved) transferAchievedCount++;
    if (se.evidence_status === 'likely_understood') understoodCount++;
    if (se.evidence_status === 'strong_pattern_detected') {
      strongPatternCount++;
      if (se.supported_pattern) {
        const pKey = `${se.supported_pattern.lg_id}: ${se.supported_pattern.name}`;
        supportedCounts[pKey] = (supportedCounts[pKey] || 0) + 1;
      }
    }
    if (se.evidence_status === 'insufficient_evidence' || se.evidence_status === 'explore_further') {
      insufficientEvidenceCount++;
    }
  }

  res.json({
    concept: concept || { id: concept_id, name: 'Topic Concept', subject: 'Science', chapter: 'Ch 11' },
    total_students_tracked: totalTracked,
    transfer_achieved_count: transferAchievedCount,
    understood_count: understoodCount,
    strong_pattern_count: strongPatternCount,
    insufficient_evidence_count: insufficientEvidenceCount,
    supported_patterns_distribution: supportedCounts,
    students_evidence: studentsEvidence
  });
});

// 15. POST /api/evidence/attempt: Record distinct student attempt (initial, follow-up, transfer)
app.post('/api/evidence/attempt', (req, res) => {
  const {
    student_id,
    student_name,
    check_id,
    concept_id,
    question_id,
    question_type,
    student_answer,
    selected_option,
    written_explanation,
    working_steps,
    confidence,
    attempt_type
  } = req.body;

  if (!student_id || !concept_id || !question_id || !student_answer) {
    res.status(400).json({ error: 'student_id, concept_id, question_id, and student_answer are required' });
    return;
  }

  const concept = CONCEPT_GRAPH.find((c) => c.id === concept_id);
  const question = getQuestionById(question_id);

  const record = recordStudentAttempt({
    student_id,
    student_name: student_name || 'Student',
    check_id: check_id || 'CHK-LIVE',
    academic_year: '2025-26 (CBSE Curriculum Framework)',
    subject: concept?.subject || 'Mathematics',
    course_variant: concept?.course_variant,
    chapter: concept?.chapter || 'General',
    concept_id,
    learning_outcome: concept?.learning_outcome || 'Solve topic problems',
    question_id,
    question_type: question_type || 'diagnostic_initial',
    question_version: 'v1.0',
    student_answer: String(student_answer).trim(),
    selected_option,
    written_explanation: written_explanation ? String(written_explanation).trim() : undefined,
    working_steps: Array.isArray(working_steps) ? working_steps : undefined,
    confidence: confidence !== undefined ? Number(confidence) : undefined,
    attempt_timestamp: new Date().toISOString(),
    attempt_type: attempt_type || 'first_attempt',
    expectedAnswer: question.expected_answer
  });

  const summary = evaluateStudentTopicEvidence(
    student_id,
    concept_id,
    concept?.name || 'Topic Concept',
    concept?.subject || 'Mathematics',
    concept?.chapter || 'General',
    concept?.learning_outcome || 'Apply topic principles',
    student_name || 'Student'
  );

  res.json({ success: true, record, evidence: summary });
});

// 16. POST /api/evidence/teacher-review: Log teacher review decision (confirm, correct, defer, dismiss)
app.post('/api/evidence/teacher-review', (req, res) => {
  const { student_id, concept_id, decision, teacher_notes, confirmed_lg_id, corrected_lg_id } = req.body;
  if (!student_id || !concept_id || !decision) {
    res.status(400).json({ error: 'student_id, concept_id, and decision are required' });
    return;
  }

  recordTeacherReview(
    student_id,
    concept_id,
    decision,
    teacher_notes || '',
    confirmed_lg_id,
    corrected_lg_id
  );

  const concept = CONCEPT_GRAPH.find((c) => c.id === concept_id);
  const student = DEMO_ROSTER.find((s) => s.id === student_id);

  const updatedSummary = evaluateStudentTopicEvidence(
    student_id,
    concept_id,
    concept?.name || 'Topic Concept',
    concept?.subject || 'Mathematics',
    concept?.chapter || 'General',
    concept?.learning_outcome || 'Apply topic principles',
    student?.name || 'Student'
  );

  res.json({ success: true, evidence: updatedSummary });
});

// 17. POST /api/evidence/reset-demo: Reset longitudinal demo evidence to baseline seed state
app.post('/api/evidence/reset-demo', (_req, res) => {
  resetLongitudinalData();
  res.json({ success: true, message: 'Longitudinal demo evidence reset to baseline seed state.' });
});

// Seed an initial ambiguous session so the teacher review queue has real data
const sampleAmbiguousSession: DiagnosticSession = {
  id: 'SES-DEMO-AMBIGUOUS',
  student_id: 'STD-104',
  student_name: 'Priya Patel',
  question_id: 'Q-FRAC-01',
  concept_id: 'MATH-FRAC-ADD-DIFF-DENOM',
  started_at: new Date(Date.now() - 3600000).toISOString(),
  question: DIAGNOSTIC_QUESTIONS[0],
  student_answer: '2/5',
  student_explanation: 'I think it equals 2/5 but I am not certain if 6 should be the base.',
  reported_confidence: 2,
  initial_diagnosis: {
    primary_gap: 'C4',
    candidate_gap: 'C4',
    secondary_gaps: [],
    probabilities: { C1: 0.2, C2: 0.2, C3: 0.2, C4: 0.2, C5: 0.2 },
    verification_status: 'UNVERIFIED',
    evidence_for: ['The answer 2/5 matches the add-across distractor. This is a candidate signal pending follow-up.'],
    evidence_against: ['One response cannot establish a persistent learning pattern.'],
    is_ambiguous: true,
    entropy: 2.32
  }
};
sessions.set(sampleAmbiguousSession.id, sampleAmbiguousSession);

// Vite middleware mounting for development
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.join(__dirname, 'dist');
  const distExists = fs.existsSync(path.join(distPath, 'index.html'));

  if (isProduction && distExists) {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MIND-OS server listening on port ${PORT}`);
  });
}

startServer();
