import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, FileText, Database, UserCheck, AlertCircle } from 'lucide-react';
import { PageId } from '../components/Header';

interface PrivacyPolicyProps {
  onNavigate: (page: PageId) => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 pt-4">
      {/* Top Breadcrumb & Header */}
      <div className="space-y-4">
        <button
          onClick={() => onNavigate('landing')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 transition cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to MIND-OS
        </button>

        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
            <Shield size={14} /> Data Privacy & Student Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
            MIND-OS Privacy Policy
          </h1>
          <p className="text-sm text-neutral-500">
            Last Updated: October 11, 2026 · Compliant with DPDP Act, FERPA & COPPA Educational Data Standards
          </p>
          <p className="text-base text-neutral-600 leading-relaxed">
            MIND-OS is an evidence-based cognitive learning diagnostics platform built strictly for classroom feedback. 
            We believe that instructional data belongs to students and teachers, and we design every diagnostic model 
            with privacy-by-design safeguards.
          </p>
        </div>
      </div>

      {/* Core Privacy Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-2.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Lock size={20} />
          </div>
          <h2 className="text-base font-bold text-neutral-900">No Advertising or Sale of Data</h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            We never sell, monetize, or broker student response records or teacher diagnostics to third-party ad networks.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-2.5">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Eye size={20} />
          </div>
          <h2 className="text-base font-bold text-neutral-900">Instructional Purpose Only</h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            All gathered data (math answers, step-by-step reasoning) is used strictly to identify learning gaps and suggest teaching moves.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 space-y-2.5">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
            <UserCheck size={20} />
          </div>
          <h2 className="text-base font-bold text-neutral-900">Teacher & School Ownership</h2>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Institutions and teachers retain full ownership over classroom rosters, diagnostic assessments, and exportable records.
          </p>
        </div>
      </div>

      {/* Detailed Policy Sections */}
      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-neutral-200 shadow-sm space-y-8 divide-y divide-neutral-100 text-neutral-700 text-sm leading-relaxed">
        
        {/* Section 1 */}
        <div className="space-y-3 pt-0">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Database size={18} className="text-blue-600" />
            1. Information We Collect
          </h2>
          <p>
            When utilizing MIND-OS, we collect minimal operational information required to conduct learning checks:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
            <li><strong>Classroom Response Data:</strong> Student answers to diagnostic questions, multiple-choice selections, and typed or step-by-step reasoning explanations.</li>
            <li><strong>Session Telemetry:</strong> Confidence self-assessments (e.g., 1–5 scale), hint requests, and verification question outcomes.</li>
            <li><strong>Teacher Inputs:</strong> Teacher review annotations, verified gap confirmations, and assigned class check IDs.</li>
            <li><strong>Technical Diagnostics:</strong> Anonymized browser agent types and application load performance indicators to ensure uptime.</li>
          </ul>
        </div>

        {/* Section 2 */}
        <div className="space-y-3 pt-6">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <FileText size={18} className="text-blue-600" />
            2. How We Use Diagnostic Signals
          </h2>
          <p>
            Our Bayesian diagnostic inference engine evaluates responses against the 50 COGNIVAULT pattern hypotheses. In accordance with educational safety standards:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
            <li>Signals are treated as provisional instructional hypotheses, never as permanent behavioral psychological labels or tracking profiles.</li>
            <li>No automated high-stakes grading or punitive consequences are determined autonomously by AI without teacher oversight.</li>
            <li>Student models are isolated per classroom workspace and not pooled for public LLM training without institutional consent.</li>
          </ul>
        </div>

        {/* Section 3 */}
        <div className="space-y-3 pt-6">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Lock size={18} className="text-blue-600" />
            3. Data Storage & Encryption
          </h2>
          <p>
            All data in transit is encrypted using industry-standard TLS 1.3 cryptographic protocols. Data at rest is encrypted using AES-256 standards. Access to teacher workspaces and student records is gated through role-based access control (RBAC).
          </p>
        </div>

        {/* Section 4 */}
        <div className="space-y-3 pt-6">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <AlertCircle size={18} className="text-blue-600" />
            4. Data Retention & Right to Deletion
          </h2>
          <p>
            Schools and students maintain the full right to export classroom records or request permanent deletion of student session data at any time. Upon contract completion or institutional request, all associated classroom check transcripts are purged within 30 days.
          </p>
        </div>

        {/* Section 5 */}
        <div className="space-y-3 pt-6">
          <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
            <Shield size={18} className="text-blue-600" />
            5. Contact Privacy Office
          </h2>
          <p>
            For questions regarding this privacy policy, institutional data processing agreements, or student privacy compliance, contact our team:
          </p>
          <div className="mt-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs font-mono text-neutral-800">
            MIND-OS Educational Data Protection Office<br />
            Email: privacy@mind-os.internal<br />
            Subject: Student Privacy Compliance Inquiry
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => onNavigate('landing')}
          className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-semibold rounded-full transition shadow-sm cursor-pointer"
        >
          Return to platform
        </button>
      </div>
    </div>
  );
};
