import React, { useState, useEffect } from 'react';
import { PageId } from '../components/Header';
import { api } from '../services/api';
import { DiagnosticQuestion, DiagnosticResult, TargetedFollowup } from '../types';
import { ArrowRight, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { MathExpression } from '../components/MathExpression';

interface DiagnosticSessionProps {
  initialConceptId?: string;
  onNavigate: (page: PageId) => void;
  onDiagnosisComplete: (sessionId: string, diagnosis: DiagnosticResult, followup?: TargetedFollowup) => void;
}

export const DiagnosticSession: React.FC<DiagnosticSessionProps> = ({
  initialConceptId,
  onNavigate,
  onDiagnosisComplete
}) => {
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('Q-FRAC-01');
  const [sessionId, setSessionId] = useState<string>('');

  // Student inputs
  const [studentAnswer, setStudentAnswer] = useState<string>('');
  const [studentExplanation, setStudentExplanation] = useState<string>('');
  const [intermediateSteps, setIntermediateSteps] = useState<string[]>(['']);
  const [confidence, setConfidence] = useState<number>(3);

  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDemoShortcuts, setShowDemoShortcuts] = useState(false);

  const loadQuestions = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api.getQuestions();
      setQuestions(data.questions);
      if (data.questions.length > 0) {
        const matched = initialConceptId
          ? data.questions.find((q) => q.concept_id === initialConceptId) || data.questions[0]
          : data.questions[0];
        setSelectedQuestionId(matched.id);

        const startRes = await api.startDiagnostic('STD-101', matched.id);
        setSessionId(startRes.session_id);
      }
    } catch (err: any) {
      console.error('Failed to load diagnostic questions', err);
      setLoadError(err?.message || 'Could not load practice questions. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [initialConceptId]);

  const activeQuestion = questions.find((q) => q.id === selectedQuestionId) || questions[0];

  const handleStepChange = (index: number, val: string) => {
    const updated = [...intermediateSteps];
    updated[index] = val;
    setIntermediateSteps(updated);
  };

  const addStep = () => {
    setIntermediateSteps([...intermediateSteps, '']);
  };

  const selectPreFill = (ans: string, exp: string) => {
    setStudentAnswer(ans);
    setStudentExplanation(exp);
    setIntermediateSteps([exp]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentAnswer.trim() || submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await api.submitAnswer(
        sessionId,
        studentAnswer,
        studentExplanation,
        intermediateSteps.filter((s) => s.trim().length > 0),
        confidence
      );

      onDiagnosisComplete(res.session_id, res.diagnosis, res.targeted_followup);
      onNavigate('diagnostic-report');
    } catch (err: any) {
      console.error('Diagnosis submission failed', err);
      setSubmitError(err?.message || 'Error submitting answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-5 h-5 text-neutral-600 animate-spin mx-auto" />
        <p className="text-base text-neutral-600">Loading diagnostic question...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-neutral-300 rounded-lg text-center space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Could not load question</h2>
        <p className="text-base text-neutral-600">{loadError}</p>
        <button
          onClick={loadQuestions}
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer min-h-[44px]"
        >
          Try again
        </button>
      </div>
    );
  }

  const confidenceLabels: Record<number, string> = {
    1: '1 of 5 · Guessing',
    2: '2 of 5 · Unsure',
    3: '3 of 5 · Moderately confident',
    4: '4 of 5 · Confident',
    5: '5 of 5 · Very confident'
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Question Header & Topic Selection */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-sm text-neutral-500 mb-1">
            {activeQuestion.class_level} · {activeQuestion.subject} · {activeQuestion.chapter}
          </div>
          <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
            {activeQuestion.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label className="text-sm text-neutral-600 font-medium">Topic:</label>
          <select
            value={selectedQuestionId}
            onChange={async (e) => {
              const qid = e.target.value;
              setSelectedQuestionId(qid);
              setStudentAnswer('');
              setStudentExplanation('');
              setIntermediateSteps(['']);
              setSubmitError(null);
              const s = await api.startDiagnostic('STD-101', qid);
              setSessionId(s.session_id);
            }}
            className="text-sm bg-white border border-neutral-300 rounded-lg px-3 py-2 text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 cursor-pointer min-h-[40px]"
          >
            {questions.map((q) => (
              <option key={q.id} value={q.id}>
                [{q.subject}] {q.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="p-6 sm:p-8 bg-white rounded-lg border border-neutral-200 space-y-6">
        <div>
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Diagnostic Item
          </span>
          <p className="text-lg font-medium text-neutral-900 mt-2 leading-relaxed">
            {activeQuestion.prompt}
          </p>

          {activeQuestion.math_expression && (
            <MathExpression expression={activeQuestion.math_expression} />
          )}
        </div>

        {/* Demo shortcuts: Clearly labeled and collapsible */}
        <div className="border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
          <button
            type="button"
            onClick={() => setShowDemoShortcuts(!showDemoShortcuts)}
            className="w-full px-4 py-3 text-left text-sm font-medium text-neutral-700 flex items-center justify-between hover:bg-neutral-100 transition-colors cursor-pointer min-h-[44px]"
          >
            <span className="flex items-center gap-2">
              <span className="border border-neutral-300 bg-white text-neutral-800 px-2 py-0.5 rounded text-xs font-semibold">
                Demo helper
              </span>
              <span>Sample response presets for testing</span>
            </span>
            {showDemoShortcuts ? (
              <ChevronUp className="w-4 h-4 text-neutral-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-500" />
            )}
          </button>

          {showDemoShortcuts && (
            <div className="p-4 pt-2 border-t border-neutral-200 bg-white space-y-2">
              <p className="text-xs text-neutral-600 mb-2">
                Select a sample answer to observe diagnostic pattern detection:
              </p>
              <div className="flex flex-wrap gap-2">
                {activeQuestion.id === 'Q-FRAC-01' && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        selectPreFill(
                          '2/5',
                          'I added 1+1 on top to get 2, and 2+3 on the bottom to get 5.'
                        )
                      }
                      className="px-3 py-1.5 text-xs bg-neutral-50 hover:bg-neutral-100 text-neutral-900 border border-neutral-300 rounded cursor-pointer"
                    >
                      Autofill: &quot;2/5&quot; (Added across)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        selectPreFill(
                          '2/6',
                          'I found common denominator 6, but then added 1+1 = 2.'
                        )
                      }
                      className="px-3 py-1.5 text-xs bg-neutral-50 hover:bg-neutral-100 text-neutral-900 border border-neutral-300 rounded cursor-pointer"
                    >
                      Autofill: &quot;2/6&quot; (Unscaled numerator)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        selectPreFill(
                          '5/6',
                          '1/2 is 3/6 and 1/3 is 2/6. 3/6 + 2/6 = 5/6.'
                        )
                      }
                      className="px-3 py-1.5 text-xs bg-neutral-50 hover:bg-neutral-100 text-neutral-900 border border-neutral-300 rounded cursor-pointer"
                    >
                      Autofill: &quot;5/6&quot; (Correct)
                    </button>
                  </>
                )}

                {activeQuestion.id === 'Q-ELEC-01' && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        selectPreFill(
                          'Bulb 1 is brighter',
                          'Bulb 1 gets current first from the battery and uses up some electricity, so Bulb 2 gets less.'
                        )
                      }
                      className="px-3 py-1.5 text-xs bg-neutral-50 hover:bg-neutral-100 text-neutral-900 border border-neutral-300 rounded cursor-pointer"
                    >
                      Autofill: &quot;Current consumed&quot;
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        selectPreFill(
                          'Both bulbs are equally bright',
                          'Because in a single loop series circuit, the flow of electric charge is constant throughout.'
                        )
                      }
                      className="px-3 py-1.5 text-xs bg-neutral-50 hover:bg-neutral-100 text-neutral-900 border border-neutral-300 rounded cursor-pointer"
                    >
                      Autofill: &quot;Current conserved&quot;
                    </button>
                  </>
                )}

                {activeQuestion.id === 'Q-ALG-01' && (
                  <button
                    type="button"
                    onClick={() =>
                      selectPreFill(
                        'x = 29/3',
                        'I moved 7 to the right and added 22 + 7 = 29, then divided by 3.'
                      )
                    }
                    className="px-3 py-1.5 text-xs bg-neutral-50 hover:bg-neutral-100 text-neutral-900 border border-neutral-300 rounded cursor-pointer"
                  >
                    Autofill: Sign transposition slip
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Multiple choice options if present */}
        {activeQuestion.options && activeQuestion.options.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
              Select or type your answer:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {activeQuestion.options.map((opt) => (
                <button
                  type="button"
                  key={opt.key}
                  onClick={() => setStudentAnswer(opt.text)}
                  className={`p-3.5 rounded-lg border text-sm text-left transition-colors cursor-pointer flex items-center justify-between min-h-[44px] ${
                    studentAnswer === opt.text
                      ? 'bg-emerald-50 border-emerald-600 font-semibold text-emerald-950 ring-1 ring-emerald-600'
                      : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center font-mono text-xs font-bold text-neutral-700 shrink-0">
                      {opt.key}
                    </span>
                    <span className="font-mono font-medium text-base text-neutral-900">{opt.text}</span>
                  </span>
                  {studentAnswer === opt.text && (
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Selected
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {submitError && (
            <div className="p-4 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-neutral-700 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Student Answer */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-1.5">
              Your Answer
            </label>
            <input
              type="text"
              required
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="e.g. 5/6 or select an option above"
              className="w-full text-base bg-white border border-neutral-300 rounded-lg px-4 py-3 text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 font-mono"
            />
          </div>

          {/* Reasoning / Explanation */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-neutral-900">
                How did you solve this problem?
              </label>
              <button
                type="button"
                onClick={addStep}
                className="text-sm text-neutral-700 hover:text-neutral-900 underline cursor-pointer"
              >
                + Add step line
              </button>
            </div>

            <div className="space-y-3">
              <textarea
                rows={3}
                value={studentExplanation}
                onChange={(e) => setStudentExplanation(e.target.value)}
                placeholder="Explain your thinking or calculation steps..."
                className="w-full text-base bg-white border border-neutral-300 rounded-lg p-3.5 text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 leading-relaxed"
              />

              {intermediateSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-neutral-500 w-16 shrink-0">
                    Step {idx + 1}:
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => handleStepChange(idx, e.target.value)}
                    placeholder="e.g. 1/2 = 3/6"
                    className="flex-1 text-sm bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900 font-mono"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Confidence Setting */}
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

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end">
            <button
              type="submit"
              disabled={submitting || !studentAnswer.trim()}
              className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500 text-white text-base font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer min-h-[48px]"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating response...</span>
                </>
              ) : (
                <>
                  <span>Submit answer</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
