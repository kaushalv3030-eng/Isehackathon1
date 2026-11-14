import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { statsService } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import {
  UserCheck,
  AlertCircle,
  Search,
  Calendar,
  CalendarDays,
  MapPin,
  ArrowRight,
  AlertTriangle,
  Loader2
} from 'lucide-react';

const StudentOverview = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await statsService.getStudentOverview();
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-sky-500 animate-spin mb-2" />
        <p className="text-xs text-slate-400">Loading overview...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const isBelow75 = (stats.attendancePercentage || 0) < 75;

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 border border-cream-200/90 dark:border-dark-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Welcome, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Roll: <span className="font-mono font-medium">{user?.roll_no || 'N/A'}</span> &bull; Class: <span className="font-medium">{user?.class_name || 'General'}</span>
          </p>
        </div>
        <Link
          to="/student/complaints"
          className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs shadow-sm shadow-sky-500/20 transition-colors shrink-0"
        >
          + Lodge Complaint
        </Link>
      </div>

      {/* Low Attendance Alert */}
      {isBelow75 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 flex items-start gap-3.5 text-rose-800 dark:text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold">Attendance Warning ({stats.attendancePercentage}%)</span>
            <p className="text-rose-700 dark:text-rose-300 mt-0.5 leading-relaxed">
              Your attendance is below the 75% requirement. You have attended {stats.presentClasses} of {stats.totalClasses} classes.
            </p>
          </div>
          <Link
            to="/student/attendance"
            className="text-xs font-semibold px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors shrink-0"
          >
            Details
          </Link>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Attendance"
          value={`${stats.attendancePercentage || 0}%`}
          subtitle={`${stats.presentClasses || 0}/${stats.totalClasses || 0} classes`}
          icon={UserCheck}
          color={isBelow75 ? 'rose' : 'emerald'}
        />
        <StatCard
          title="Complaints"
          value={stats.pendingComplaints || 0}
          subtitle="Active tickets"
          icon={AlertCircle}
          color="amber"
        />
        <StatCard
          title="My Claims"
          value={stats.activeClaims || 0}
          subtitle="Submitted claims"
          icon={Search}
          color="sky"
        />
        <StatCard
          title="Timetable"
          value={stats.hasTimetable ? 'Ready' : 'Pending'}
          subtitle={user?.class_name || 'Class schedule'}
          icon={Calendar}
          color="purple"
        />
      </div>

      {/* Events & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Feed (2 Columns) */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-800 rounded-2xl border border-cream-200/90 dark:border-dark-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-cream-100 dark:border-dark-700">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-sky-500" />
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Campus Events</h2>
            </div>
            <Link
              to="/student/events"
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-cream-100 dark:divide-dark-700">
            {data?.latestEvents?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No upcoming events.</p>
            ) : (
              data?.latestEvents?.map((evt) => (
                <div key={evt.id} className="py-3 first:pt-0 last:pb-0">
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {evt.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {evt.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                      <Calendar className="w-3 h-3 text-sky-500" />
                      {evt.date}
                    </span>
                    <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      {evt.venue}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Shortcuts (1 Column) */}
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-cream-200/90 dark:border-dark-700 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-3 pb-2 border-b border-cream-100 dark:border-dark-700">
              Quick Links
            </h2>
            <div className="space-y-2">
              {[
                { to: '/student/timetable', title: 'Class Timetable', desc: 'View and download schedule', icon: Calendar },
                { to: '/student/lost-found', title: 'Lost & Found', desc: 'Search or claim items', icon: Search },
                { to: '/student/complaints', title: 'Complaints', desc: 'Submit campus issue', icon: AlertCircle },
                { to: '/student/attendance', title: 'Attendance', desc: 'Daily log and records', icon: UserCheck }
              ].map((link, i) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={i}
                    to={link.to}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-cream-200 dark:border-dark-700 hover:border-sky-300 dark:hover:border-sky-600 hover:bg-sky-50/40 dark:hover:bg-dark-700/50 transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-dark-700 text-sky-600 dark:text-sky-400">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block group-hover:text-sky-600">
                          {link.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{link.desc}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;
