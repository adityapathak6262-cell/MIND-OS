import React, { useState, useEffect } from 'react';
import { PageId } from '../components/Header';
import { api } from '../services/api';
import { ClassCheck, RosterStudent, StudentTopicEvidenceSummary } from '../types';
import { Send, CheckCircle2, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';
import { MathExpression } from '../components/MathExpression';

interface StudentClassCheckQuizProps {
  onNavigate: (page: PageId) => void;
  activeCheckId?: string;
}

export const StudentClassCheckQuiz: React.FC<StudentClassCheckQuizProps> = ({
  onNavigate,
  activeCheckId
}) => {
  const [checks, setChecks] = useState<ClassCheck[]>([]);
  const [selectedCheckId, setSelectedCheckId] = useState<string>(activeCheckId || 'CHK-DEMO-01');
  const [currentCheck, setCurrentCheck] = useState<ClassCheck | null>(null);
  const [roster, setRoster] = useState<RosterStudent[]>([]);

  // Student form state
  const [selectedStudentId, setSelectedStudentId] = useState<string>('STD-107'); // Default to Meera Nair (unsubmitted)
  const [studentAnswer, setStudentAnswer] = useState<string>('');
  const [studentExplanation, setStudentExplanation] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(3);

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [studentEvidence, setStudentEvidence] = useState<StudentTopicEvidenceSummary | null>(null);

  const loadCheckData = async (checkId: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const [checksRes, checkRes, rosterRes] = await Promise.all([
        api.getClassChecks(),
        api.getClassCheck(checkId),
        api.getClassCheckRoster(checkId)
      ]);
      setChecks(checksRes.checks);
      setCurrentCheck(checkRes.check);
      setRoster(rosterRes.roster);

      const unsubmitted = rosterRes.roster.find((r) => !r.has_submitted);
      if (unsubmitted) {
        setSelectedStudentId(unsubmitted.id);
      }
    } catch (err: any) {
      console.error('Failed to load class check data', err);
      setErrorMessage(err?.message || 'Could not load quiz check. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCheckId) {
      setSelectedCheckId(activeCheckId);
    }
  }, [activeCheckId]);

  useEffect(() => {
    loadCheckData(selectedCheckId);
  }, [selectedCheckId]);

  const selectedStudent = roster.find((r) => r.id === selectedStudentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim() || submitting || !currentCheck) return;

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await api.submitClassCheckAnswer(currentCheck.id, {
        student_id: selectedStudent?.id || 'STD-GUEST',
        student_name: selectedStudent?.name || 'Guest Student',
        student_answer: studentAnswer,
        student_explanation: studentExplanation,
        confidence
      });

      try {
        const ev = await api.getStudentEvidence(
          selectedStudent?.id || 'STD-GUEST',
          currentCheck.concept_id
        );
        setStudentEvidence(ev.evidence);
      } catch (errEv) {
        console.warn('Could not fetch student longitudinal summary:', errEv);
      }

      setSubmittedSuccess(true);
    } catch (err: any) {
      console.error('Submission failed', err);
      setErrorMessage(err?.message || 'Could not submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-5 h-5 text-neutral-600 animate-spin mx-auto" />
        <p className="text-base text-neutral-600">Loading class check...</p>
      </div>
    );
  }

  if (errorMessage && !currentCheck) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-neutral-300 rounded-lg text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-neutral-700 mx-auto" />
        <h2 className="text-lg font-semibold text-neutral-900">Could not load check</h2>
        <p className="text-base text-neutral-600">{errorMessage}</p>
        <button
          onClick={() => loadCheckData(selectedCheckId)}
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg cursor-pointer min-h-[44px]"
        >
          Try again
        </button>
      </div>
    );
  }

  if (submittedSuccess) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-neutral-200 rounded-lg text-center space-y-6">
        <div className="w-12 h-12 rounded-full border border-neutral-300 bg-neutral-100 text-neutral-900 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-neutral-900">
            Response Submitted
          </h2>
          <p className="text-base text-neutral-600 leading-relaxed max-w-md mx-auto">
            Thank you, <strong>{selectedStudent?.name || 'Student'}</strong>. Your teacher will review class responses to plan the next lesson.
          </p>
        </div>

        {/* Plain Language Pedagogical Feedback */}
        {studentEvidence && (
          <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-lg text-left space-y-3">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Response Summary
            </div>
            <p className="text-base text-neutral-800 leading-relaxed">
              {studentEvidence.plain_language_feedback.summary}
            </p>
            <div className="text-sm text-neutral-600 space-y-1 pt-2 border-t border-neutral-200">
              <div>
                <strong>Observed evidence:</strong> {studentEvidence.plain_language_feedback.observed_evidence}
              </div>
              <div>
                <strong>Next step:</strong> {studentEvidence.plain_language_feedback.suggested_next_step}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-700 text-left space-y-1">
          <div><strong>Check title:</strong> {currentCheck?.title}</div>
          <div><strong>Your answer:</strong> {studentAnswer}</div>
          {studentExplanation && <div><strong>Your note:</strong> {studentExplanation}</div>}
        </div>

        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              setSubmittedSuccess(false);
              setStudentAnswer('');
              setStudentExplanation('');
              setStudentEvidence(null);
              loadCheckData(selectedCheckId);
            }}
            className="px-5 py-2.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-900 text-sm font-medium rounded-lg transition-colors cursor-pointer min-h-[44px]"
          >
            Submit for another demo student
          </button>
          <button
            onClick={() => onNavigate('class-check')}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer min-h-[44px]"
          >
            Open teacher view
          </button>
        </div>
      </div>
    );
  }

  const question = currentCheck?.question;

  const confidenceLabels: Record<number, string> = {
    1: '1 of 5 · Guessing',
    2: '2 of 5 · Unsure',
    3: '3 of 5 · Moderately confident',
    4: '4 of 5 · Confident',
    5: '5 of 5 · Very confident'
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Quiz Header & Class Selector */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1.5 flex flex-wrap items-center gap-2">
            <span>Check Code: <strong className="font-mono text-neutral-800">{currentCheck?.code}</strong></span>
            <span>·</span>
            <span>{currentCheck?.class_level}</span>
            <span>·</span>
            <span>{currentCheck?.subject}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight leading-snug">
            {currentCheck?.title}
          </h1>
        </div>

        {checks.length > 1 && (
          <div className="flex items-center gap-2 shrink-0 md:self-center bg-neutral-50 p-2 rounded-lg border border-neutral-200">
            <label className="text-xs text-neutral-600 font-semibold whitespace-nowrap">Class check:</label>
            <select
              value={selectedCheckId}
              onChange={(e) => setSelectedCheckId(e.target.value)}
              className="text-sm bg-white border border-neutral-300 rounded-md px-3 py-1.5 text-neutral-900 min-h-[38px] max-w-[280px] sm:max-w-[340px]"
            >
              {checks.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.code})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Student Quiz Card */}
      <div className="p-6 sm:p-8 bg-white rounded-lg border border-neutral-200 space-y-6">
        {/* Step 1: Demo Class Roster Student Selector */}
        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
          <label className="block text-sm font-medium text-neutral-900 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-neutral-700" />
            <span>Select student name (Demo Class):</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {roster.map((student) => {
              const isSelected = selectedStudentId === student.id;
              return (
                <button
                  type="button"
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`p-3 text-sm text-left rounded-lg border transition-colors cursor-pointer min-h-[44px] ${
                    isSelected
                      ? 'bg-neutral-900 text-white font-medium border-neutral-900'
                      : student.has_submitted
                      ? 'bg-neutral-100 border-neutral-300 text-neutral-700'
                      : 'bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-50'
                  }`}
                >
                  <div className="truncate font-medium">{student.name}</div>
                  <div className={`text-xs mt-0.5 ${isSelected ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {student.has_submitted ? 'Submitted' : 'Pending'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Question Display */}
        <div>
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Diagnostic Question
          </span>
          <p className="text-lg font-medium text-neutral-900 mt-2 leading-relaxed">
            {question?.prompt}
          </p>

          {question?.math_expression && (
            <MathExpression expression={question.math_expression} />
          )}
        </div>

        {/* Multiple choice options if present */}
        {question?.options && question.options.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-neutral-900">Options:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {question.options.map((opt) => (
                <button
                  type="button"
                  key={opt.key}
                  onClick={() => setStudentAnswer(opt.text)}
                  className={`p-3.5 rounded-lg border text-sm text-left transition-colors cursor-pointer min-h-[44px] ${
                    studentAnswer === opt.text
                      ? 'bg-neutral-50 border-neutral-900 font-semibold text-neutral-900 ring-1 ring-neutral-900'
                      : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-800'
                  }`}
                >
                  <span>
                    <strong className="mr-2 font-mono text-neutral-500">{opt.key}.</strong>
                    {opt.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          {errorMessage && (
            <div className="p-4 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-neutral-700 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-1.5">
              Your Answer
            </label>
            <input
              type="text"
              required
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="e.g. 5/6 or 2/5"
              className="w-full text-base bg-white border border-neutral-300 rounded-lg px-4 py-3 text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-1.5">
              Explain how you found your answer:
            </label>
            <textarea
              rows={3}
              value={studentExplanation}
              onChange={(e) => setStudentExplanation(e.target.value)}
              placeholder="Write 1–2 sentences explaining your reasoning or calculation steps..."
              className="w-full text-base bg-white border border-neutral-300 rounded-lg p-3.5 text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 leading-relaxed"
            />
          </div>

          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-neutral-900">
                Confidence Level
              </label>
              <span className="text-sm font-medium text-neutral-800">
                {confidenceLabels[confidence]}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full accent-neutral-900 cursor-pointer"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !studentAnswer.trim()}
              className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500 text-white text-base font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer min-h-[48px]"
            >
              {submitting ? 'Submitting...' : 'Submit answer'}
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
