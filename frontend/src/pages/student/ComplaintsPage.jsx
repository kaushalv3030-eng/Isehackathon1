import React, { useState, useEffect } from 'react';
import { complaintsService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../context/NotificationContext';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import {
  AlertCircle,
  Upload,
  Send,
  Loader2,
  MessageSquare,
  Clock,
  Eye
} from 'lucide-react';

const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Infrastructure');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Image Preview Modal
  const [previewModalImage, setPreviewModalImage] = useState(null);

  const { success, error: toastError } = useToast();
  const { refreshNotifications } = useNotifications();

  const fetchComplaints = async () => {
    try {
      const res = await complaintsService.getMyComplaints();
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
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('description', description);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await complaintsService.createComplaint(formData);
      if (res.data.success) {
        success('Complaint submitted successfully');
        setTitle('');
        setCategory('Infrastructure');
        setDescription('');
        setImageFile(null);
        setImagePreview('');
        refreshNotifications();
        await fetchComplaints();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit complaint';
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-sky-500" />
          Complaints Portal
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Submit campus issues and track resolution status
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4 pb-3 border-b border-cream-200 dark:border-dark-700">
          New Complaint
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of the issue"
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-dark-700 bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-dark-700 bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
              >
                <option value="Infrastructure">Infrastructure</option>
                <option value="Electrical">Electrical</option>
                <option value="Cleanliness">Cleanliness</option>
                <option value="Internet">Internet</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide specific details and location"
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 dark:border-dark-700 bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Attachment (Optional)
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-cream-300 dark:border-dark-600 hover:border-sky-500 dark:hover:border-sky-400 bg-white dark:bg-dark-900 text-xs font-medium text-slate-600 dark:text-slate-300 transition-all">
                <Upload className="w-3.5 h-3.5 text-sky-500" />
                <span>{imageFile ? 'Change image' : 'Attach photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {imagePreview && (
                <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white dark:bg-dark-900 border border-cream-200 dark:border-dark-700">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-8 h-8 object-cover rounded-lg"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300 max-w-[180px] truncate">
                    {imageFile?.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview('');
                    }}
                    className="text-xs text-rose-500 hover:text-rose-600 px-2"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs shadow-sm transition-all disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Complaint</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
          My Complaints ({complaints.length})
        </h2>

        {loading ? (
          <div className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 text-sky-500 animate-spin mb-2" />
            <p className="text-xs text-slate-500 dark:text-slate-400">Loading complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title="No Complaints Submitted"
            description="You have not submitted any complaints yet."
          />
        ) : (
          <div className="space-y-3">
            {complaints.map((item) => (
              <div
                key={item.id}
                className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 p-5 shadow-sm transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-400 font-mono">
                        #{item.id}
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-cream-200 dark:bg-dark-700 text-slate-700 dark:text-slate-300 font-medium">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        &bull; {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                      {item.description}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Badge status={item.status} />
                  </div>
                </div>

                {/* Remarks & Evidence */}
                <div className="mt-4 pt-3 border-t border-cream-200 dark:border-dark-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  {item.remark ? (
                    <div className="flex items-start gap-2 bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 rounded-xl p-3 text-sky-900 dark:text-sky-200 flex-1">
                      <MessageSquare className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block text-[11px] uppercase tracking-wider text-sky-700 dark:text-sky-300">
                          Faculty Remark
                        </span>
                        <p className="text-xs text-sky-800 dark:text-sky-200 mt-0.5">{item.remark}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Pending faculty review</span>
                    </div>
                  )}

                  {item.image_path && (
                    <button
                      onClick={() => setPreviewModalImage(item.image_path)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cream-200 dark:border-dark-600 bg-white dark:bg-dark-900 hover:bg-cream-200 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors shrink-0"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-500" />
                      <span>View Photo</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      <Modal
        isOpen={!!previewModalImage}
        onClose={() => setPreviewModalImage(null)}
        title="Attached Photo"
      >
        <div className="bg-dark-900 rounded-xl p-2 flex items-center justify-center">
          <img
            src={previewModalImage}
            alt="Complaint attachment"
            className="max-h-[70vh] max-w-full object-contain rounded-lg"
          />
        </div>
      </Modal>
    </div>
  );
};

export default ComplaintsPage;
