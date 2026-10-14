import React from 'react';
import { ArrowRight, BookOpenCheck, BrainCircuit, ChartNoAxesColumnIncreasing, Check, GraduationCap, ShieldCheck, Sparkles, Target, Workflow, Waypoints } from 'lucide-react';
import { PageId, UserRole } from '../components/Header';

interface LandingPageProps {
  onNavigate: (page: PageId) => void;
  onSelectRole: (role: UserRole) => void;
}

const differentiators = [
  {
    competitor: 'Eedi',
    focus: 'Misconception diagnosis and classroom response checks',
    name: 'EvidenceTrace',
    detail: 'Keep the student’s actual answer beside the candidate signal, evidence for and against it, and the verification question. A teacher decides what the evidence means.',
    proof: 'Answer → evidence → teacher decision',
    stage: 'Prototype flow',
    icon: Waypoints,
    tone: 'blue'
  },
  {
    competitor: 'ALEKS',
    focus: 'Adaptive knowledge assessment and individual learning paths',
    name: 'Reteach Radar',
    detail: 'Turn a short check from today’s lesson into a class-level view of who may need which reteach prompt, while keeping the teacher in charge of the next lesson.',
    proof: 'Today’s lesson → next teaching move',
    stage: 'Prototype flow',
    icon: Target,
    tone: 'pink'
  },
  {
    competitor: 'Squirrel AI',
    focus: 'Fine-grained adaptive learning and personalized pathways',
    name: 'OpenQuestion Bridge',
    detail: 'Position MIND-OS around teacher-selected classroom questions: connect a response to a learning concept, inspect the reasoning, then choose a useful follow-up.',
    proof: 'Teacher’s question → learning evidence',
    stage: 'Proposed next feature',
    icon: Workflow,
    tone: 'blue'
  },
  {
    competitor: 'CENTURY',
    focus: 'An integrated learning platform with assessment, pathways and resources',
    name: 'Transfer Proof Ledger',
    detail: 'Track the learning cycle in one evidence trail: initial check, reteach, and a new independent transfer question to see whether learning carries over.',
    proof: 'Before → reteach → transfer check',
    stage: 'Prototype flow',
    icon: ChartNoAxesColumnIncreasing,
    tone: 'pink'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onSelectRole }) => {
  const teacherEntry = () => { onSelectRole('teacher'); onNavigate('class-check'); };
  const studentEntry = () => { onSelectRole('student'); onNavigate('student-quiz-check'); };

  return (
    <div className="-mx-4 -mt-5 pb-0 sm:-mx-6 sm:-mt-7 lg:-mx-8">
      <section className="relative overflow-hidden border-b border-slate-100 bg-white">
        <div className="mx-auto grid min-h-[500px] max-w-7xl items-center gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1fr_.92fr] lg:gap-14 lg:px-12 lg:py-14">
          <div className="relative z-10 max-w-xl lg:pl-3">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[.12em] text-blue-700"><Sparkles size={14} /> Learning evidence for the next lesson</div>
            <h1 className="text-[2.6rem] font-extrabold leading-[1.07] tracking-[-.045em] text-slate-900 sm:text-5xl lg:text-[3.7rem]">A wrong answer is a clue.<br /><span className="text-blue-600">Find the thinking behind it.</span></h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">mindOS helps teachers inspect student reasoning, check a possible learning gap, and choose a focused next teaching step.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button onClick={teacherEntry} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-pink-600 px-6 text-sm font-extrabold text-white shadow-lg shadow-pink-600/15 transition hover:bg-pink-700">Explore the teacher workspace <ArrowRight size={17} /></button>
              <button onClick={studentEntry} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50"><BookOpenCheck size={17} className="text-blue-600" /> Join a class check</button>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-slate-500">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} className="text-blue-600" /> Evidence before conclusions</span>
              <span className="inline-flex items-center gap-1.5"><GraduationCap size={15} className="text-blue-600" /> Teacher makes the call</span>
            </div>
          </div>

          <div className="relative mx-auto flex min-h-[350px] w-full max-w-[540px] items-center justify-center lg:min-h-[430px]">
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-50/80 via-white to-pink-50/80 blur-2xl" />
            <div className="relative z-10 w-[min(82%,370px)] rounded-[1.6rem] border border-slate-100 bg-white/95 p-5 shadow-[0_22px_70px_rgba(34,65,110,.14)] sm:p-6">
              <div className="flex items-start justify-between gap-3"><div><div className="text-[11px] font-extrabold uppercase tracking-[.14em] text-blue-600">A closer look at the thinking</div><div className="mt-1 text-lg font-extrabold text-slate-900">Fractions · Class check</div></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">Needs verification</span></div>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4"><div className="text-xs font-semibold text-slate-500">Student’s working</div><div className="mt-1 font-mono text-[1.7rem] font-bold text-slate-900">½ + ⅓ = ⅖</div><p className="mt-2 text-xs leading-5 text-slate-600">Possible signal: numerator and denominator may have been added separately.</p></div>
              <div className="mt-3 flex gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-blue-600 shadow-sm"><BrainCircuit size={19} /></span><div><div className="text-xs font-extrabold text-slate-800">Ask one checking question</div><div className="mt-1 text-[11px] leading-4 text-slate-600">Use a follow-up before deciding what to reteach.</div></div></div>
              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500"><Check size={14} className="text-pink-600" /> Teacher reviews the evidence</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-100 bg-slate-50/90">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 text-center sm:grid-cols-3 sm:px-8 sm:py-12">
          {[
            { icon: Target, title: 'Find the learning signal', text: 'Look beyond right and wrong to inspect the student’s approach.' },
            { icon: BookOpenCheck, title: 'Make checks classroom-ready', text: 'Use short lesson-linked checks to guide the next teaching move.' },
            { icon: GraduationCap, title: 'Keep teachers in control', text: 'Treat model output as a hypothesis that needs human review.' }
          ].map(({ icon: Icon, title, text }) => <article key={title} className="mx-auto max-w-xs"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-slate-100"><Icon size={25} /></span><h2 className="mt-4 text-base font-extrabold text-slate-900">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-3xl text-center"><div className="text-xs font-extrabold uppercase tracking-[.16em] text-pink-600">Our focused difference</div><h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Four ways MIND-OS can stand apart</h2><p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">Three directions build on flows in the current prototype; the teacher-authored question bridge is a proposed next feature. Competitor notes reflect public positioning, not a claim that others cannot offer similar capabilities.</p></div>
        <div className="mt-9 grid gap-4 md:grid-cols-2">
          {differentiators.map(({ competitor, focus, name, detail, proof, stage, icon: Icon, tone }, index) => <article key={competitor} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_5px_24px_rgba(15,35,65,.04)] sm:p-7">
            <div className="flex items-start justify-between gap-3"><span className={`rounded-full px-3 py-1 text-xs font-extrabold ${tone === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>Against {competitor}</span><span className="text-sm font-extrabold tracking-widest text-slate-300">0{index + 1}</span></div>
            <p className="mt-3 text-xs leading-5 text-slate-500">Publicly described focus: {focus}.</p>
            <div className="mt-5 flex gap-3"><span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tone === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}><Icon size={21} /></span><div><h3 className="text-lg font-extrabold text-slate-900">{name}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p></div></div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4"><div className="text-xs font-bold text-slate-700"><span className="mr-2 text-pink-600">MIND-OS USP</span>{proof}</div><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${stage === 'Proposed next feature' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{stage}</span></div>
          </article>)}
        </div>
      </section>

      {/* Footer Banner */}
      <section className="bg-blue-50/60">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 px-5 py-10 sm:flex-row sm:items-center sm:px-8 lg:px-12">
          <div><div className="text-xs font-extrabold uppercase tracking-[.14em] text-blue-700">Built around evidence</div><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-700">MIND-OS reports instructional hypotheses. It does not make psychological assessments or treat one response as proof.</p></div>
          <div className="flex flex-wrap gap-3"><button onClick={() => { onSelectRole('teacher'); onNavigate('taxonomy-registry'); }} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-blue-200 bg-white px-4 text-sm font-bold text-blue-800 transition hover:bg-blue-50">Explore the taxonomy <ArrowRight size={16} /></button><button onClick={teacherEntry} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-pink-600 px-5 text-sm font-extrabold text-white transition hover:bg-pink-700">Open teacher workspace <ArrowRight size={16} /></button></div>
        </div>
      </section>
    </div>
  );
};
