import React, { useState, useEffect } from 'react';
import { PageId } from '../components/Header';
import { api } from '../services/api';
import { RefreshCw, CheckCircle2 } from 'lucide-react';

interface TeacherDashboardProps {
  onNavigate: (page: PageId) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedQueueItem, setSelectedQueueItem] = useState<any>(null);
  const [teacherNote, setTeacherNote] = useState<string>('');
  const [teacherConfirmedGap, setTeacherConfirmedGap] = useState<string>('C4');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await api.getTeacherAnalytics();
      setAnalytics(data);
      if (data.review_queue && data.review_queue.length > 0) {
        setSelectedQueueItem(data.review_queue[0]);
      }
    } catch (err: any) {
      console.error('Failed to load teacher analytics', err);
      setLoadError(err?.message || 'Could not load teacher records. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQueueItem || submittingReview) return;

    setSubmittingReview(true);
    try {
      await api.submitTeacherReview(
        selectedQueueItem.session_id,
        teacherConfirmedGap,
        teacherNote
      );
      await loadData();
      setSelectedQueueItem(null);
      setTeacherNote('');
    } catch (err) {
      console.error('Teacher review failed', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-5 h-5 text-neutral-600 animate-spin mx-auto" />
        <p className="text-base text-neutral-600">Loading teacher dashboard & review queue...</p>
      </div>
    );
  }

  if (loadError || !analytics) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-neutral-300 rounded-lg text-center space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Could not load dashboard</h2>
        <p className="text-base text-neutral-600">{loadError || 'Unable to retrieve analytics.'}</p>
        <button
          onClick={loadData}
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer min-h-[44px]"
        >
          Try again
        </button>
      </div>
    );
  }

  const gapLabels: Record<string, string> = {
    C1: 'Underlying Concept Model',
    C2: 'Logical Deduction Steps',
    C3: 'Procedural Calculation Slip',
    C4: 'Systematic Misconception',
    C5: 'Formula / Recall Mix-up'
  };

  const totalErrors = Object.values(analytics.learning_gap_distribution as Record<string, number>).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="text-sm text-neutral-500 mb-1">
            Class Overview · {analytics.active_class} · Demo Class
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
            Teacher Diagnostic Review
          </h1>
          <p className="text-base text-neutral-600 mt-2 max-w-xl leading-relaxed">
            Review student responses where diagnostic confidence is ambiguous, record personalized notes, and track class learning trends.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 border-l border-neutral-200 pl-6 shrink-0">
          <div className="flex items-center gap-6 text-sm text-neutral-600">
            <div>
              <div className="text-2xl font-semibold font-mono text-neutral-900 tabular-nums">
                {analytics.total_diagnostics_run}
              </div>
              <div className="text-sm text-neutral-500">Practice checks</div>
            </div>
            <div>
              <div className="text-2xl font-semibold font-mono text-neutral-900 tabular-nums">
                {analytics.review_queue?.length || 0}
              </div>
              <div className="text-sm text-neutral-500">Awaiting review</div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('class-check')}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer min-h-[44px]"
          >
            Post-Lesson Class Check
          </button>
        </div>
      </div>

      {/* Class Level Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Card */}
        <div className="p-6 bg-white border border-neutral-200 rounded-lg space-y-3">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Most Prevalent Verified Category
          </div>
          <h2 className="text-lg font-semibold text-neutral-900">
            {analytics.most_prevalent_misconception}
          </h2>
          <p className="text-base text-neutral-600 leading-relaxed">
            Review the current response distribution below to see which learning patterns may need attention. Candidate signals should be checked against student working and follow-up evidence.
          </p>
          <div className="pt-2 text-sm text-neutral-800">
            {totalErrors > 0
              ? 'Next step: Open the student work and follow-up evidence before choosing a reteach activity.'
              : 'Next step: Run a class check to collect responses; no verified patterns are available yet.'}
          </div>
        </div>

        {/* Distribution Table */}
        <div className="lg:col-span-2 p-6 bg-white border border-neutral-200 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">
              Response Category Distribution
            </h2>
            <span className="text-sm text-neutral-500 font-mono">{totalErrors} Total Observations</span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(analytics.learning_gap_distribution as Record<string, number>).map(
              ([key, count]) => {
                const pct = Math.round((count / (totalErrors || 1)) * 100);
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-neutral-800">
                        {key} · {gapLabels[key]}
                      </span>
                      <span className="font-mono text-neutral-600 tabular-nums">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-800 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Teacher Review Queue */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            Individual Review Queue
          </h2>
          <p className="text-sm text-neutral-600">
            Cases where evidence was ambiguous or multiple hypotheses remain plausible.
          </p>
        </div>

        {analytics.review_queue && analytics.review_queue.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              {analytics.review_queue.map((item: any) => (
                <button
                  key={item.session_id}
                  onClick={() => setSelectedQueueItem(item)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors cursor-pointer ${
                    selectedQueueItem?.session_id === item.session_id
                      ? 'bg-neutral-50 border-neutral-900 font-medium'
                      : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-neutral-900 text-base">{item.student_name}</span>
                    <span className="text-xs border border-neutral-300 bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded font-medium">
                      Review needed
                    </span>
                  </div>
                  <div className="text-sm text-neutral-600">{item.question_title}</div>
                  <div className="text-xs text-neutral-500 font-mono mt-1 truncate">
                    Answer: &quot;{item.student_answer}&quot;
                  </div>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2 p-6 bg-white border border-neutral-200 rounded-lg space-y-5">
              {selectedQueueItem ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="border-b border-neutral-200 pb-3">
                    <div className="text-sm text-neutral-500">
                      Student: {selectedQueueItem.student_name} ({selectedQueueItem.session_id})
                    </div>
                    <h3 className="text-lg font-semibold text-neutral-900 mt-1">
                      {selectedQueueItem.question_title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Student Answer</div>
                      <div className="font-mono font-semibold text-neutral-900 mt-1 text-base">
                        {selectedQueueItem.student_answer}
                      </div>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                      <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Student Explanation</div>
                      <div className="text-neutral-800 mt-1 leading-relaxed text-sm">
                        &quot;{selectedQueueItem.student_explanation}&quot;
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-sm font-medium text-neutral-900 mb-1">
                        Teacher Confirmed Diagnosis:
                      </label>
                      <select
                        value={teacherConfirmedGap}
                        onChange={(e) => setTeacherConfirmedGap(e.target.value)}
                        className="w-full text-sm bg-white border border-neutral-300 rounded-lg p-2.5 text-neutral-900 min-h-[44px]"
                      >
                        <option value="C4">C4 · Systematic Misconception (Add across)</option>
                        <option value="C3">C3 · Procedural Gap (Calculation slip)</option>
                        <option value="C1">C1 · Conceptual Gap (Needs visual unit representation)</option>
                        <option value="C5">C5 · Formula Recall Confusion</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-900 mb-1">
                        Teacher Notes / Targeted Feedback:
                      </label>
                      <textarea
                        rows={3}
                        value={teacherNote}
                        onChange={(e) => setTeacherNote(e.target.value)}
                        placeholder="Add instructional observation or feedback for the student..."
                        className="w-full text-base bg-white border border-neutral-300 rounded-lg p-3 text-neutral-900 leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500 rounded-lg transition-colors cursor-pointer min-h-[44px]"
                    >
                      {submittingReview ? 'Saving...' : 'Confirm review & record note'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-12 text-sm text-neutral-500">
                  Select a student submission to inspect.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 bg-white border border-neutral-200 rounded-lg text-center text-sm text-neutral-600">
            <CheckCircle2 className="w-6 h-6 text-neutral-700 mx-auto mb-2" />
            No submissions currently awaiting review.
          </div>
        )}
      </section>
    </div>
  );
};
