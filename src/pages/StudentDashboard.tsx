import React, { useEffect, useState } from 'react';
import { PageId } from '../components/Header';
import { api } from '../services/api';
import { ConceptNode, StudentProfile } from '../types';
import { ArrowRight, ChevronRight, RefreshCw } from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (page: PageId) => void;
  onSelectConcept: (conceptId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate, onSelectConcept }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [conceptGraph, setConceptGraph] = useState<ConceptNode[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const filteredNodes = selectedSubject === 'All'
    ? conceptGraph
    : conceptGraph.filter((node) => node.subject === selectedSubject);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [progressData, graphData] = await Promise.all([
        api.getStudentProgress('STD-101'),
        api.getConceptGraph()
      ]);
      setProfile(progressData.profile);
      setConceptGraph(graphData.nodes);
    } catch (err: any) {
      console.error('Failed to load student progress', err);
      setLoadError(err?.message || 'Could not load student progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-5 h-5 text-neutral-600 animate-spin mx-auto" />
        <p className="text-base text-neutral-600">Loading progress overview...</p>
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-neutral-300 rounded-lg text-center space-y-4">
        <h2 className="text-lg font-semibold text-neutral-900">Could not load progress</h2>
        <p className="text-base text-neutral-600">{loadError || 'Unable to retrieve data.'}</p>
        <button
          onClick={loadData}
          className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer min-h-[44px]"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Student Profile Header */}
      <div className="bg-white p-6 sm:p-8 rounded-lg border border-neutral-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="text-sm text-neutral-500 mb-1">
            Demo learner · {profile.name} · {profile.class_level} ({profile.target_subject})
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-neutral-900 tracking-tight">
            Learning Overview
          </h1>
          <p className="text-base text-neutral-600 mt-2 max-w-xl leading-relaxed">
            Review your assigned check-ins, practice diagnostic questions, and inspect targeted feedback.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => onNavigate('student-quiz-check')}
            className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <span>Take class check</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Recommended Next Step */}
      <section className="p-6 bg-white border border-neutral-300 rounded-lg space-y-4">
        <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Recommended Next Step
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-neutral-900">
              Adding Unlike Fractions
            </h2>
            <p className="text-base text-neutral-600 leading-relaxed max-w-2xl">
              This sample profile starts with fraction addition as a suggested topic. Complete a new check to receive feedback based on your own answer and working.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('intervention')}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer min-h-[44px]"
            >
              View visual help
            </button>
            <button
              onClick={() => {
                onSelectConcept('MATH-FRAC-ADD-DIFF-DENOM');
                onNavigate('diagnostic-session');
              }}
              className="px-4 py-2 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-900 text-sm font-medium rounded-lg transition-colors cursor-pointer min-h-[44px]"
            >
              Practice question
            </button>
          </div>
        </div>
      </section>

      {/* Curriculum Topics Table */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">All Curriculum Topics</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Explore and practice across all subjects (Mathematics, Science & Social Science)</p>
          </div>

          {/* Subject Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-neutral-100 p-1 rounded-xl text-xs font-semibold">
            {['All', 'Mathematics', 'Science', 'Social Science'].map((sub) => {
              const active = selectedSubject === sub;
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    active
                      ? 'bg-white text-neutral-900 shadow-xs font-bold'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-white/50'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/80 text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">Topic & Subject</th>
                <th className="py-3.5 px-4">Level</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Practice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 text-sm">
              {filteredNodes.map((node) => {
                const mastery = profile.concept_mastery[node.id];
                const pct = mastery === undefined ? undefined : Math.round(mastery * 100);
                const statusLabel = pct === undefined
                  ? 'Ready to check'
                  : pct >= 75 ? 'Mastered' : pct >= 50 ? 'In Progress' : 'Review Suggested';

                const subjectColor = node.subject === 'Mathematics'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : node.subject === 'Science'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200';

                return (
                  <tr key={node.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-neutral-900 text-base">{node.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${subjectColor}`}>
                          {node.subject}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1 flex items-center gap-2">
                        <span>{node.chapter}</span>
                        {node.description && (
                          <>
                            <span>·</span>
                            <span className="text-neutral-400 line-clamp-1">{node.description}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="text-xs font-medium text-neutral-600 bg-neutral-100 px-2 py-1 rounded-md">
                        {node.class_level}
                      </span>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        pct !== undefined && pct >= 75
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : pct !== undefined && pct >= 50
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : pct !== undefined
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                      }`}>
                        {pct === undefined ? statusLabel : `${statusLabel} (${pct}%)`}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          onSelectConcept(node.id);
                          onNavigate('diagnostic-session');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs"
                      >
                        Practice <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
