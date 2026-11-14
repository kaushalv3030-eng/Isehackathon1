import React, { useState, useEffect } from 'react';
import { attendanceService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import {
  UserCheck,
  Check,
  X,
  CheckCircle2,
  Edit3,
  Save,
  Loader2,
  Users
} from 'lucide-react';

const AttendanceMgmtPage = () => {
  const [selectedClass, setSelectedClass] = useState('CSE-3A');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { success, error: toastError, warning } = useToast();

  const loadAttendanceSheet = async () => {
    setLoading(true);
    try {
      const res = await attendanceService.getClassSheet(selectedClass, selectedDate);
      if (res.data.success) {
        setRoster(res.data.roster || []);
        setIsSaved(res.data.isAlreadySaved);
        setIsEditMode(!res.data.isAlreadySaved);
      }
    } catch (err) {
      console.error('Error fetching attendance sheet:', err);
      toastError('Failed to load roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendanceSheet();
  }, [selectedClass, selectedDate]);

  const handleToggleStatus = (studentId, status) => {
    if (!isEditMode) return;
    setRoster((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, status } : student
      )
    );
  };

  const handleMarkAllPresent = () => {
    if (!isEditMode) return;
    setRoster((prev) => prev.map((student) => ({ ...student, status: 'Present' })));
    success(`Marked all ${roster.length} students Present`);
  };

  const handleSaveAttendance = async () => {
    const unmarked = roster.filter((s) => s.status === null);
    if (unmarked.length > 0) {
      warning(`Please mark all students before saving (${unmarked.length} unmarked)`);
      return;
    }

    setSaving(true);
    try {
      const records = roster.map((s) => ({
        student_id: s.id,
        status: s.status
      }));

      const res = await attendanceService.markAttendance({
        class_name: selectedClass,
        date: selectedDate,
        records
      });

      if (res.data.success) {
        success(res.data.message || 'Attendance saved successfully');
        setIsSaved(true);
        setIsEditMode(false);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save attendance';
      toastError(msg);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = roster.filter((s) => s.status === 'Present').length;
  const absentCount = roster.filter((s) => s.status === 'Absent').length;
  const unmarkedCount = roster.filter((s) => s.status === null).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-sky-500" />
          Attendance Management
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Mark and update class attendance sheets
        </p>
      </div>

      {/* Class & Date Controls Bar */}
      <div className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Class Section
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-cream-300 dark:border-dark-700 rounded-xl text-xs font-semibold bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="CSE-3A">CSE-3A</option>
              <option value="CSE-3B">CSE-3B</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-cream-300 dark:border-dark-700 rounded-xl text-xs font-semibold bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {isEditMode ? (
            <>
              <button
                onClick={handleMarkAllPresent}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition-colors"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Mark All Present</span>
              </button>

              <button
                onClick={handleSaveAttendance}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Attendance</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditMode(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-dark-700 dark:hover:bg-dark-600 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Modify Attendance</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Summary Bar */}
      <div className="bg-slate-900 dark:bg-dark-800 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm border border-slate-800 dark:border-dark-700">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-800 dark:bg-dark-700 text-sky-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium block">
              {selectedClass} &bull; {selectedDate}
            </span>
            <span className="text-xs font-bold text-slate-200">
              {isSaved ? (
                isEditMode ? (
                  <span className="text-amber-400">Editing Record</span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Attendance Saved
                  </span>
                )
              ) : (
                <span className="text-sky-400">New Sheet</span>
              )}
            </span>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-5 text-xs font-medium">
          <div className="text-center">
            <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Total</span>
            <span className="text-base font-bold text-white">{roster.length}</span>
          </div>
          <div className="text-center">
            <span className="text-emerald-400 block text-[10px] uppercase tracking-wider">Present</span>
            <span className="text-base font-bold text-emerald-400">{presentCount}</span>
          </div>
          <div className="text-center">
            <span className="text-rose-400 block text-[10px] uppercase tracking-wider">Absent</span>
            <span className="text-base font-bold text-rose-400">{absentCount}</span>
          </div>
          {unmarkedCount > 0 && (
            <div className="text-center bg-amber-950/70 px-2.5 py-1 rounded-xl border border-amber-800">
              <span className="text-amber-400 block text-[10px] uppercase tracking-wider">Unmarked</span>
              <span className="text-base font-bold text-amber-300">{unmarkedCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Student Attendance List Table */}
      {loading ? (
        <div className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading roster...</p>
        </div>
      ) : roster.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Students Enrolled"
          description={`No students registered in ${selectedClass}.`}
        />
      ) : (
        <div className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-cream-200/60 dark:bg-dark-900 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-cream-200 dark:border-dark-700">
                <tr>
                  <th className="px-5 py-3">Roll No</th>
                  <th className="px-5 py-3">Student Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200 dark:divide-dark-700 font-medium">
                {roster.map((student) => {
                  const isPresent = student.status === 'Present';
                  const isAbsent = student.status === 'Absent';
                  const isUnmarked = student.status === null;

                  return (
                    <tr
                      key={student.id}
                      className={`transition-colors ${
                        isAbsent ? 'bg-rose-50/40 dark:bg-rose-950/20' : isPresent ? 'hover:bg-cream-200/40 dark:hover:bg-dark-700/50' : 'bg-amber-50/20 dark:bg-amber-950/20'
                      }`}
                    >
                      <td className="px-5 py-3.5 font-mono font-semibold text-slate-700 dark:text-slate-300 text-xs">
                        {student.roll_no || 'N/A'}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800 dark:text-slate-100">
                        {student.name}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                        {student.email}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        {isUnmarked ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cream-200 dark:bg-dark-700 text-slate-500 dark:text-slate-400 font-medium border border-cream-300 dark:border-dark-600">
                            Unmarked
                          </span>
                        ) : (
                          <Badge status={student.status} />
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {isEditMode ? (
                          <div className="inline-flex items-center gap-1 p-1 bg-cream-200 dark:bg-dark-900 rounded-xl border border-cream-300/60 dark:border-dark-700">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(student.id, 'Present')}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                isPresent
                                  ? 'bg-emerald-600 text-white shadow-sm'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
                              }`}
                            >
                              <Check className="w-3 h-3" />
                              <span>Present</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(student.id, 'Absent')}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                isAbsent
                                  ? 'bg-rose-600 text-white shadow-sm'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
                              }`}
                            >
                              <X className="w-3 h-3" />
                              <span>Absent</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                            Locked
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceMgmtPage;
