import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { GraduationCap, ShieldCheck, ArrowRight, Sun, Moon } from 'lucide-react';

const LandingPage = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-dark-900 text-slate-800 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      {/* Top Bar */}
      <header className="border-b border-cream-200/80 dark:border-dark-700 bg-white/70 dark:bg-dark-900/70 backdrop-blur-md px-6 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-sm shadow-sky-500/30">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
              Smart Campus
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-cream-200/60 dark:hover:bg-dark-800 transition-colors"
            title={isDark ? 'Light mode' : 'Dark mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Main Hero */}
      <div className="max-w-4xl mx-auto px-4 py-16 text-center flex-1 flex flex-col justify-center">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Campus Management Portal
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Access your lecture schedule, track attendance, report campus issues, and claim lost valuables.
        </p>

        {/* Dual Role Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto w-full">
          {/* Student Card */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-cream-200/90 dark:border-dark-700 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Student</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                View timetables, check attendance, lodge maintenance requests, and browse lost items.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-cream-100 dark:border-dark-700 flex items-center justify-between">
              <Link
                to="/student/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                <span>Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                to="/student/register"
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
              >
                Register
              </Link>
            </div>
          </div>

          {/* Faculty Card */}
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-cream-200/90 dark:border-dark-700 shadow-sm hover:shadow-md transition-all text-left flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Faculty</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Manage timetables, mark roll call, resolve complaints, and verify item claims.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-cream-100 dark:border-dark-700 flex items-center justify-between">
              <Link
                to="/faculty/login"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-semibold text-xs shadow-sm transition-colors"
              >
                <span>Login</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[11px] text-slate-400">Pre-seeded accounts</span>
            </div>
          </div>
        </div>

        {/* Demo Credentials Box */}
        <div className="mt-8 bg-white/60 dark:bg-dark-800/60 rounded-xl border border-cream-200 dark:border-dark-700 p-4 max-w-lg mx-auto w-full text-left text-xs">
          <span className="font-semibold text-slate-600 dark:text-slate-300 block mb-2 text-[11px] uppercase tracking-wider">
            Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-3 text-slate-500 dark:text-slate-400">
            <div>
              <span className="font-medium text-slate-700 dark:text-slate-200 block">Faculty</span>
              <p className="font-mono text-[11px]">faculty1@campus.edu</p>
              <p className="font-mono text-[11px]">Faculty@123</p>
            </div>
            <div>
              <span className="font-medium text-slate-700 dark:text-slate-200 block">Student</span>
              <p className="font-mono text-[11px]">student1@campus.edu</p>
              <p className="font-mono text-[11px]">Student@123</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Minimal Footer */}
      <footer className="border-t border-cream-200/80 dark:border-dark-700 py-3 text-center text-xs text-slate-400 dark:text-slate-500">
        Smart Campus Portal
      </footer>
    </div>
  );
};

export default LandingPage;
