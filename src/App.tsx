/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { Header, PageId, UserRole } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { DiagnosticSession } from './pages/DiagnosticSession';
import { DiagnosticReport } from './pages/DiagnosticReport';
import { GuidedIntervention } from './pages/GuidedIntervention';
import { ReassessmentPage } from './pages/ReassessmentPage';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { ModelEvaluationPage } from './pages/ModelEvaluationPage';
import { ClassCheckTeacher } from './pages/ClassCheckTeacher';
import { StudentClassCheckQuiz } from './pages/StudentClassCheckQuiz';
import { TaxonomyRegistry } from './pages/TaxonomyRegistry';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { DiagnosticResult, TargetedFollowup } from './types';

interface ErrorBoundaryProps {
  children: ReactNode;
  onReset: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || 'An unexpected error occurred.' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Diagnostic Interface Error Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-neutral-300 rounded-lg text-center space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Session Resynchronization Required</h2>
          <p className="text-base text-neutral-600 leading-relaxed">
            The diagnostic session encountered an unexpected issue: {this.state.errorMessage}
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
                this.props.onReset();
              }}
              className="px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer min-h-[44px]"
            >
              Restart session
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>('landing');
  const [userRole, setUserRole] = useState<'student' | 'teacher'>('student');
  const [selectedConceptId, setSelectedConceptId] = useState<string>('MATH-FRAC-ADD-DIFF-DENOM');
  const [activeClassCheckId, setActiveClassCheckId] = useState<string>('CHK-DEMO-01');

  // Active diagnostic session state
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [activeDiagnosis, setActiveDiagnosis] = useState<DiagnosticResult>({
    primary_gap: 'C1',
    candidate_gap: undefined,
    secondary_gaps: [],
    probabilities: { C1: 0.2, C2: 0.2, C3: 0.2, C4: 0.2, C5: 0.2 },
    verification_status: 'UNVERIFIED',
    evidence_for: ['Complete a diagnostic check to see response-specific evidence here.'],
    evidence_against: [],
    is_ambiguous: true,
    entropy: 2.32
  });
  const [activeFollowup, setActiveFollowup] = useState<TargetedFollowup | undefined>();

  const handleDiagnosisComplete = (
    sessionId: string,
    diagnosis: DiagnosticResult,
    followup?: TargetedFollowup
  ) => {
    setActiveSessionId(sessionId);
    setActiveDiagnosis(diagnosis);
    setActiveFollowup(followup);
  };

  const handleVerificationComplete = (updatedDiagnosis: DiagnosticResult) => {
    setActiveDiagnosis(updatedDiagnosis);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      <Header
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        userRole={userRole}
        onRoleChange={setUserRole}
      />

      <main className="flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <ErrorBoundary onReset={() => setCurrentPage('diagnostic-session')}>
          {currentPage === 'landing' && (
            <LandingPage
              onNavigate={setCurrentPage}
              onSelectRole={(role: UserRole) => setUserRole(role)}
            />
          )}

          {currentPage === 'student-dashboard' && (
            <StudentDashboard
              onNavigate={setCurrentPage}
              onSelectConcept={(cid) => setSelectedConceptId(cid)}
            />
          )}

          {currentPage === 'diagnostic-session' && (
            <DiagnosticSession
              initialConceptId={selectedConceptId}
              onNavigate={setCurrentPage}
              onDiagnosisComplete={handleDiagnosisComplete}
            />
          )}

          {currentPage === 'diagnostic-report' && (
            <DiagnosticReport
              sessionId={activeSessionId}
              diagnosis={activeDiagnosis}
              followup={activeFollowup}
              onNavigate={setCurrentPage}
              onVerificationComplete={handleVerificationComplete}
            />
          )}

          {currentPage === 'intervention' && (
            <GuidedIntervention
              sessionId={activeSessionId}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'reassessment' && (
            <ReassessmentPage
              sessionId={activeSessionId}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'teacher-dashboard' && (
            <TeacherDashboard onNavigate={setCurrentPage} />
          )}

          {currentPage === 'class-check' && (
            <ClassCheckTeacher
              onNavigate={setCurrentPage}
              onOpenStudentQuiz={(checkId) => {
                setActiveClassCheckId(checkId);
                setCurrentPage('student-quiz-check');
              }}
            />
          )}

          {currentPage === 'student-quiz-check' && (
            <StudentClassCheckQuiz
              onNavigate={setCurrentPage}
              activeCheckId={activeClassCheckId}
            />
          )}

          {currentPage === 'model-evaluation' && (
            <ModelEvaluationPage onNavigate={setCurrentPage} />
          )}

          {currentPage === 'taxonomy-registry' && (
            <TaxonomyRegistry onNavigate={setCurrentPage} />
          )}

          {currentPage === 'privacy-policy' && (
            <PrivacyPolicy onNavigate={setCurrentPage} />
          )}
        </ErrorBoundary>
      </main>

      <footer className="border-t border-neutral-200 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-neutral-600 sm:flex-row sm:px-6 lg:px-8">
          <div>
            © 2026 mindOS. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span>Teacher-reviewed signals</span>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <span>Learning evidence and follow-up checks</span>
            <span aria-hidden="true" className="text-neutral-300">·</span>
            <button
              onClick={() => setCurrentPage('privacy-policy')}
              className="font-medium text-neutral-600 hover:text-blue-700 hover:underline transition cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
