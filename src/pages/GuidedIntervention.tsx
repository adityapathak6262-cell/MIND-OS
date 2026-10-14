import React, { useState, useEffect } from 'react';
import { PageId } from '../components/Header';
import { api } from '../services/api';
import { InterventionPayload } from '../types';
import { FractionVisualizer } from '../components/FractionVisualizer';
import { CircuitVisualizer } from '../components/CircuitVisualizer';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

interface GuidedInterventionProps {
  sessionId?: string;
  onNavigate: (page: PageId) => void;
}

export const GuidedIntervention: React.FC<GuidedInterventionProps> = ({ sessionId, onNavigate }) => {
  const [intervention, setIntervention] = useState<InterventionPayload | null>(null);
  const [selectedPracticeKey, setSelectedPracticeKey] = useState<string>('');
  const [practiceSubmitted, setPracticeSubmitted] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getIntervention(sessionId || '');
        setIntervention(data.intervention);
      } catch (err) {
        console.error('Failed to load intervention', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  if (loading || !intervention) {
    return (
      <div className="py-20 text-center text-base text-neutral-600">
        Loading targeted pedagogical intervention...
      </div>
    );
  }

  const { pedagogical_components: comp } = intervention;
  const currentPracticeOption = comp.guided_practice.options.find((o) => o.key === selectedPracticeKey);

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Intervention Header */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-neutral-200">
        <div className="text-sm text-neutral-500 mb-1">
          Instructional Strategy · {intervention.strategy_name}
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
          {intervention.title}
        </h1>
        <p className="text-base text-neutral-600 mt-2 leading-relaxed">
          {intervention.summary}
        </p>
      </div>

      {/* 1. Cognitive Conflict Counterexample (if present) */}
      {comp.cognitive_conflict_counterexample && (
        <section className="p-6 sm:p-8 bg-white rounded-lg border border-neutral-300 space-y-4">
          <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Concept Comparison: Why Direct Addition Fails
          </div>

          <div className="space-y-3">
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-sm text-neutral-800">
              <strong className="text-neutral-900">Observed Rule: </strong>
              {comp.cognitive_conflict_counterexample.flawed_claim}
            </div>

            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-sm text-neutral-800">
              <strong className="text-neutral-900">The Contradiction: </strong>
              {comp.cognitive_conflict_counterexample.contradiction}
            </div>

            <div className="p-4 bg-white rounded-lg border border-neutral-300 text-sm text-neutral-900">
              <strong className="text-neutral-900">Valid Mental Model: </strong>
              {comp.cognitive_conflict_counterexample.resolution}
            </div>
          </div>
        </section>
      )}

      {/* 2. Interactive Simulation Stage */}
      {comp.visual_model && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Interactive Concept Model</h2>
            <span className="text-sm text-neutral-500">Visual Representation</span>
          </div>

          {comp.visual_model.type === 'fraction_bars' ? (
            <FractionVisualizer />
          ) : comp.visual_model.type === 'circuit_simulation' ? (
            <CircuitVisualizer />
          ) : null}
        </section>
      )}

      {/* 3. Step-by-Step Worked Example */}
      {comp.worked_example && (
        <section className="p-6 sm:p-8 bg-white rounded-lg border border-neutral-200 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-neutral-900">
              Step-by-Step Worked Example
            </h2>
            <p className="text-sm font-mono text-neutral-700">
              Problem: {comp.worked_example.problem_statement}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {comp.worked_example.steps.map((step) => (
              <div
                key={step.step_number}
                className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded bg-neutral-900 text-white flex items-center justify-center font-mono text-xs font-semibold shrink-0 mt-0.5">
                  {step.step_number}
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-neutral-900">{step.instruction}</div>
                  <div className="text-sm text-neutral-600 leading-relaxed">{step.rationale}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Guided Practice Check */}
      <section className="p-6 sm:p-8 bg-white rounded-lg border border-neutral-200 space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-neutral-900">
            Guided Practice Check
          </h2>
          <p className="text-base text-neutral-800 leading-relaxed">
            {comp.guided_practice.question}
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          {comp.guided_practice.options.map((opt) => (
            <label
              key={opt.key}
              className={`flex items-start gap-3 p-4 rounded-lg border text-base cursor-pointer transition-colors ${
                selectedPracticeKey === opt.key
                  ? 'bg-neutral-50 border-neutral-900 font-medium text-neutral-900 ring-1 ring-neutral-900'
                  : 'bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-800'
              }`}
            >
              <input
                type="radio"
                name="practice"
                value={opt.key}
                checked={selectedPracticeKey === opt.key}
                onChange={() => {
                  setSelectedPracticeKey(opt.key);
                  setPracticeSubmitted(false);
                }}
                className="mt-1 accent-neutral-900 cursor-pointer"
              />
              <span className="flex-1 leading-relaxed">{opt.text}</span>
            </label>
          ))}
        </div>

        {!practiceSubmitted ? (
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setPracticeSubmitted(true)}
              disabled={!selectedPracticeKey}
              className="px-5 py-2.5 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500 rounded-lg transition-colors cursor-pointer min-h-[44px]"
            >
              Check answer
            </button>
          </div>
        ) : (
          currentPracticeOption && (
            <div className="p-4 rounded-lg border border-neutral-300 bg-neutral-50 text-sm flex items-start gap-3">
              {currentPracticeOption.is_correct ? (
                <CheckCircle2 className="w-5 h-5 text-neutral-800 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-neutral-700 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-semibold text-neutral-900">
                  {currentPracticeOption.is_correct ? 'Correct understanding' : 'Needs review'}
                </div>
                <div className="text-neutral-700 leading-relaxed">{currentPracticeOption.feedback}</div>
              </div>
            </div>
          )
        )}
      </section>

      {/* Transition to Reassessment */}
      <div className="p-6 bg-white rounded-lg border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Ready for Transfer Reassessment?</h3>
          <p className="text-sm text-neutral-600 mt-0.5">
            Check whether your understanding transfers to a new problem with changed numbers.
          </p>
        </div>

        <button
          onClick={() => onNavigate('reassessment')}
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0 min-h-[44px]"
        >
          <span>Begin reassessment</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
