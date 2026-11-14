import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import {
  UserCheck,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  Award
} from 'lucide-react';

const AttendancePage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      const res = await attendanceService.getMySummary();
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching attendance summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  if (loading) {
    return (
      <div className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 p-16 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-3" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading attendance data...</p>
      </div>
    );
  }

  const summary = data?.summary || {
    totalClasses: 0,
    presentCount: 0,
    absentCount: 0,
    percentage: 100,
    isBelowThreshold: false
  };

  const records = data?.records || [];
  const isBelow75 = summary.isBelowThreshold;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-sky-500" />
          My Attendance
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Attendance summary for {user?.name} ({user?.class_name})
        </p>
      </div>

      {/* Warning Highlight if < 75% */}
      {isBelow75 ? (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300">
                  Attendance Shortage
                </span>
                <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Min. Required: 75%</span>
              </div>
              <h2 className="text-lg font-bold text-rose-950 dark:text-rose-200 mt-1">
                Current Attendance: {summary.percentage}%
              </h2>
              <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5 max-w-xl">
                Attendance is below the mandatory 75% threshold required for examination eligibility.
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-dark-900 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-center shrink-0">
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium block">Total Absences</span>
            <span className="text-xl font-bold text-rose-900 dark:text-rose-200">{summary.absentCount}</span>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Eligible
              </span>
              <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-200 mt-0.5">
                {summary.percentage}% Attendance
              </h2>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                Eligible for semester examinations.
              </p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium block">Record</span>
            <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              {summary.presentCount} of {summary.totalClasses} Present
            </span>
          </div>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-cream-100 dark:bg-dark-800 p-5 rounded-2xl border border-cream-200 dark:border-dark-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Classes
            </span>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{summary.totalClasses}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/50">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-cream-100 dark:bg-dark-800 p-5 rounded-2xl border border-cream-200 dark:border-dark-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Present
            </span>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{summary.presentCount}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-cream-100 dark:bg-dark-800 p-5 rounded-2xl border border-cream-200 dark:border-dark-700 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Absent
            </span>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{summary.absentCount}</h3>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Date-wise Attendance Log Table */}
      <div className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-cream-200 dark:border-dark-700 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Attendance Log</h3>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {records.length} Recorded Sessions
          </span>
        </div>

        {records.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Calendar}
              title="No Attendance Records"
              description="No attendance records have been marked yet."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-cream-200/60 dark:bg-dark-900 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-cream-200 dark:border-dark-700">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200 dark:divide-dark-700 font-medium">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-cream-200/40 dark:hover:bg-dark-700/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{r.date}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400 font-mono text-xs">
                      {r.class_name}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={r.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right text-xs">
                      {r.status === 'Present' ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Attended</span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400 font-medium">Absent</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
