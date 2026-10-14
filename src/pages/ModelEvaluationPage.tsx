import React, { useState, useEffect } from 'react';
import { PageId } from '../components/Header';
import { api } from '../services/api';
import { ModelMetrics, DataQualityReport } from '../types';
import { ShieldCheck } from 'lucide-react';

interface ModelEvaluationPageProps {
  onNavigate: (page: PageId) => void;
}

export const ModelEvaluationPage: React.FC<ModelEvaluationPageProps> = () => {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [m, q] = await Promise.all([
          api.getModelMetrics(),
          api.getDataQualityReport()
        ]);
        setMetrics(m);
        setQualityReport(q);
      } catch (err) {
        console.error('Failed to load model evaluation data', err);
        setLoadError('Evaluation data could not be loaded. Try again after checking the server connection.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-base text-neutral-600">
        Loading evaluation artefacts and data audit reports...
      </div>
    );
  }

  if (loadError || !metrics || !qualityReport) {
    return <div className="mind-card mx-auto my-16 max-w-xl space-y-3 p-8 text-center"><h2 className="text-lg font-bold text-neutral-900">Evaluation data unavailable</h2><p className="text-sm text-neutral-600">{loadError || 'No evaluation artifacts were returned by the server.'}</p></div>;
  }

  const lr = metrics.models.logistic_regression;
  const svm = metrics.models.linear_svm;
  const ruleBase = metrics.models.rule_based_baseline;

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="text-sm text-neutral-500 mb-1">
            Recorded model version: {metrics.model_version} · Reported question split
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
            System Evaluation & Data Quality
          </h1>
          <p className="text-base text-neutral-600 mt-2 max-w-xl leading-relaxed">
            These are the scores recorded in the project artifacts. The dataset counts do not currently reconcile, so treat the metrics as provisional until the evaluation is reproduced.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-neutral-800 bg-neutral-50 px-3.5 py-2 rounded-lg border border-neutral-300 shrink-0">
          <ShieldCheck className="w-4 h-4 text-neutral-700" />
          <span>Artifact loaded · provenance needs review</span>
        </div>
      </div>

      {/* Model Benchmark Architecture */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900">Model Architecture Comparisons</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Model 1 */}
          <div className="p-6 bg-white rounded-lg border border-neutral-200 flex flex-col justify-between space-y-4">
            <div>
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Recorded comparator · provenance pending
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Rule-Based Matcher</h3>
              <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
                Question-specific distractor matching. The recorded score needs reproducible evaluation before being treated as a product benchmark.
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-200 flex items-baseline justify-between">
              <span className="text-sm text-neutral-600">Recorded Macro-F1:</span>
              <span className="text-xl font-mono font-semibold text-neutral-900 tabular-nums">
                {ruleBase.macro_f1.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Model 2 */}
          <div className="p-6 bg-white rounded-lg border border-neutral-300 flex flex-col justify-between space-y-4">
            <div>
              <div className="text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Experimental · offline only
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Logistic Regression</h3>
              <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
                TF-IDF n-grams (1, 2) + token normalization + OneVsRest calibrated probability estimation.
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-200 flex items-baseline justify-between">
              <span className="text-sm text-neutral-600">Recorded test Macro-F1:</span>
              <span className="text-xl font-mono font-semibold text-neutral-900 tabular-nums">
                {lr.macro_f1.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Model 3 */}
          <div className="p-6 bg-white rounded-lg border border-neutral-200 flex flex-col justify-between space-y-4">
            <div>
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Experimental · offline only
              </div>
              <h3 className="text-lg font-semibold text-neutral-900">Linear SVM</h3>
              <p className="text-sm text-neutral-600 mt-1 leading-relaxed">
                LinearSVC with Platt Scaling / CalibratedClassifierCV across 3 folds.
              </p>
            </div>
            <div className="pt-4 border-t border-neutral-200 flex items-baseline justify-between">
              <span className="text-sm text-neutral-600">Recorded test Macro-F1:</span>
              <span className="text-xl font-mono font-semibold text-neutral-900 tabular-nums">
                {svm.macro_f1.toFixed(3)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Per-Class Table */}
      {lr.per_class && (
        <section className="p-6 bg-white border border-neutral-200 rounded-lg space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              Per-Class Metrics on Unseen Questions
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Breakdown across C1 (Conceptual), C2 (Logical Reasoning), C3 (Procedural), C4 (Misconception), C5 (Formula Recall).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 text-neutral-600 font-semibold bg-neutral-50">
                  <th className="py-3 px-4">Taxonomy Class</th>
                  <th className="py-3 px-4 font-mono">Precision</th>
                  <th className="py-3 px-4 font-mono">Recall</th>
                  <th className="py-3 px-4 font-mono">F1-Score</th>
                  <th className="py-3 px-4 font-mono">Support</th>
                  <th className="py-3 px-4 font-mono">Brier Score</th>
                  <th className="py-3 px-4 font-mono">Matrix [TN, FP / FN, TP]</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 font-mono text-sm">
                {Object.entries(lr.per_class).map(([clsKey, cMetrics]) => {
                  const cm = lr.confusion_matrices?.[clsKey] || [
                    [],
                    []
                  ];
                  const brier = lr.brier_calibration_scores?.[clsKey];

                  return (
                    <tr key={clsKey} className="hover:bg-neutral-50">
                      <td className="py-3.5 px-4 font-sans font-medium text-neutral-900">
                        {clsKey}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums text-neutral-700">
                        {cMetrics.precision.toFixed(3)}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums text-neutral-700">
                        {cMetrics.recall.toFixed(3)}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums font-semibold text-neutral-900">
                        {cMetrics.f1_score.toFixed(3)}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums text-neutral-600">
                        {cMetrics.support}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums text-neutral-600">
                        {brier !== undefined ? brier.toFixed(4) : '—'}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums text-xs text-neutral-500">
                        {cm.length === 2 && cm[0].length === 2 && cm[1].length === 2
                          ? `[${cm[0][0]}, ${cm[0][1]} / ${cm[1][0]}, ${cm[1][1]}]`
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-700 leading-relaxed">
            <strong>Current Runtime:</strong> The diagnostic flow uses question-specific answer and distractor matching, then leaves the candidate unverified until follow-up evidence is submitted. The statistical classifier is not used to override that evidence.
          </div>
        </section>
      )}

      {/* Dataset Quality Report */}
      <section className="p-6 bg-white border border-neutral-200 rounded-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">
              Dataset Ingestion & Quality Audit
            </h2>
            <p className="text-sm text-neutral-600 mt-0.5">
              Source breakdown, validation checks, and schema compliance.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-neutral-800 bg-neutral-100 px-3 py-1 rounded border border-neutral-300">
              {qualityReport.schema_compliance_rate_pct}% Schema Compliance
            </span>
          </div>
        </div>

        {/* Sources Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.entries(qualityReport.sources).map(([sourceName, sStats]) => (
            <div key={sourceName} className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg text-sm">
              <div className="font-semibold text-neutral-900 mb-1">{sourceName}</div>
              <div className="text-neutral-600">
                Raw items: <strong className="font-mono text-neutral-800">{sStats.raw_count}</strong>
              </div>
              <div className="text-neutral-600 mt-0.5">
                Validated: <strong className="font-mono text-neutral-800">{sStats.validated_count || sStats.raw_count}</strong>
              </div>
            </div>
          ))}
        </div>

        {/* Quality Guarantees */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1">
            <h3 className="font-semibold text-neutral-900">Missing Values Audit:</h3>
            <p className="text-neutral-600 leading-relaxed">
              {Object.values(qualityReport.missing_values_by_field || {}).reduce((sum, count) => sum + count, 0)} missing values are recorded across {Object.keys(qualityReport.missing_values_by_field || {}).length} audited fields. This reports the data audit file; it is not a measure of diagnostic accuracy.
            </p>
          </div>
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1">
            <h3 className="font-semibold text-neutral-900">Licensing & Attribution:</h3>
            <p className="text-neutral-600 leading-relaxed">
              Check the source dataset’s current license and attribution terms before reusing any records outside this project.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
