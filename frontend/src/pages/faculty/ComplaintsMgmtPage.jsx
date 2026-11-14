import React, { useState, useEffect } from 'react';
import { complaintsService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../context/NotificationContext';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import {
  AlertCircle,
  Filter,
  Eye,
  CheckCircle2,
  Loader2,
  RefreshCw
} from 'lucide-react';

const ComplaintsMgmtPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal Review State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('Pending');
  const [remarkText, setRemarkText] = useState('');
  const [updating, setUpdating] = useState(false);

  const { success, error: toastError } = useToast();
  const { refreshNotifications } = useNotifications();

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintsService.getAllComplaints({
        status: statusFilter,
        category: categoryFilter
      });
      if (res.data.success) {
        setComplaints(res.data.complaints || []);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter]);

  const handleOpenReviewModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setRemarkText(complaint.remark || '');
  };

  const handleUpdateComplaint = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setUpdating(true);
    try {
      const res = await complaintsService.updateComplaintStatus(selectedComplaint.id, {
        status: newStatus,
        remark: remarkText
      });

      if (res.data.success) {
        success(`Complaint #${selectedComplaint.id} updated to "${newStatus}"`);
        setSelectedComplaint(null);
        refreshNotifications();
        await fetchComplaints();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update complaint';
      toastError(msg);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-sky-500" />
            Complaints Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review submitted issues and update resolution status
          </p>
        </div>

        <button
          onClick={fetchComplaints}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cream-200 dark:border-dark-600 hover:bg-cream-200 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-300 text-xs font-semibold self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Filters:
            </span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1.5 border border-cream-300 dark:border-dark-700 rounded-xl text-xs font-semibold bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 dark:text-slate-400">Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-1.5 border border-cream-300 dark:border-dark-700 rounded-xl text-xs font-semibold bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="All">All Categories</option>
              <option value="Infrastructure">Infrastructure</option>
              <option value="Electrical">Electrical</option>
              <option value="Cleanliness">Cleanliness</option>
              <option value="Internet">Internet</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {complaints.length} tickets
        </span>
      </div>

      {/* Complaints Table */}
      {loading ? (
        <div className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading complaints...</p>
        </div>
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No Complaints Found"
          description="There are currently no complaints matching the selected filters."
        />
      ) : (
        <div className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
              <thead className="bg-cream-200/60 dark:bg-dark-900 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-cream-200 dark:border-dark-700">
                <tr>
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Issue Title</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200 dark:divide-dark-700 font-medium">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-cream-200/40 dark:hover:bg-dark-700/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-slate-400 text-xs">
                      #{c.id}
                    </td>
                    <td className="px-5 py-3.5 max-w-sm">
                      <div className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug">
                        {c.title}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {c.description}
                      </p>
                      {c.remark && (
                        <div className="mt-1 text-[11px] text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-md inline-block border border-sky-100 dark:border-sky-900/40">
                          Remark: {c.remark}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <span className="px-2.5 py-0.5 rounded-full bg-cream-200 dark:bg-dark-700 text-slate-700 dark:text-slate-300 font-medium">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{c.student_name}</div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        {c.student_roll || 'N/A'} ({c.student_class})
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge status={c.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleOpenReviewModal(c)}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-dark-900 border border-cream-200 dark:border-dark-600 hover:bg-cream-200 dark:hover:bg-dark-700 text-sky-600 dark:text-sky-400 text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review & Update Modal */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title={`Review Complaint #${selectedComplaint?.id}`}
        maxWidth="max-w-xl"
      >
        {selectedComplaint && (
          <form onSubmit={handleUpdateComplaint} className="space-y-4">
            {/* Ticket Info Card */}
            <div className="p-3.5 bg-cream-50 dark:bg-dark-900 rounded-xl border border-cream-200 dark:border-dark-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cream-200 dark:bg-dark-700 text-slate-700 dark:text-slate-300 font-semibold uppercase">
                  {selectedComplaint.category}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(selectedComplaint.created_at).toLocaleDateString()}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {selectedComplaint.title}
                </h3>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed bg-white dark:bg-dark-800 p-2.5 rounded-lg border border-cream-200 dark:border-dark-700">
                  {selectedComplaint.description}
                </p>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between pt-1">
                <span>
                  Reported by: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedComplaint.student_name}</span> ({selectedComplaint.student_roll} &bull; {selectedComplaint.student_class})
                </span>
              </div>

              {/* Photo Evidence if uploaded */}
              {selectedComplaint.image_path && (
                <div className="pt-1">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                    Attached Photo:
                  </span>
                  <div className="max-h-40 overflow-hidden rounded-lg border border-cream-200 dark:border-dark-700 bg-white dark:bg-dark-800 flex items-center justify-center p-1">
                    <img
                      src={selectedComplaint.image_path}
                      alt="Complaint attachment"
                      className="max-h-40 object-contain rounded"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Resolution Form Fields */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Pending', 'In Progress', 'Resolved'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setNewStatus(st)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        newStatus === st
                          ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                          : 'bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-300 border-cream-200 dark:border-dark-700 hover:bg-cream-200 dark:hover:bg-dark-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Faculty Remark
                </label>
                <textarea
                  rows={3}
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  placeholder="Note on action taken or technician update"
                  className="w-full p-2.5 border border-cream-300 dark:border-dark-700 rounded-xl text-xs bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-cream-200 dark:border-dark-700">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-cream-200 dark:hover:bg-dark-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium shadow-sm transition-all disabled:opacity-60 flex items-center gap-1.5"
              >
                {updating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Status</span>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ComplaintsMgmtPage;
