import React, { useState, useEffect } from 'react';
import { PageId } from '../components/Header';
import { api } from '../services/api';
import { ReassessmentResult } from '../types';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { MathExpression } from '../components/MathExpression';

interface ReassessmentPageProps {
  sessionId?: string;
  onNavigate: (page: PageId) => void;
}

export const ReassessmentPage: React.FC<ReassessmentPageProps> = ({ sessionId, onNavigate }) => {
  const [reassessmentData, setReassessmentData] = useState<any>(null);
  const [studentAnswer, setStudentAnswer] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<ReassessmentResult | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.startReassessment(sessionId || 'SES-DEMO-AMBIGUOUS');
        setReassessmentData(data);
      } catch (err) {
        console.error('Failed to load reassessment question', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await api.submitReassessment(sessionId || 'SES-DEMO-AMBIGUOUS', studentAnswer);
      setResult(res.reassessment_result);
      setFeedback(res.feedback);
    } catch (err) {
      console.error('Failed to submit reassessment', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !reassessmentData) {
    return (
      <div className="py-20 text-center text-base text-neutral-600">
        Loading isomorphic transfer question...
      </div>
    );
  }

  const { reassessment_question: q } = reassessmentData;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-neutral-200">
        <div className="text-sm text-neutral-500 mb-1">
          Follow-up Assessment · Transfer Evaluation
        </div>
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
          Concept Reassessment
        </h1>
        <p className="text-base text-neutral-600 mt-1 leading-relaxed">
          Solve this follow-up problem with changed values to demonstrate transfer of understanding.
        </p>
      </div>

      {/* Reassessment Item */}
      <div className="p-6 sm:p-8 bg-white rounded-lg border border-neutral-200 space-y-6">
        <div>
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Transfer Item
          </span>
          <p className="text-lg font-medium text-neutral-900 mt-2 leading-relaxed">
            {q.prompt}
          </p>

          {q.math_expression && (
            <MathExpression expression={q.math_expression} />
          )}
        </div>

        {/* Multiple Choice Options if provided */}
        {q.options && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-neutral-900">Select or write your answer:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {q.options.map((opt: any) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setStudentAnswer(opt.text)}
                  className={`p-3.5 rounded-lg border text-sm text-left transition-colors cursor-pointer flex items-center justify-between min-h-[44px] ${
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

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1.5">
                Your Answer
              </label>
              <input
                type="text"
                required
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                placeholder="e.g. 7/12"
                className="w-full text-base bg-white border border-neutral-300 rounded-lg px-4 py-3 text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 font-mono"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting || !studentAnswer.trim()}
                className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500 text-white text-base font-medium rounded-lg transition-colors cursor-pointer min-h-[48px]"
              >
                {submitting ? 'Evaluating transfer...' : 'Submit reassessment'}
              </button>
            </div>
          </form>
        ) : (
          /* Reassessment Result */
          <div className="space-y-6 pt-4 border-t border-neutral-200">
            <div className="p-5 rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-900 flex items-start gap-3">
              {result.is_correct ? (
                <CheckCircle2 className="w-5 h-5 text-neutral-800 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-neutral-700 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-neutral-900">
                  {result.is_correct ? 'Concept transfer confirmed' : 'Residual pattern detected'}
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed">{feedback}</p>
              </div>
            </div>

            {/* Performance Comparison */}
            <div className="p-5 bg-white border border-neutral-200 rounded-lg space-y-3">
              <h4 className="text-sm font-semibold text-neutral-900">
                Pre vs Post Diagnostic Comparison
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-sm">
                  <div className="text-xs text-neutral-500 uppercase tracking-wider">Initial Diagnostic Check</div>
                  <div className="font-medium text-neutral-900 mt-1">
                    {result.pre_score_correct ? 'Correct' : 'Incorrect (2/5)'}
                  </div>
                  <div className="text-xs text-neutral-600 mt-0.5">Diagnosed Pattern: C4 (Add across)</div>
                </div>

                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-sm">
                  <div className="text-xs text-neutral-500 uppercase tracking-wider">Post-Intervention Transfer Item</div>
                  <div className="font-medium text-neutral-900 mt-1">
                    {result.is_correct ? 'Correct (7/12)' : 'Incorrect transfer'}
                  </div>
                  <div className="text-xs text-neutral-600 mt-0.5">
                    {result.improved ? 'Mastery demonstrated on transfer problem' : 'Additional practice suggested'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                onClick={() => onNavigate('student-dashboard')}
                className="px-5 py-2.5 text-sm font-medium text-neutral-900 bg-white border border-neutral-300 hover:bg-neutral-50 rounded-lg transition-colors cursor-pointer min-h-[44px]"
              >
                Back to dashboard
              </button>
              <button
                onClick={() => onNavigate('teacher-dashboard')}
                className="px-5 py-2.5 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer min-h-[44px]"
              >
                View class records
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
