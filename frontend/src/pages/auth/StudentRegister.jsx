import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { GraduationCap, ArrowRight, Loader2 } from 'lucide-react';

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    roll_no: '',
    class_name: 'CSE-3A',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { registerStudent } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await registerStudent(formData);
      if (res.success) {
        success('Account created successfully');
        navigate('/student/overview', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-dark-900 text-slate-800 dark:text-slate-100 flex flex-col justify-center py-12 px-4 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <Link to="/" className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-sky-500 text-white shadow-sm shadow-sky-500/25 mb-4">
          <GraduationCap className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Student Registration
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Create your campus account
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="bg-white dark:bg-dark-800 py-6 px-6 shadow-sm rounded-2xl border border-cream-200/90 dark:border-dark-700">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          <form className="space-y-3.5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Rahul Verma"
                className="w-full px-3 py-2 text-xs bg-cream-50/50 dark:bg-dark-900/50 border border-cream-200 dark:border-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-100 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  name="roll_no"
                  required
                  value={formData.roll_no}
                  onChange={handleChange}
                  placeholder="1CE21CS001"
                  className="w-full px-3 py-2 text-xs bg-cream-50/50 dark:bg-dark-900/50 border border-cream-200 dark:border-dark-700 rounded-xl uppercase focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Class
                </label>
                <select
                  name="class_name"
                  value={formData.class_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs bg-cream-50/50 dark:bg-dark-900/50 border border-cream-200 dark:border-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-100 transition-all"
                >
                  <option value="CSE-3A">CSE-3A</option>
                  <option value="CSE-3B">CSE-3B</option>
                  <option value="ISE-3A">ISE-3A</option>
                  <option value="ECE-3A">ECE-3A</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                College Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="student@campus.edu"
                className="w-full px-3 py-2 text-xs bg-cream-50/50 dark:bg-dark-900/50 border border-cream-200 dark:border-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-100 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-xs bg-cream-50/50 dark:bg-dark-900/50 border border-cream-200 dark:border-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-slate-100 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 shadow-sm shadow-sky-500/20 transition-all disabled:opacity-50 mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-cream-100 dark:border-dark-700 text-center text-xs text-slate-500 dark:text-slate-400">
            <p>
              Already registered?{' '}
              <Link to="/student/login" className="font-semibold text-sky-600 dark:text-sky-400 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;
