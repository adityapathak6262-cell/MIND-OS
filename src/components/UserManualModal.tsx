import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  BookOpen,
  Users,
  CheckCircle2,
  Workflow,
  Sparkles,
  Layers,
  ShieldCheck,
  Code2
} from 'lucide-react';
import { PageId } from './Header';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageId) => void;
}

export const UserManualModal: React.FC<UserManualModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'teacher' | 'student' | 'developer'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <span className="grid w-10 h-10 rounded-xl bg-blue-600 text-white place-items-center shadow-sm">
              <HelpCircle size={22} />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                MIND-OS User Manual & Quickstart Guide
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Everything you need to know to navigate learning diagnostics, class checks & practice
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-white text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            1. Platform Overview
          </button>
          <button
            onClick={() => setActiveTab('teacher')}
            className={`pb-3 px-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'teacher'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            2. For Teachers (Exit Tickets & Reteaching)
          </button>
          <button
            onClick={() => setActiveTab('student')}
            className={`pb-3 px-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'student'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            3. For Students (Practice & Checks)
          </button>
          <button
            onClick={() => setActiveTab('developer')}
            className={`pb-3 px-3 border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'developer'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            4. Developer & API Usage
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6 text-sm text-slate-700">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-100 text-blue-950 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
                  <Sparkles size={16} className="text-blue-600" />
                  What is MIND-OS?
                </div>
                <p className="text-xs leading-relaxed text-blue-900/90">
                  MIND-OS is an evidence-based learning diagnostic system. Unlike traditional testing apps that only mark answers as <em>Right</em> or <em>Wrong</em>, MIND-OS detects <strong>why</strong> a student made an error by analyzing their answer and intermediate step choices against 50 mapped cognitive gap hypotheses (COGNIVAULT taxonomy).
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-base">Key Concepts to Know</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                      C1: Conceptual Gap
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Fundamental understanding of definitions, physical units, or boundary conditions is fragile.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                      C2: Logical Reasoning
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Lapses in causal deduction, premise tracking, or multi-step logical chains.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                      C3: Procedural Slip
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Formula execution slips, algebraic transposition, or arithmetic calculation errors.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <span className="text-xs font-bold text-pink-800 uppercase tracking-wider">
                      C4: Intuitive Misconception
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Deeply held alternative mental models (e.g. &quot;adding numerators and denominators straight across&quot;).
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Multi-Test Decision Safeguard
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  MIND-OS never permanently labels a student from one mistake. The initial response creates an unverified hypothesis; a targeted verification question and teacher review are required before a pattern is confirmed.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'teacher' && (
            <div className="space-y-5">
              <h3 className="font-bold text-slate-900 text-base">Teacher Workflow Guide</h3>
              <div className="space-y-4">
                <div className="flex gap-3.5 items-start">
                  <span className="w-7 h-7 rounded-lg bg-pink-100 text-pink-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900">Assign a Class Check (Exit Ticket)</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Go to <strong>Class checks</strong> in the top navigation. Share the 6-character Join Code (e.g. <code>FRAC-7A</code>) with your classroom. Students join and submit their responses in 3 minutes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start border-t border-slate-100 pt-3.5">
                  <span className="w-7 h-7 rounded-lg bg-pink-100 text-pink-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900">Inspect Misconception Clusters</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      MIND-OS clusters answers into shared patterns. You immediately see how many students have master common principles versus specific conceptual slips.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start border-t border-slate-100 pt-3.5">
                  <span className="w-7 h-7 rounded-lg bg-pink-100 text-pink-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900">Execute 5-Minute Reteach Counterexample</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Use the suggested classroom discussion prompt and concrete counterexample during your next lesson.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start border-t border-slate-100 pt-3.5">
                  <span className="w-7 h-7 rounded-lg bg-pink-100 text-pink-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    4
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900">Launch Follow-Up Isomorphic Transfer Check</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Click <strong>Launch follow-up transfer check</strong> to test whether students have resolved the underlying misconception on a fresh problem.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onNavigate('class-check');
                    onClose();
                  }}
                  className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Open Teacher Workspace Now →
                </button>
              </div>
            </div>
          )}

          {activeTab === 'student' && (
            <div className="space-y-5">
              <h3 className="font-bold text-slate-900 text-base">Student Practice & Check Guide</h3>
              <div className="space-y-4">
                <div className="flex gap-3.5 items-start">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900">Join a Classroom Check</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Click <strong>Class check</strong> in the header. Select your name or enter your join code to answer today&apos;s exit ticket question.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start border-t border-slate-100 pt-3.5">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900">Individual Diagnostic Practice</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Navigate to <strong>Practice</strong>. Solve diagnostic questions by either clicking multiple-choice options or detailing your steps in the reasoning box.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start border-t border-slate-100 pt-3.5">
                  <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900">Interactive Guided Interventions</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      If an error is detected, visit <strong>Learning help</strong> to explore interactive fraction bars, circuit models, and cognitive conflict counterexamples.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onNavigate('student-quiz-check');
                    onClose();
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Join a Class Check Now →
                </button>
              </div>
            </div>
          )}

          {activeTab === 'developer' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base">API & Developer Quickstart</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Integrate the MIND-OS diagnostic engine into your LMS, app, or quiz runner with a simple REST API request:
              </p>

              <div className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto space-y-2 border border-slate-800">
                <div className="text-slate-400">// POST /class-checks/:id/submit</div>
                <div>{`{`}</div>
                <div className="pl-4">{`"student_id": "STD-101",`}</div>
                <div className="pl-4">{`"student_answer": "2/5",`}</div>
                <div className="pl-4">{`"student_explanation": "Added numerators and denominators straight across.",`}</div>
                <div className="pl-4">{`"confidence": 4`}</div>
                <div>{`}`}</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                <div className="font-bold text-slate-900">Free Developer Sandbox:</div>
                <p>
                  Up to 1,000 evaluations/month free. For high-scale API pricing, see our <strong>Working Model & Monetization Strategy</strong> on the home page.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            MIND-OS Learning Platform v1.0
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
