import React, { useState } from 'react';
import {
  StudentTopicEvidenceSummary,
  TeacherReviewDecision
} from '../types';
import { api } from '../services/api';
import {
  History,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  Check,
  BookOpen
} from 'lucide-react';

interface LongitudinalEvidenceTimelineProps {
  evidence: StudentTopicEvidenceSummary;
  onRefresh: () => void;
  isTeacherView?: boolean;
}

export const LongitudinalEvidenceTimeline: React.FC<LongitudinalEvidenceTimelineProps> = ({
  evidence,
  onRefresh,
  isTeacherView = true
}) => {
  const [reviewDecision, setReviewDecision] = useState<TeacherReviewDecision>('confirmed');
  const [teacherNotes, setTeacherNotes] = useState<string>('');
  const [correctedLgId, setCorrectedLgId] = useState<string>('LG01');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'review' | 'student_feedback'>('timeline');

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    try {
      setSubmittingReview(true);
      await api.submitTeacherEvidenceReview({
        student_id: evidence.student_id,
        concept_id: evidence.concept_id,
        decision: reviewDecision,
        teacher_notes: teacherNotes,
        confirmed_lg_id: reviewDecision === 'confirmed' ? evidence.supported_pattern?.lg_id : undefined,
        corrected_lg_id: reviewDecision === 'corrected' ? correctedLgId : undefined
      });
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3000);
      onRefresh();
    } catch (err: any) {
      setReviewError(err?.message || 'Error submitting review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = () => {
    if (evidence.transfer_achieved) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-neutral-300 text-xs font-semibold bg-neutral-100 text-neutral-900">
          <CheckCircle2 className="w-3.5 h-3.5 text-neutral-800" />
          Transfer Achieved
        </span>
      );
    }

    switch (evidence.evidence_status) {
      case 'strong_pattern_detected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-neutral-400 text-xs font-semibold bg-neutral-100 text-neutral-900">
            <AlertCircle className="w-3.5 h-3.5 text-neutral-800" />
            Strong Pattern Detected (Multi-Test Rule Met)
          </span>
        );
      case 'unresolved_mixed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-neutral-300 text-xs font-medium bg-neutral-50 text-neutral-800">
            Unresolved Candidates (Mixed Evidence)
          </span>
        );
      case 'explore_further':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-neutral-300 text-xs font-medium bg-neutral-50 text-neutral-800">
            Explore Further (Follow-Up Needed)
          </span>
        );
      case 'likely_understood':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-neutral-300 text-xs font-medium bg-neutral-100 text-neutral-900">
            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-800" />
            Likely Understood
          </span>
        );
      case 'insufficient_evidence':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-neutral-300 text-xs font-medium bg-neutral-50 text-neutral-700">
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            Insufficient Evidence (Initial Response Only)
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-neutral-50 border-b border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs text-neutral-500">
            <span className="font-mono px-2 py-0.5 bg-neutral-200 text-neutral-800 rounded font-medium">
              {evidence.student_id}
            </span>
            <span>·</span>
            <span>{evidence.subject} · {evidence.chapter}</span>
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
            <span>{evidence.student_name}</span>
            <span className="text-neutral-500 font-normal text-base">— {evidence.concept_name}</span>
          </h2>
          <p className="text-sm text-neutral-600 mt-1">
            Learning Outcome: {evidence.learning_outcome}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {getStatusBadge()}
          <span className="text-sm text-neutral-600 bg-white px-3 py-1 rounded border border-neutral-300">
            {evidence.attempts_count} Distinct Attempt{evidence.attempts_count === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* View Tabs */}
      <div className="px-6 flex items-center gap-6 border-b border-neutral-200 text-sm">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 min-h-[44px] ${
            activeTab === 'timeline'
              ? 'border-neutral-900 text-neutral-900 font-semibold'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <History className="w-4 h-4" />
          Longitudinal Evidence Timeline ({evidence.attempts.length})
        </button>

        {isTeacherView && (
          <button
            onClick={() => setActiveTab('review')}
            className={`pb-3 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 min-h-[44px] ${
              activeTab === 'review'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-neutral-600" />
            Teacher Review Controls
            {evidence.teacher_review?.reviewed && (
              <span className="text-xs bg-neutral-200 text-neutral-800 px-1.5 py-0.2 rounded">Reviewed</span>
            )}
          </button>
        )}

        <button
          onClick={() => setActiveTab('student_feedback')}
          className={`pb-3 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 min-h-[44px] ${
            activeTab === 'student_feedback'
              ? 'border-neutral-900 text-neutral-900 font-semibold'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Student Learning Feedback
        </button>
      </div>

      {/* TAB 1: Evidence Timeline */}
      {activeTab === 'timeline' && (
        <div className="px-6 pb-6 space-y-6">
          {/* Multi-Test Decision Policy Callout */}
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex items-start gap-3 text-sm text-neutral-700">
            <ShieldAlert className="w-5 h-5 text-neutral-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-neutral-900">
                Multi-Test Policy Rule Enforcement
              </span>
              <p className="leading-relaxed">
                A single error never forms a final subcategory classification.
                <strong> Strong Pattern Detected</strong> requires at least two distinct consistent attempts without active contradictions.
                <strong> Transfer Achieved</strong> is recorded only when an independent follow-up check is solved correctly.
              </p>
            </div>
          </div>

          {/* Timeline Stream */}
          <div className="space-y-4 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-neutral-200">
            {evidence.attempts.length === 0 ? (
              <div className="py-8 text-center text-sm text-neutral-500 pl-8">
                No attempt records found for this student.
              </div>
            ) : (
              evidence.attempts.map((attempt, index) => {
                const isTransfer = attempt.attempt_type === 'transfer_check';
                const isFollowup = attempt.attempt_type === 'follow_up';

                return (
                  <div key={attempt.id || index} className="relative pl-9 space-y-2">
                    {/* Timeline Node Icon */}
                    <div className="absolute left-1 top-2.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold bg-neutral-900 text-white ring-4 ring-white">
                      {index + 1}
                    </div>

                    {/* Attempt Card */}
                    <div className="p-5 bg-white border border-neutral-200 rounded-lg space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-neutral-900">
                            Attempt {index + 1}: {isTransfer ? 'Transfer Check' : isFollowup ? 'Follow-Up Verification' : 'Initial Topic Check'}
                          </span>
                          <span className="text-xs font-mono text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                            {attempt.question_id}
                          </span>
                        </div>
                        <span className="text-xs text-neutral-500">
                          {new Date(attempt.attempt_timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Student Response Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-neutral-50 rounded-lg space-y-1">
                          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                            Submitted Answer
                          </span>
                          <div className="font-semibold text-neutral-900 font-mono">
                            {attempt.student_answer}
                          </div>
                        </div>

                        {attempt.written_explanation ? (
                          <div className="p-3 bg-neutral-50 rounded-lg space-y-1">
                            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                              Written Reasoning / Steps
                            </span>
                            <div className="text-neutral-800 italic">
                              &quot;{attempt.written_explanation}&quot;
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-neutral-50 rounded-lg text-neutral-400 italic flex items-center">
                            No written explanation provided
                          </div>
                        )}
                      </div>

                      {attempt.confidence !== undefined && (
                        <div className="text-xs text-neutral-600 flex items-center gap-1.5">
                          <span>Reported Confidence:</span>
                          <span className="font-medium text-neutral-800">{attempt.confidence} / 5</span>
                        </div>
                      )}

                      {/* Hypotheses considered */}
                      {attempt.candidate_hypotheses.length > 0 && (
                        <div className="pt-2 border-t border-neutral-100 space-y-1.5">
                          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                            Candidate Learning-Pattern Hypotheses Considered
                          </span>
                          <div className="space-y-1.5">
                            {attempt.candidate_hypotheses.map((cand) => (
                              <div
                                key={cand.lg_id}
                                className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-neutral-900">
                                    {cand.lg_id} · {cand.lg_name}
                                  </span>
                                  <span className="text-xs bg-white text-neutral-700 px-2 py-0.5 rounded border border-neutral-300">
                                    {cand.primary_category}
                                  </span>
                                </div>
                                {cand.evidence_for.map((ev, i) => (
                                  <div key={i} className="text-xs text-neutral-600 flex items-start gap-1">
                                    <span className="text-neutral-800 shrink-0">• Supporting:</span>
                                    <span>{ev}</span>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Counter-Evidence */}
                      {attempt.contradicting_evidence.length > 0 && (
                        <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-800 space-y-1">
                          <span className="font-semibold text-neutral-900">Counter-Evidence Noted:</span>
                          {attempt.contradicting_evidence.map((ce, i) => (
                            <p key={i} className="text-xs text-neutral-600 leading-relaxed">• {ce}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Teacher Review Controls */}
      {activeTab === 'review' && isTeacherView && (
        <div className="px-6 pb-6 space-y-6">
          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg space-y-1">
            <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-neutral-700" />
              <span>Teacher Review Authority</span>
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              MIND-OS diagnostic outputs are formative signals, not definitive labels.
              As the teacher, you maintain final authority to confirm, correct, defer, or dismiss candidate pattern hypotheses based on your classroom interactions.
            </p>
          </div>

          <form onSubmit={handleReviewSubmit} className="space-y-5">
            {reviewError && (
              <div className="p-3 bg-neutral-50 border border-neutral-300 rounded text-sm text-neutral-900">
                {reviewError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Instructional Decision
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'confirmed', label: 'Confirm Pattern', desc: 'Sufficient evidence observed' },
                  { id: 'corrected', label: 'Correct Pattern', desc: 'Select different LG entry' },
                  { id: 'deferred', label: 'Defer Verdict', desc: 'Need further evidence' },
                  { id: 'dismissed', label: 'Dismiss', desc: 'Isolated calculation slip' }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setReviewDecision(opt.id as any)}
                    className={`p-3.5 rounded-lg border text-left transition-colors cursor-pointer min-h-[44px] ${
                      reviewDecision === opt.id
                        ? 'border-neutral-900 bg-neutral-50 font-semibold ring-1 ring-neutral-900'
                        : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800'
                    }`}
                  >
                    <div className="text-sm font-semibold text-neutral-900">{opt.label}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {reviewDecision === 'corrected' && (
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-1">
                  Corrected Pattern (COGNIVAULT Taxonomy ID)
                </label>
                <input
                  type="text"
                  placeholder="e.g. LG33, LG38, LG03..."
                  value={correctedLgId}
                  onChange={(e) => setCorrectedLgId(e.target.value.toUpperCase())}
                  className="w-full sm:w-64 px-3 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900 font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-1">
                Teacher Notes & Instructional Plan
              </label>
              <textarea
                rows={3}
                placeholder="Explain what was observed in the student's work or class discussion..."
                value={teacherNotes}
                onChange={(e) => setTeacherNotes(e.target.value)}
                className="w-full px-3 py-2.5 text-base border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-900 placeholder:text-neutral-400"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer min-h-[44px]"
              >
                {submittingReview ? 'Saving...' : 'Save teacher review'}
              </button>

              {reviewSuccess && (
                <span className="text-sm font-medium text-neutral-900 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Review recorded
                </span>
              )}
            </div>
          </form>

          {evidence.teacher_review?.reviewed && (
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-sm space-y-1">
              <span className="font-semibold text-neutral-900">
                Latest Teacher Review ({evidence.teacher_review.decision.toUpperCase()}):
              </span>
              <p className="text-neutral-700">
                &quot;{evidence.teacher_review.teacher_notes || 'No notes logged.'}&quot;
              </p>
              <span className="text-xs text-neutral-500 block mt-1">
                Recorded on {new Date(evidence.teacher_review.reviewed_at).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Student-Facing Plain Language */}
      {activeTab === 'student_feedback' && (
        <div className="px-6 pb-6 space-y-5">
          <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-lg space-y-3">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Student Learning Summary
            </div>
            <p className="text-base text-neutral-800 leading-relaxed">
              {evidence.plain_language_feedback.summary}
            </p>
            <div className="text-sm text-neutral-600 space-y-1.5 pt-2 border-t border-neutral-200">
              <div>
                <span className="font-medium text-neutral-900">Observed evidence: </span>
                {evidence.plain_language_feedback.observed_evidence}
              </div>
              <div>
                <span className="font-medium text-neutral-900">Suggested next step: </span>
                {evidence.plain_language_feedback.suggested_next_step}
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-neutral-200 rounded-lg space-y-2">
            <span className="text-sm font-semibold text-neutral-900">
              Recommended Learning Activity:
            </span>
            <p className="text-sm text-neutral-700 leading-relaxed">
              {evidence.plain_language_feedback.repair_activity}
            </p>
          </div>

          <div className="p-3 bg-neutral-100 rounded text-xs text-neutral-600 leading-relaxed">
            {evidence.plain_language_feedback.safeguard_note}
          </div>
        </div>
      )}
    </div>
  );
};
