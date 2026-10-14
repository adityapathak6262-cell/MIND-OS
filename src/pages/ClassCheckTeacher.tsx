import React, { useState, useEffect } from 'react';
import { PageId } from '../components/Header';
import { api } from '../services/api';
import {
  ClassCheck,
  ClassCheckResults,
  ClassCheckComparison,
  RosterStudent,
  ConceptNode,
  DiagnosticQuestion,
  StudentTopicEvidenceSummary
} from '../types';
import { LongitudinalEvidenceTimeline } from '../components/LongitudinalEvidenceTimeline';
import { MathExpression } from '../components/MathExpression';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Plus,
  Copy,
  ExternalLink,
  BookOpen,
  Check,
  Clock,
  BarChart2,
  History,
  RotateCcw
} from 'lucide-react';

interface ClassCheckTeacherProps {
  onNavigate: (page: PageId) => void;
  onOpenStudentQuiz: (checkId: string) => void;
}

export const ClassCheckTeacher: React.FC<ClassCheckTeacherProps> = ({
  onNavigate,
  onOpenStudentQuiz
}) => {
  const [checks, setChecks] = useState<ClassCheck[]>([]);
  const [selectedCheckId, setSelectedCheckId] = useState<string>('CHK-DEMO-01');
  const [results, setResults] = useState<ClassCheckResults | null>(null);
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [comparison, setComparison] = useState<ClassCheckComparison | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Longitudinal Evidence Modal state
  const [selectedStudentEvidence, setSelectedStudentEvidence] = useState<StudentTopicEvidenceSummary | null>(null);
  const [loadingEvidence, setLoadingEvidence] = useState<boolean>(false);
  const [resettingDemo, setResettingDemo] = useState<boolean>(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'patterns' | 'students' | 'comparison'>('patterns');
  const [studentFilter, setStudentFilter] = useState<'all' | 'needs_followup' | 'understood'>('all');

  // Teacher note editing state
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');
  const [savingNote, setSavingNote] = useState<boolean>(false);

  // Create Check Modal state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [conceptGraph, setConceptGraph] = useState<ConceptNode[]>([]);
  const [questionsBank, setQuestionsBank] = useState<DiagnosticQuestion[]>([]);

  // Creator form fields
  const [newClassLevel, setNewClassLevel] = useState<string>('Class 10');
  const [newSubject, setNewSubject] = useState<string>('Science');
  const [newConceptId, setNewConceptId] = useState<string>('SCI-10-ELEC-01');
  const [newQuestionId, setNewQuestionId] = useState<string>('Q-ELEC-01');
  const [newTitle, setNewTitle] = useState<string>('Exit Ticket: Electric Current & Series Circuits');
  const [creatingCheck, setCreatingCheck] = useState<boolean>(false);

  // Loading data
  const loadCheckList = async () => {
    try {
      const res = await api.getClassChecks();
      setChecks(res.checks);
      return res.checks;
    } catch (err: any) {
      console.error('Failed to load checks list', err);
      setError(err?.message || 'Failed to load checks');
      return [];
    }
  };

  const loadCheckDetails = async (checkId: string) => {
    setRefreshing(true);
    try {
      const [resultsRes, rosterRes] = await Promise.all([
        api.getClassCheckResults(checkId),
        api.getClassCheckRoster(checkId)
      ]);
      setResults(resultsRes.results);
      setRoster(rosterRes.roster);

      if (resultsRes.results.check.is_reteach || resultsRes.results.has_linked_reteach) {
        try {
          const compRes = await api.getClassCheckComparison(checkId);
          setComparison(compRes.comparison);
        } catch (errComp) {
          console.warn('Comparison unavailable:', errComp);
          setComparison(null);
        }
      } else {
        setComparison(null);
      }
    } catch (err: any) {
      console.error('Failed to load check details', err);
      setError(err?.message || 'Failed to load results');
    } finally {
      setRefreshing(false);
    }
  };

  const initData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [checksList, graphRes, qRes] = await Promise.all([
        loadCheckList(),
        api.getConceptGraph(),
        api.getQuestions()
      ]);
      setConceptGraph(graphRes.nodes);
      setQuestionsBank(qRes.questions);

      const targetId = checksList.length > 0 ? checksList[0].id : selectedCheckId;
      setSelectedCheckId(targetId);
      await loadCheckDetails(targetId);
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize page');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const handleSelectCheck = async (checkId: string) => {
    setSelectedCheckId(checkId);
    await loadCheckDetails(checkId);
  };

  const handleCopyJoinLink = () => {
    if (!results?.check) return;
    const url = `${window.location.origin}/#quiz/${results.check.code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleCreateCheckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCheck(true);
    try {
      const res = await api.createClassCheck({
        title: newTitle,
        concept_id: newConceptId,
        question_id: newQuestionId,
        class_level: newClassLevel,
        subject: newSubject,
        chapter: conceptGraph.find((c) => c.id === newConceptId)?.chapter || 'CBSE Topic'
      });
      setShowCreateModal(false);
      await loadCheckList();
      await handleSelectCheck(res.check.id);
    } catch (err: any) {
      alert(`Error creating check: ${err.message}`);
    } finally {
      setCreatingCheck(false);
    }
  };

  const handleSaveTeacherNote = async (submissionId: string) => {
    if (!results?.check) return;
    setSavingNote(true);
    try {
      await api.reviewClassCheckSubmission(results.check.id, submissionId, noteText, true);
      await loadCheckDetails(results.check.id);
      setEditingSubId(null);
      setNoteText('');
    } catch (err: any) {
      alert(`Error saving note: ${err.message}`);
    } finally {
      setSavingNote(false);
    }
  };

  const handleCreateReteach = async () => {
    if (!results?.check) return;
    setRefreshing(true);
    try {
      const res = await api.createReteachCheck(results.check.id);
      await loadCheckList();
      await handleSelectCheck(res.reteach_check.id);
      setActiveTab('patterns');
    } catch (err: any) {
      alert(`Error creating reteach: ${err.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSimulateDemoResponses = async () => {
    if (!results?.check) return;
    setRefreshing(true);
    try {
      await api.submitClassCheckAnswer(results.check.id, {
        student_id: 'STD-107',
        student_name: 'Meera Nair',
        student_answer: '2/5',
        student_explanation: 'Added numerators and denominators straight across.',
        confidence: 4
      });
      await loadCheckDetails(results.check.id);
    } catch (err: any) {
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleResetDemoData = async () => {
    setResettingDemo(true);
    try {
      await api.resetDemoEvidence();
      await loadCheckDetails(selectedCheckId);
    } catch (err: any) {
      console.error('Reset failed:', err);
    } finally {
      setResettingDemo(false);
    }
  };

  const handleInspectStudentEvidence = async (studentId: string, conceptId: string) => {
    setLoadingEvidence(true);
    try {
      const res = await api.getStudentEvidence(studentId, conceptId);
      setSelectedStudentEvidence(res.evidence);
    } catch (err: any) {
      alert(`Could not load evidence history: ${err.message}`);
    } finally {
      setLoadingEvidence(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="w-6 h-6 text-neutral-600 animate-spin mx-auto" />
        <p className="text-base text-neutral-600">Loading Post-Lesson Class Check...</p>
      </div>
    );
  }

  const check = results?.check;
  const submissions: import('../types').ClassCheckSubmission[] = results?.student_submissions || [];

  const filteredSubmissions = submissions.filter((s: import('../types').ClassCheckSubmission) => {
    if (studentFilter === 'needs_followup') return !s.is_understood;
    if (studentFilter === 'understood') return s.is_understood;
    return true;
  });

  const awaitingStudents = roster.filter((r) => {
    return !submissions.some((s: import('../types').ClassCheckSubmission) => s.student_id === r.id);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24">
      {/* 1. Header Bar: Title, Check Switcher, and Create Button */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-neutral-200 space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
              Teacher Workflow · Post-Lesson Class Check · Demo Class
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              Post-Lesson Class Check
            </h1>
            <p className="text-base text-neutral-600 mt-2 max-w-2xl leading-relaxed">
              Assign diagnostic check items, review class response patterns, record notes, and assign isomorphic transfer checks after reteaching.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start">
            <button
              onClick={() => onNavigate('taxonomy-registry')}
              className="px-3.5 py-2 bg-white hover:bg-neutral-50 text-neutral-800 text-sm font-medium rounded-lg transition-colors border border-neutral-300 flex items-center gap-1.5 cursor-pointer min-h-[42px]"
              title="Browse all 50 learning-pattern definitions"
            >
              <BookOpen className="w-4 h-4 text-neutral-700" />
              <span>Taxonomy</span>
            </button>

            <button
              onClick={handleResetDemoData}
              disabled={resettingDemo}
              className="px-3.5 py-2 bg-white hover:bg-neutral-50 text-neutral-700 text-sm font-medium rounded-lg transition-colors border border-neutral-300 flex items-center gap-1.5 cursor-pointer min-h-[42px]"
              title="Reset demo responses"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resettingDemo ? 'animate-spin' : ''}`} />
              <span>{resettingDemo ? 'Resetting...' : 'Reset demo'}</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer min-h-[42px] shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>New class check</span>
            </button>
          </div>
        </div>

        {/* Dedicated Active Check Selector & Quick Info Bar */}
        <div className="pt-4 border-t border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 min-w-0">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 shrink-0">
              Active Check:
            </label>
            <div className="relative flex-1 max-w-2xl">
              <select
                value={selectedCheckId}
                onChange={(e) => handleSelectCheck(e.target.value)}
                className="w-full text-sm font-medium bg-neutral-50 hover:bg-neutral-100 border border-neutral-300 rounded-lg px-3.5 py-2.5 text-neutral-900 transition-colors cursor-pointer min-h-[44px] focus:ring-2 focus:ring-neutral-900"
              >
                {checks.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.code}) {c.is_reteach ? '· Reteach' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {check && (
            <div className="flex items-center gap-2 shrink-0 text-xs font-medium text-neutral-600">
              <span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-md font-mono border border-neutral-200">
                Code: {check.code}
              </span>
              <span className="px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-md border border-neutral-200">
                {check.class_level} · {check.subject}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => loadCheckDetails(selectedCheckId)}
              className="text-xs font-semibold underline hover:no-underline cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* 2. Active Check Summary Banner */}
      {check && (
        <div className="bg-[#0e2f23] text-white rounded-xl p-6 sm:p-8 space-y-6 shadow-sm border border-[#1b4d3a]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#1b4d3a]/80">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-300">
                <span className="bg-[#1b4d3a] px-2.5 py-1 rounded font-mono text-emerald-200">
                  {check.class_level} · {check.subject}
                </span>
                <span>·</span>
                <span>{check.chapter}</span>
                {check.is_reteach && (
                  <span className="border border-emerald-400/50 bg-emerald-950/40 px-2 py-0.5 rounded text-xs text-emerald-200">
                    Follow-Up Transfer Check
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
                {check.title}
              </h2>
              <p className="text-sm text-neutral-300 max-w-2xl leading-relaxed">
                Diagnostic Question: &quot;{check.question.prompt}&quot;
              </p>
            </div>

            {/* Join Code */}
            <div className="flex items-center gap-4 bg-[#163e30] p-4 rounded-lg border border-[#235843] shrink-0">
              <div>
                <div className="text-[11px] text-emerald-300/80 uppercase tracking-wider font-semibold">
                  Student Join Code
                </div>
                <div className="text-2xl font-mono font-bold tracking-wider text-white">
                  {check.code}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleCopyJoinLink}
                  className="px-3 py-1.5 bg-[#235843] hover:bg-[#2c6e54] text-white text-xs font-medium rounded transition-colors flex items-center gap-1 cursor-pointer min-h-[32px]"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy link'}</span>
                </button>

                <button
                  onClick={() => onOpenStudentQuiz(check.id)}
                  className="px-3 py-1.5 bg-white text-[#0e2f23] hover:bg-neutral-100 font-semibold text-xs rounded transition-colors flex items-center gap-1 cursor-pointer min-h-[32px] shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Student view</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-[#163e30] rounded-lg border border-[#235843]">
              <div className="text-xs text-emerald-200/80">Submissions</div>
              <div className="text-2xl font-semibold font-mono text-white mt-1">
                {results?.total_submissions} / {results?.total_roster}
              </div>
              <div className="text-xs text-neutral-300 mt-1">
                {Math.round(((results?.total_submissions || 0) / (results?.total_roster || 1)) * 100)}% response rate
              </div>
            </div>

            <div className="p-4 bg-[#163e30] rounded-lg border border-[#235843]">
              <div className="text-xs text-emerald-200/80">Likely Understood</div>
              <div className="text-2xl font-semibold font-mono text-emerald-300 mt-1">
                {results?.understood_count} ({results?.understood_percentage}%)
              </div>
              <div className="text-xs text-neutral-300 mt-1">
                Accurate logic & calculation
              </div>
            </div>

            <div className="p-4 bg-[#163e30] rounded-lg border border-[#235843]">
              <div className="text-xs text-emerald-200/80">Needs Support</div>
              <div className="text-2xl font-semibold font-mono text-amber-300 mt-1">
                {results?.needs_support_count} ({100 - (results?.understood_percentage || 0)}%)
              </div>
              <div className="text-xs text-neutral-300 mt-1">
                Pattern hypothesis detected
              </div>
            </div>

            <div className="p-4 bg-[#163e30] rounded-lg border border-[#235843] flex flex-col justify-between">
              <div>
                <div className="text-xs text-emerald-200/80">Status</div>
                <div className="text-sm font-medium text-emerald-200 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Collecting responses</span>
                </div>
              </div>
              <button
                onClick={() => loadCheckDetails(check.id)}
                disabled={refreshing}
                className="text-xs text-emerald-300 hover:text-white flex items-center gap-1 pt-2 cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh live data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-neutral-200 text-sm font-medium text-neutral-600 gap-6">
        <button
          onClick={() => setActiveTab('patterns')}
          className={`pb-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 min-h-[44px] ${
            activeTab === 'patterns'
              ? 'border-neutral-900 text-neutral-900 font-semibold'
              : 'border-transparent hover:text-neutral-900'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Class Misconception Patterns</span>
          {results?.patterns && (
            <span className="bg-neutral-100 text-neutral-800 text-xs px-2 py-0.5 rounded font-mono">
              {results.patterns.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 min-h-[44px] ${
            activeTab === 'students'
              ? 'border-neutral-900 text-neutral-900 font-semibold'
              : 'border-transparent hover:text-neutral-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Submissions & Notes</span>
          <span className="bg-neutral-100 text-neutral-800 text-xs px-2 py-0.5 rounded font-mono">
            {submissions.length}
          </span>
        </button>

        {comparison && (
          <button
            onClick={() => setActiveTab('comparison')}
            className={`pb-3.5 border-b-2 transition-colors cursor-pointer flex items-center gap-2 min-h-[44px] ${
              activeTab === 'comparison'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent hover:text-neutral-900'
            }`}
          >
            <span>Pre vs Post Reteach Comparison</span>
          </button>
        )}
      </div>

      {/* 4. Tab 1: Patterns & Reteach Strategy */}
      {activeTab === 'patterns' && results && (
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-neutral-900">
                  Observed Response Patterns
                </h3>
                <p className="text-sm text-neutral-600">
                  Actual student answers grouped by candidate misconception hypotheses.
                </p>
              </div>

              {submissions.length === 0 && (
                <button
                  onClick={handleSimulateDemoResponses}
                  className="text-sm bg-neutral-100 text-neutral-900 border border-neutral-300 px-3 py-1.5 rounded-lg hover:bg-neutral-200 font-medium transition-colors cursor-pointer min-h-[40px]"
                >
                  + Add 2 Demo Responses (Testing)
                </button>
              )}
            </div>

            {results.patterns.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {results.patterns.map((pat) => (
                  <div
                    key={pat.id}
                    className="p-6 bg-white rounded-lg border border-neutral-200 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs font-semibold text-neutral-800 bg-neutral-100 border border-neutral-300 px-2.5 py-1 rounded">
                          {pat.status_label} · {pat.category}
                        </span>
                        <div className="text-right">
                          <span className="text-base font-semibold font-mono text-neutral-900">
                            {pat.frequency} students
                          </span>
                          <span className="text-xs text-neutral-500 ml-1">
                            ({pat.percentage}%)
                          </span>
                        </div>
                      </div>

                      <h4 className="text-lg font-semibold text-neutral-900 leading-snug">
                        {pat.name}
                      </h4>

                      <p className="text-base text-neutral-600 leading-relaxed">
                        {pat.evidence_description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-100">
                      <div className="text-xs font-medium text-neutral-500 mb-1.5">
                        Students exhibiting this signal:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {pat.affected_students.map((name) => (
                          <span
                            key={name}
                            className="text-xs px-2.5 py-1 bg-neutral-100 text-neutral-800 rounded border border-neutral-200 font-medium"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-white border border-neutral-200 rounded-lg text-center text-sm text-neutral-600 space-y-3">
                <CheckCircle2 className="w-8 h-8 text-neutral-700 mx-auto" />
                <p className="text-base font-semibold text-neutral-900">
                  {submissions.length === 0
                    ? 'No responses submitted for this check yet.'
                    : 'All submitted responses demonstrate correct understanding.'}
                </p>
                {submissions.length === 0 && (
                  <p className="text-sm text-neutral-500">
                    Students can join using code <strong>{check?.code}</strong>.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Reteach Recommendation Panel */}
          <section className="bg-white border border-neutral-300 rounded-lg p-6 sm:p-8 space-y-5">
            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Recommended Instructional Strategy · 5-Minute Reteach
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-neutral-900">
                {results.suggested_reteach_activity.title}
              </h3>
              <p className="text-base text-neutral-700 leading-relaxed">
                {results.suggested_reteach_activity.description}
              </p>
            </div>

            {/* Turn & Talk Prompt */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-1">
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1.5">
                <div className="font-semibold text-neutral-900">
                  Class Discussion Prompt:
                </div>
                <p className="text-neutral-800 italic leading-relaxed">
                  {results.suggested_reteach_activity.partner_prompt}
                </p>
              </div>

              {results.suggested_reteach_activity.counterexample && (
                <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-1.5">
                  <div className="font-semibold text-neutral-900">
                    Concrete Counterexample:
                  </div>
                  <p className="font-mono text-neutral-900 font-medium leading-relaxed">
                    {results.suggested_reteach_activity.counterexample}
                  </p>
                </div>
              )}
            </div>

            {/* Reteach Follow-Up Action */}
            <div className="pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200">
              <div className="text-sm text-neutral-600">
                Assign a transfer check to compare student answers before and after reteaching.
              </div>

              {results.has_linked_reteach ? (
                <button
                  onClick={() => handleSelectCheck(results.linked_reteach_id!)}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <span>Open follow-up check</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleCreateReteach}
                  disabled={refreshing}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Launch follow-up transfer check</span>
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      {/* 5. Tab 2: Named Student Submissions & Teacher Notes */}
      {activeTab === 'students' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-neutral-900">
                Class Submissions & Review
              </h3>
              <p className="text-sm text-neutral-600">
                Inspect individual student steps, review multi-test audit histories, and record instructional notes.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={() => setStudentFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer min-h-[36px] ${
                  studentFilter === 'all'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                All ({submissions.length})
              </button>
              <button
                onClick={() => setStudentFilter('needs_followup')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer min-h-[36px] ${
                  studentFilter === 'needs_followup'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                Needs Follow-Up ({results?.needs_support_count || 0})
              </button>
              <button
                onClick={() => setStudentFilter('understood')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer min-h-[36px] ${
                  studentFilter === 'understood'
                    ? 'bg-neutral-900 text-white'
                    : 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                Understood ({results?.understood_count || 0})
              </button>
            </div>
          </div>

          {/* Student Submissions List */}
          <div className="space-y-3">
            {filteredSubmissions.map((sub: import('../types').ClassCheckSubmission) => (
              <div
                key={sub.id}
                className="p-5 rounded-lg border border-neutral-200 bg-white space-y-3"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900 text-base">
                        {sub.student_name}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded border border-neutral-300 bg-neutral-100 text-neutral-800 font-medium">
                        {sub.detected_signal.label}
                      </span>
                      {sub.teacher_reviewed && (
                        <span className="text-xs text-neutral-600 bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200 font-medium">
                          Reviewed
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm pt-1">
                      <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <span className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Answer</span>
                        <div className="font-mono font-semibold text-neutral-900 mt-0.5">
                          {sub.student_answer}
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                        <span className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Explanation</span>
                        <div className="text-neutral-800 mt-0.5 italic">
                          &quot;{sub.student_explanation || 'No steps provided'}&quot;
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-neutral-600 pt-1">
                      <strong>Observed signal:</strong> {sub.detected_signal.description}
                    </div>

                    {sub.teacher_note && (
                      <div className="text-sm p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900">
                        <strong>Teacher note:</strong> {sub.teacher_note}
                      </div>
                    )}
                  </div>

                  {/* Actions / Add Note */}
                  <div className="shrink-0 flex flex-col items-end gap-2 text-xs">
                    <div className="text-neutral-500 text-xs">
                      Confidence: <strong>{sub.confidence} / 5</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => check?.concept_id && handleInspectStudentEvidence(sub.student_id, check.concept_id)}
                        disabled={loadingEvidence || !check?.concept_id}
                        className="px-3 py-1.5 bg-white hover:bg-neutral-50 text-neutral-900 border border-neutral-300 rounded-lg font-medium transition-colors cursor-pointer text-xs flex items-center gap-1.5 min-h-[36px]"
                        title="View multi-test history and candidate hypotheses"
                      >
                        <History className="w-3.5 h-3.5 text-neutral-700" />
                        <span>Inspect history</span>
                      </button>

                      {editingSubId === sub.id ? (
                        <div className="w-64 space-y-2 p-3 bg-white border border-neutral-300 rounded-lg shadow-sm">
                          <textarea
                            rows={2}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add teacher note..."
                            className="w-full text-xs p-2 border border-neutral-300 rounded-lg"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingSubId(null)}
                              className="px-2 py-1 text-neutral-600 hover:text-neutral-900 text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveTeacherNote(sub.id)}
                              disabled={savingNote}
                              className="px-3 py-1 bg-neutral-900 text-white rounded text-xs font-medium cursor-pointer"
                            >
                              {savingNote ? 'Saving...' : 'Save note'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingSubId(sub.id);
                            setNoteText(sub.teacher_note || '');
                          }}
                          className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg font-medium transition-colors cursor-pointer text-xs min-h-[36px]"
                        >
                          {sub.teacher_note ? 'Edit note' : '+ Add note'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredSubmissions.length === 0 && (
              <div className="p-8 bg-white border border-neutral-200 rounded-lg text-center text-sm text-neutral-500">
                No submissions match this filter.
              </div>
            )}
          </div>

          {/* Awaiting Submissions Panel */}
          {awaitingStudents.length > 0 && (
            <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
                <Clock className="w-4 h-4 text-neutral-600" />
                <span>Pending Submissions ({awaitingStudents.length} Students):</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {awaitingStudents.map((st) => (
                  <span
                    key={st.id}
                    className="text-xs px-3 py-1 bg-white border border-neutral-200 rounded text-neutral-700"
                  >
                    {st.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. Tab 3: Pre vs Post Reteach Comparison */}
      {activeTab === 'comparison' && comparison && (
        <div className="space-y-6">
          <div className="bg-white border border-neutral-300 rounded-lg p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Transfer Evidence & Reteach Comparison
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-neutral-900">
                Reteach Impact: {comparison.concept_name}
              </h3>
              <p className="text-base text-neutral-600 leading-relaxed max-w-3xl">
                {comparison.summary}
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="text-xs text-neutral-500 font-medium">Pre-Check Understanding</div>
                <div className="text-2xl font-semibold font-mono text-neutral-900 mt-1">
                  {comparison.pre_understood_count} / {comparison.matched_students_count}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  Initial diagnostic check
                </div>
              </div>

              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="text-xs text-neutral-500 font-medium">Post-Reteach Understanding</div>
                <div className="text-2xl font-semibold font-mono text-neutral-900 mt-1">
                  {comparison.post_understood_count} / {comparison.matched_students_count}
                </div>
                <div className="text-xs text-neutral-600 mt-0.5 font-medium">
                  {Math.round((comparison.post_understood_count / (comparison.matched_students_count || 1)) * 100)}% on transfer item
                </div>
              </div>

              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="text-xs text-neutral-500 font-medium">Improved Students</div>
                <div className="text-2xl font-semibold font-mono text-neutral-900 mt-1">
                  {comparison.improved_students.length}
                </div>
                <div className="text-xs text-neutral-600 mt-0.5 font-medium">
                  Resolved prior misconception
                </div>
              </div>
            </div>

            {/* Student Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <CheckCircle2 className="w-4 h-4 text-neutral-700" />
                  <span>Demonstrated Transfer on Follow-Up:</span>
                </div>
                {comparison.improved_students.length > 0 ? (
                  <div className="space-y-2">
                    {comparison.improved_students.map((name) => (
                      <div
                        key={name}
                        className="p-3 bg-white border border-neutral-200 rounded text-sm space-y-1"
                      >
                        <div className="font-semibold text-neutral-900">{name}</div>
                        <div className="text-neutral-600 text-xs">
                          Replaced initial error pattern with correct common denominator logic.
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">None yet.</p>
                )}
              </div>

              <div className="p-5 bg-neutral-50 rounded-lg border border-neutral-200 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <AlertTriangle className="w-4 h-4 text-neutral-700" />
                  <span>Persistent Pattern (Recommended for 1-on-1):</span>
                </div>
                {comparison.persistent_students.length > 0 ? (
                  <div className="space-y-2">
                    {comparison.persistent_students.map((name) => (
                      <div
                        key={name}
                        className="p-3 bg-white border border-neutral-200 rounded text-sm space-y-1"
                      >
                        <div className="font-semibold text-neutral-900">{name}</div>
                        <div className="text-neutral-600 text-xs">
                          Pattern persisted on transfer check. Recommend 1-on-1 visual model practice.
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-neutral-500">
                    No students exhibited persistent misconceptions.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal: Create New Class Check */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-xl border border-neutral-300">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <div>
                <h3 className="text-xl font-semibold text-neutral-900">
                  Create Post-Lesson Class Check
                </h3>
                <p className="text-sm text-neutral-600 mt-1">
                  Select a topic from the CBSE curriculum map and choose an available diagnostic item.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-500 hover:text-neutral-800 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCheckSubmit} className="space-y-5 text-sm">
              <div className="space-y-4">
                <div className="font-semibold text-neutral-900">
                  1. Curriculum Concept
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-700 font-medium mb-1">Class Level:</label>
                    <select
                      value={newClassLevel}
                      onChange={(e) => setNewClassLevel(e.target.value)}
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 min-h-[44px]"
                    >
                      <option value="Class 10">Class 10</option>
                      <option value="Class 8">Class 8</option>
                      <option value="Class 7">Class 7</option>
                      <option value="Class 6">Class 6</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-700 font-medium mb-1">Subject:</label>
                    <select
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 min-h-[44px]"
                    >
                      <option value="Science">Science</option>
                      <option value="Mathematics">Mathematics</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-700 font-medium mb-1">Concept Topic:</label>
                  <select
                    value={newConceptId}
                    onChange={(e) => {
                      const cid = e.target.value;
                      setNewConceptId(cid);
                      const matchingConcept = conceptGraph.find((c) => c.id === cid);
                      const matchingQ = questionsBank.find((q) => q.concept_id === cid);
                      if (matchingQ) setNewQuestionId(matchingQ.id);
                      if (matchingConcept) {
                        setNewTitle(`Exit Ticket: ${matchingConcept.name}`);
                      }
                    }}
                    className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 min-h-[44px]"
                  >
                    {conceptGraph.map((node) => (
                      <option key={node.id} value={node.id}>
                        {node.has_diagnostic_items ? '✓ ' : '⚠️ '}
                        {node.name} ({node.class_level} · {node.subject} {node.has_diagnostic_items ? '· Configured' : '· Content in progress'})
                      </option>
                    ))}
                  </select>

                  {(() => {
                    const selNode = conceptGraph.find((c) => c.id === newConceptId);
                    if (selNode && !selNode.has_diagnostic_items) {
                      return (
                        <div className="mt-2 p-3 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-800 text-xs flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold">Diagnostic Questions In Progress:</span>
                            <p className="mt-0.5">
                              This syllabus topic is not yet mapped with validated diagnostic items. Please select a configured topic (e.g. Electric Current & Resistance, Real Numbers, Linear Equations).
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>

              {/* Diagnostic Question */}
              <div className="space-y-3 pt-2 border-t border-neutral-200">
                <div className="font-semibold text-neutral-900">
                  2. Diagnostic Question
                </div>
                <select
                  value={newQuestionId}
                  onChange={(e) => setNewQuestionId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 min-h-[44px]"
                >
                  {questionsBank.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title} ({q.id})
                    </option>
                  ))}
                </select>

                {(() => {
                  const selQ = questionsBank.find((q) => q.id === newQuestionId);
                  if (!selQ) return null;
                  return (
                    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2 text-sm">
                      <div className="font-medium text-neutral-700">Question Preview:</div>
                      <p className="text-neutral-900 italic">{selQ.prompt}</p>
                      {selQ.math_expression && (
                        <MathExpression expression={selQ.math_expression} className="my-2 p-3 text-base" />
                      )}
                      <div className="text-xs text-neutral-600">
                        Expected Answer: <strong>{selQ.expected_answer}</strong>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Title */}
              <div className="space-y-2 pt-2 border-t border-neutral-200">
                <div className="font-semibold text-neutral-900">
                  3. Check Title
                </div>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Exit Ticket: Electric Current in Series Circuits"
                  className="w-full p-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 min-h-[44px]"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-neutral-700 hover:text-neutral-900 font-medium cursor-pointer min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCheck}
                  className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-300 disabled:text-neutral-500 text-white font-medium rounded-lg cursor-pointer min-h-[44px]"
                >
                  {creatingCheck ? 'Creating...' : 'Start class check'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Modal: Student Longitudinal Evidence Timeline */}
      {selectedStudentEvidence && (
        <div className="fixed inset-0 z-50 bg-neutral-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-xl border border-neutral-300 relative">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
                  Auditable Evidence History
                </span>
                <h3 className="text-xl font-semibold text-neutral-900 mt-1">
                  Longitudinal Record: {selectedStudentEvidence.student_name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudentEvidence(null)}
                className="text-neutral-500 hover:text-neutral-800 text-lg font-bold p-1 cursor-pointer"
                title="Close evidence modal"
              >
                ✕
              </button>
            </div>

            <LongitudinalEvidenceTimeline
              evidence={selectedStudentEvidence}
              onRefresh={async () => {
                if (selectedStudentEvidence) {
                  const res = await api.getStudentEvidence(
                    selectedStudentEvidence.student_id,
                    selectedStudentEvidence.concept_id
                  );
                  setSelectedStudentEvidence(res.evidence);
                }
              }}
              isTeacherView={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
