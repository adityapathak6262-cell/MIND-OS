import React, { useState } from 'react';
import { PageId } from '../components/Header';
import { api } from '../services/api';
import { DiagnosticResult, TargetedFollowup, BayesianStep } from '../types';
import { ArrowRight, CheckCircle2, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface DiagnosticReportProps {
  sessionId: string;
  diagnosis: DiagnosticResult;
  followup?: TargetedFollowup;
  onNavigate: (page: PageId) => void;
  onVerificationComplete: (updatedDiagnosis: DiagnosticResult) => void;
}

export const DiagnosticReport: React.FC<DiagnosticReportProps> = ({
  sessionId,
  diagnosis,
  followup,
  onNavigate,
  onVerificationComplete
}) => {
  const [selectedFollowupKey, setSelectedFollowupKey] = useState<string>('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [bayesianSteps, setBayesianSteps] = useState<BayesianStep[] | null>(null);
  const [bayesianExplanation, setBayesianExplanation] = useState<string>('');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);

  const currentStatus = diagnosis.verification_status;

  const handleVerify = async () => {
    if (!selectedFollowupKey || verifying) return;
    setVerifying(true);
    setVerifyError(null);
    try {
      const res = await api.submitVerification(sessionId, selectedFollowupKey);
      setBayesianSteps(res.bayesian_update.bayesian_steps);
      setBayesianExplanation(res.bayesian_update.explanation);
      onVerificationComplete(res.verified_diagnosis);
    } catch (err: any) {
      console.error('Verification update failed', err);
      setVerifyError('Could not submit follow-up response. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const getPersonalGuidance = (gap: string, conceptId?: string) => {
    switch (gap) {
      case 'C4':
        if (conceptId === 'SCI-ELEC-SERIES-CIRCUITS') {
          return {
            headline: 'Possible current-consumption model',
            actionable_advice:
              'The response may treat current as something the first bulb uses up. In a single series loop, charge flow is the same at each point; energy is transferred by the components.',
            tag: 'Candidate Circuit Pattern'
          };
        }
        return {
          headline: 'Possible systematic misconception',
          actionable_advice:
            'This response may reflect a misconception about the concept being checked. Review the observed working and use the follow-up question before choosing a reteaching strategy.',
          tag: 'Candidate Concept Pattern'
        };
      case 'C3':
        return {
          headline: 'Possible procedural slip',
          actionable_advice:
            'The answer may reflect a missed calculation or operation step. Review the working and follow-up response before deciding whether a procedural reteach is needed.',
          tag: 'Procedural Slip'
        };
      case 'C1':
        return {
          headline: 'A concrete concept model may help',
          actionable_advice:
            'A visual or hands-on representation may help clarify the concept being checked. Use the student’s response to choose a representation that matches this topic.',
          tag: 'Concept Model'
        };
      case 'C5':
        return {
          headline: 'Formula or definition recall confusion',
          actionable_advice:
            'Related formulas or definitions were inverted (such as reciprocal relationships or Ohm’s law formulas). Direct concept review will solidify the relationship.',
          tag: 'Formula Recall'
        };
      default:
        return {
          headline: 'Logical step sequencing requires support',
          actionable_advice:
            'Reviewing the conditional statements step by step will clarify how to reach the required conclusion without circular assumptions.',
          tag: 'Logical Deduction'
        };
    }
  };

  const noSupportedPattern = !diagnosis.is_correct && !diagnosis.candidate_gap;
  const guidance = diagnosis.is_correct
    ? {
        headline: 'Your answer matches the expected answer',
        actionable_advice: 'No learning-gap hypothesis was raised from this response.',
        tag: 'Answer Matched'
      }
    : noSupportedPattern
    ? {
        headline: 'No specific learning pattern identified yet',
        actionable_advice: 'This response does not provide enough evidence to identify a learning gap. Try the follow-up question or review the working with your teacher.',
        tag: 'More Evidence Needed'
      }
    : getPersonalGuidance(diagnosis.candidate_gap || diagnosis.primary_gap, diagnosis.concept_id);

  const gapLabels: Record<string, string> = {
    C1: 'Underlying Concept Model',
    C2: 'Logical Deduction Sequence',
    C3: 'Procedural Calculation Accuracy',
    C4: 'Systematic Misconception Pattern',
    C5: 'Formula & Definition Recall'
  };

  const statusLabel = diagnosis.is_correct
      ? 'Answer Matched'
      : currentStatus === 'SUFFICIENTLY_SUPPORTED'
      ? 'Strong Pattern Detected'
      : currentStatus === 'PROVISIONALLY_SUPPORTED'
      ? 'Provisional Pattern'
      : 'Follow-Up Needed';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Session Header */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-sm text-neutral-500 mb-1">
            Session ID: {sessionId} · Diagnostic Feedback
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">
            Diagnostic Analysis
          </h1>
          <p className="text-base text-neutral-600 mt-1">
            Review the observed evidence and candidate learning pattern.
          </p>
        </div>

        <div className="shrink-0">
          <span className="inline-flex items-center px-3 py-1.5 rounded border border-neutral-300 text-sm font-medium text-neutral-900 bg-neutral-50">
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Main Feedback Box */}
      <div className="p-6 sm:p-8 bg-white rounded-lg border border-neutral-200 space-y-5">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            {diagnosis.is_correct ? 'Response Result' : 'Candidate Learning Pattern · Unverified'} · {guidance.tag}
          </span>
          <h2 className="text-xl font-semibold text-neutral-900 leading-snug">
            {guidance.headline}
          </h2>
        </div>

        <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-base text-neutral-800 leading-relaxed">
          {guidance.actionable_advice}
        </div>

        {/* Observable Evidence */}
        <div className="pt-2 space-y-2">
          <h3 className="text-sm font-semibold text-neutral-900">Observed Response Evidence:</h3>
          <ul className="space-y-2 text-base text-neutral-700">
            {(diagnosis.evidence_for && diagnosis.evidence_for.length > 0
              ? diagnosis.evidence_for
              : ['No response-specific evidence is available yet.']
            ).map((ev, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="text-neutral-400 mt-1">•</span>
                <span>{ev}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Follow-up question if ambiguous */}
      {followup && (
        <div className="p-6 sm:p-8 bg-white rounded-lg border border-neutral-300 space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Diagnostic Follow-Up Check
            </span>
            <h3 className="text-lg font-semibold text-neutral-900 leading-snug">
              {followup.prompt}
            </h3>
            <p className="text-sm text-neutral-600">
              Select the explanation that matches your reasoning:
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {followup.options.map((opt) => (
              <label
                key={opt.key}
                className={`flex items-start gap-3 p-4 rounded-lg border text-base cursor-pointer transition-colors ${
                  selectedFollowupKey === opt.key
                    ? 'bg-neutral-50 border-neutral-900 font-medium text-neutral-900 ring-1 ring-neutral-900'
                    : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-800'
                }`}
              >
                <input
                  type="radio"
                  name="followup"
                  value={opt.key}
                  checked={selectedFollowupKey === opt.key}
                  onChange={() => setSelectedFollowupKey(opt.key)}
                  className="mt-1 accent-neutral-900 cursor-pointer"
                />
                <span className="flex-1 leading-relaxed">{opt.text}</span>
              </label>
            ))}
          </div>

          {verifyError && (
            <div className="text-sm text-neutral-700 font-medium">{verifyError}</div>
          )}

          {bayesianSteps ? (
            <div className="p-4 bg-neutral-50 border border-neutral-300 rounded-lg text-sm text-neutral-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-neutral-700 shrink-0" />
              <span>Evidence updated based on your response.</span>
            </div>
          ) : (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleVerify}
                disabled={verifying || !selectedFollowupKey}
                className="px-5 py-2.5 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500 rounded-lg transition-colors flex items-center gap-2 cursor-pointer min-h-[44px]"
              >
                {verifying ? 'Updating...' : 'Submit follow-up'}
                <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action to Guided Intervention */}
      <div className="p-6 bg-white rounded-lg border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">
            Next Step: Visual Concept Model & Worked Example
          </h3>
          <p className="text-sm text-neutral-600 mt-0.5">
            Explore interactive visual models and a guided practice check.
          </p>
        </div>

        <button
          onClick={() => onNavigate('intervention')}
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 min-h-[44px]"
        >
          <span>Open instructional help</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Technical Accordion Details */}
      <div className="border border-neutral-200 rounded-lg bg-white overflow-hidden">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer min-h-[44px]"
        >
          <span className="text-sm font-medium text-neutral-700">
            Technical Probability & Hypothesis Breakdown
          </span>
          {showTechnicalDetails ? (
            <ChevronUp className="w-4 h-4 text-neutral-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          )}
        </button>

        {showTechnicalDetails && (
          <div className="p-6 pt-2 border-t border-neutral-200 bg-neutral-50 space-y-5 text-sm text-neutral-700">
            <div className="space-y-3">
              <div className="font-semibold text-neutral-900">
                Category Hypothesis Distribution:
              </div>
              {(['C1', 'C2', 'C3', 'C4', 'C5'] as const).map((cat) => {
                const prob = (diagnosis.probabilities && diagnosis.probabilities[cat]) || 0.1;
                const pct = Math.round(prob * 100);
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{cat} · {gapLabels[cat]}</span>
                      <span className="font-mono font-medium">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-800 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {bayesianSteps && (
              <div className="pt-3 border-t border-neutral-200 space-y-2">
                <div className="font-semibold text-neutral-900">
                  Bayesian Update Calculations:
                </div>
                <div className="text-xs text-neutral-600">{bayesianExplanation}</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono text-left">
                    <thead>
                      <tr className="border-b border-neutral-300 text-neutral-500">
                        <th className="py-1">Category</th>
                        <th className="py-1 px-2">Prior</th>
                        <th className="py-1 px-2">Likelihood</th>
                        <th className="py-1 px-2 text-neutral-900 font-semibold">Posterior</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {bayesianSteps.map((step) => (
                        <tr key={step.category}>
                          <td className="py-1 font-semibold">{step.category}</td>
                          <td className="py-1 px-2">{(step.prior * 100).toFixed(1)}%</td>
                          <td className="py-1 px-2">{step.likelihood.toFixed(1)}x</td>
                          <td className="py-1 px-2 font-semibold text-neutral-900">
                            {(step.normalized_posterior * 100).toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
