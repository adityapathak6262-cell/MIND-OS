import React, { useState, useEffect } from 'react';
import { ArrowRight, BookOpenCheck, ChevronDown, HelpCircle, Menu, X } from 'lucide-react';
import { UserManualModal } from './UserManualModal';

export type PageId =
  | 'landing' | 'student-dashboard' | 'diagnostic-session' | 'diagnostic-report'
  | 'intervention' | 'reassessment' | 'teacher-dashboard' | 'model-evaluation'
  | 'class-check' | 'student-quiz-check' | 'taxonomy-registry' | 'privacy-policy';

export type UserRole = 'student' | 'teacher';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, userRole, onRoleChange }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);

  // Dynamic scroll listener: shrink & elevate on scroll (always visible)
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const studentLinks: { label: string; page: PageId }[] = [
    { label: 'My learning', page: 'student-dashboard' },
    { label: 'Class check', page: 'student-quiz-check' },
    { label: 'Practice', page: 'diagnostic-session' },
    { label: 'Learning help', page: 'intervention' }
  ];
  const teacherLinks: { label: string; page: PageId }[] = [
    { label: 'Class checks', page: 'class-check' },
    { label: 'Review queue', page: 'teacher-dashboard' },
    { label: 'Taxonomy', page: 'taxonomy-registry' },
    { label: 'Evaluation', page: 'model-evaluation' }
  ];
  const links = userRole === 'student' ? studentLinks : teacherLinks;
  const go = (page: PageId) => { onNavigate(page); setMobileMenuOpen(false); };
  const actionPage: PageId = userRole === 'student' ? 'student-quiz-check' : 'class-check';

  return (
    <>
      {/* Sticky Viewport Top (clean background, no grid) */}
      <div className="sticky top-0 z-50 w-full transition-all duration-300">
        <header
          className={`mx-auto max-w-6xl px-4 transition-all duration-300 ease-out ${
            scrolled ? 'py-2 sm:py-2.5' : 'py-3.5 sm:py-4.5'
          }`}
        >
          {/* Floating Pill-Shaped Navbar */}
          <div
            className={`flex items-center justify-between gap-3 sm:gap-6 rounded-full border transition-all duration-300 ${
              scrolled
                ? 'bg-white/95 backdrop-blur-md border-neutral-300/80 shadow-[0_10px_30px_-5px_rgba(15,23,42,0.12),0_4px_12px_-3px_rgba(15,23,42,0.06)] px-4 sm:px-6 py-2'
                : 'bg-white/98 backdrop-blur-lg border-neutral-200/90 shadow-[0_12px_32px_-6px_rgba(15,23,42,0.08),0_4px_12px_-4px_rgba(15,23,42,0.04)] px-5 sm:px-7 py-2.5 sm:py-3'
            }`}
          >
            {/* Left: Brand Logo & Interactive Role Switcher */}
            <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => go('landing')}
                className="flex items-center gap-2 text-left group transition cursor-pointer hover:opacity-90 py-0.5"
                aria-label="mindOS home"
              >
                <img
                  src="/mindos-logo.png"
                  alt="mind-OS - Find Misconceptions. Transform Learning."
                  className="h-10 sm:h-12 max-h-12 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-2xs"
                />
              </button>

              <span className="hidden h-5 w-px bg-neutral-200 sm:block" />

              {/* Role Toggle Button with Dropdown Selection */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition cursor-pointer ${
                    userRole === 'teacher'
                      ? 'border-purple-300 bg-purple-50 text-purple-800 hover:bg-purple-100'
                      : 'border-blue-300 bg-blue-50 text-blue-800 hover:bg-blue-100'
                  }`}
                  title="Click to change and select role"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  <span>{userRole === 'student' ? 'Student' : 'Teacher'}</span>
                  <ChevronDown size={12} className={`transition-transform ${roleMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Role Selection Dropdown Menu */}
                {roleMenuOpen && (
                  <div className="absolute left-0 mt-1.5 w-44 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-xl z-50 animate-fadeIn">
                    <button
                      onClick={() => {
                        onRoleChange('student');
                        setRoleMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        userRole === 'student' ? 'bg-blue-50 text-blue-800 font-bold' : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <span>Student View</span>
                      {userRole === 'student' && <span className="text-blue-600 text-xs font-bold">✓</span>}
                    </button>
                    <button
                      onClick={() => {
                        onRoleChange('teacher');
                        setRoleMenuOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition ${
                        userRole === 'teacher' ? 'bg-purple-50 text-purple-800 font-bold' : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <span>Teacher View</span>
                      {userRole === 'teacher' && <span className="text-purple-600 text-xs font-bold">✓</span>}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Center: Dynamic Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-1.5" aria-label="Main navigation">
              {links.map(({ label, page }) => {
                const isActive = currentPage === page;
                return (
                  <button
                    key={page}
                    onClick={() => go(page)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-semibold tracking-normal transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-800 font-bold shadow-xs'
                        : 'text-neutral-600 hover:bg-neutral-100/70 hover:text-neutral-900'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
              {userRole === 'student' && currentPage === 'diagnostic-report' && (
                <button
                  onClick={() => go('diagnostic-report')}
                  className="rounded-full px-3 py-1.5 text-xs sm:text-sm font-semibold text-blue-800 bg-blue-50/60"
                >
                  Latest report
                </button>
              )}
            </nav>

            {/* Right: Quick Guide + Primary CTA Button */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
              <button
                onClick={() => setManualOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50/80 px-3 text-xs font-bold text-blue-800 transition hover:bg-blue-100 hover:border-blue-300 shadow-2xs"
                title="Open User Manual & Platform Guide"
                aria-label="Help & User Manual"
              >
                <HelpCircle size={15} className="text-blue-600" />
                <span className="hidden sm:inline">Guide</span>
              </button>

              {/* Primary Theme CTA Button */}
              <button
                onClick={() => go(actionPage)}
                className="inline-flex min-h-[38px] sm:min-h-[40px] items-center gap-1.5 rounded-full bg-pink-600 hover:bg-pink-700 px-4 sm:px-5 text-xs sm:text-sm font-bold text-white shadow-sm shadow-pink-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <span>{userRole === 'student' ? 'Start a check' : 'Create check'}</span>
                <ArrowRight size={14} />
              </button>

              {/* Mobile Hamburger Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="grid h-9 w-9 place-items-center rounded-full border border-neutral-200 text-neutral-700 hover:bg-neutral-100 md:hidden transition"
                aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </header>

        {/* Collapsible Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mx-auto max-w-6xl px-4 pb-4 md:hidden animate-fadeIn">
            <div className="rounded-2xl border border-neutral-200 bg-white/98 backdrop-blur-md p-4 shadow-xl space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <span className="text-xs font-semibold text-neutral-500">Mode: {userRole}</span>
                <button
                  onClick={() => onRoleChange(userRole === 'student' ? 'teacher' : 'student')}
                  className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-bold text-blue-800 bg-blue-50"
                >
                  Switch to {userRole === 'student' ? 'Teacher' : 'Student'}
                </button>
              </div>
              <div className="space-y-1">
                {links.map(({ label, page }) => (
                  <button
                    key={page}
                    onClick={() => go(page)}
                    className={`block w-full text-left rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                      currentPage === page ? 'bg-blue-50 text-blue-800' : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                {userRole === 'student' && (
                  <button
                    onClick={() => go('diagnostic-report')}
                    className="block w-full text-left rounded-xl px-3.5 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                  >
                    Feedback report
                  </button>
                )}
              </div>
              <button
                onClick={() => go(actionPage)}
                className="mt-2 flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full bg-pink-600 px-4 text-sm font-bold text-white shadow-sm"
              >
                <span>{userRole === 'student' ? 'Start a check' : 'Create class check'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      <UserManualModal isOpen={manualOpen} onClose={() => setManualOpen(false)} onNavigate={go} />
    </>
  );
};
