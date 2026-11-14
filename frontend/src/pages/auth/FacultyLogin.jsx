import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const FacultyLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { loginFaculty } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/faculty/overview';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await loginFaculty(email, password);
      if (res.success) {
        success(`Welcome, ${res.user.name}`);
        navigate(from, { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid faculty credentials.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (facEmail) => {
    setEmail(facEmail);
    setPassword('Faculty@123');
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-dark-900 text-slate-800 dark:text-slate-100 flex flex-col justify-center py-12 px-4 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <Link to="/" className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-800 dark:bg-sky-500 text-white shadow-sm mb-4">
          <ShieldCheck className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Faculty Login
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Enter your faculty email and password
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-white dark:bg-dark-800 py-6 px-6 shadow-sm rounded-2xl border border-cream-200/90 dark:border-dark-700">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Faculty Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="faculty1@campus.edu"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-cream-50/50 dark:bg-dark-900/50 border border-cream-200 dark:border-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-cream-50/50 dark:bg-dark-900/50 border border-cream-200 dark:border-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-100 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 dark:bg-sky-500 dark:hover:bg-sky-600 shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Faculty</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill */}
          <div className="mt-5 pt-4 border-t border-cream-100 dark:border-dark-700">
            <span className="text-[11px] text-slate-400 block mb-2 font-medium">
              Demo Accounts:
            </span>
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => handleFillDemo('faculty1@campus.edu')}
                className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-cream-100 dark:bg-dark-700 text-slate-700 dark:text-slate-300 hover:bg-cream-200/70 transition-colors flex items-center justify-between"
              >
                <span className="font-medium">Prof. Alan Sharma</span>
                <span className="text-slate-400 font-mono text-[10px]">faculty1@campus.edu</span>
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('faculty2@campus.edu')}
                className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-cream-100 dark:bg-dark-700 text-slate-700 dark:text-slate-300 hover:bg-cream-200/70 transition-colors flex items-center justify-between"
              >
                <span className="font-medium">Dr. Sunita Rao</span>
                <span className="text-slate-400 font-mono text-[10px]">faculty2@campus.edu</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-cream-100 dark:border-dark-700 text-center text-xs text-slate-500 dark:text-slate-400">
            <p>
              Student?{' '}
              <Link to="/student/login" className="font-semibold text-sky-600 dark:text-sky-400 hover:underline">
                Student Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyLogin;
