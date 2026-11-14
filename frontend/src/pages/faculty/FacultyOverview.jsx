import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { statsService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import {
  AlertCircle,
  Search,
  UserCheck,
  CalendarDays,
  ArrowRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const FacultyOverview = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      const res = await statsService.getFacultyOverview();
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching faculty overview stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-3" />
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading overview...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const todayAtt = stats.todayAttendance || {};

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-sky-500 dark:bg-dark-800 rounded-2xl p-6 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-sky-100 dark:text-sky-400 block mb-1">
            Faculty Dashboard
          </span>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-sky-100 dark:text-slate-300 mt-1">
            Overview of student complaints, attendance, claims, and campus updates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/faculty/attendance"
            className="px-4 py-2 rounded-xl bg-white text-sky-600 hover:bg-cream-100 dark:bg-dark-700 dark:text-sky-300 dark:hover:bg-dark-600 font-medium text-xs transition-colors shadow-sm"
          >
            Mark Attendance
          </Link>
          <Link
            to="/faculty/complaints"
            className="px-4 py-2 rounded-xl bg-sky-600 text-white hover:bg-sky-700 dark:bg-dark-900 dark:hover:bg-dark-700 border border-sky-400 dark:border-dark-600 font-medium text-xs transition-colors shadow-sm"
          >
            View Complaints
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Complaints"
          value={stats.pendingComplaints || 0}
          subtitle={`${stats.inProgressComplaints || 0} in progress`}
          icon={AlertCircle}
          color="amber"
        />
        <StatCard
          title="Pending Claims"
          value={stats.pendingClaims || 0}
          subtitle="Lost item claims awaiting review"
          icon={Search}
          color="rose"
        />
        <StatCard
          title="Today's Attendance"
          value={
            todayAtt.totalRecorded > 0
              ? `${todayAtt.presentCount} / ${todayAtt.totalRecorded}`
              : 'Not Marked'
          }
          subtitle={
            todayAtt.totalRecorded > 0
              ? `${todayAtt.markedClasses} section(s) recorded`
              : 'Pending for today'
          }
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Upcoming Events"
          value={stats.upcomingEvents || 0}
          subtitle="Scheduled announcements"
          icon={CalendarDays}
          color="sky"
        />
      </div>

      {/* Two Column Section: Recent Complaints & Pending Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Complaints */}
        <div className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-cream-200 dark:border-dark-700">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Recent Complaints</h3>
              </div>
              <Link
                to="/faculty/complaints"
                className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-cream-200 dark:divide-dark-700">
              {data?.recentComplaints?.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">No complaints filed.</p>
              ) : (
                data?.recentComplaints?.map((c) => (
                  <div key={c.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-400 font-mono">
                            #{c.id}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-cream-200 dark:bg-dark-700 text-slate-700 dark:text-slate-300 font-medium">
                            {c.category}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 mt-1">{c.title}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {c.student_name} ({c.student_class})
                        </p>
                      </div>
                      <Badge status={c.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pending Claims Requiring Verification */}
        <div className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-cream-200 dark:border-dark-700">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-sky-500" />
                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Incoming Claims</h3>
              </div>
              <Link
                to="/faculty/lost-found"
                className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-cream-200 dark:divide-dark-700">
              {data?.recentClaims?.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1.5" />
                  <span>No pending claims.</span>
                </div>
              ) : (
                data?.recentClaims?.map((claim) => (
                  <div key={claim.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 block">
                          {claim.item_name}
                        </span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                          Claimed by {claim.student_name} ({claim.student_roll})
                        </p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                          {new Date(claim.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge status={claim.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyOverview;
