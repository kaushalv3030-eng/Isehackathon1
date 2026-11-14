import React, { useState, useEffect } from 'react';
import { eventsService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useNotifications } from '../../context/NotificationContext';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import {
  CalendarDays,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  MapPin,
  Tag,
  Loader2
} from 'lucide-react';

const EventsMgmtPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    venue: '',
    class_name: 'All'
  });
  const [saving, setSaving] = useState(false);

  // Delete Modal
  const [deletingEventId, setDeletingEventId] = useState(null);

  const { success, error: toastError } = useToast();
  const { refreshNotifications } = useNotifications();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await eventsService.getEvents();
      if (res.data.success) {
        setEvents(res.data.events || []);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleOpenAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      venue: '',
      class_name: 'All'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (evt) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title,
      description: evt.description,
      date: evt.date,
      venue: evt.venue,
      class_name: evt.class_name || 'All'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingEvent) {
        await eventsService.updateEvent(editingEvent.id, formData);
        success('Event updated successfully');
      } else {
        await eventsService.createEvent(formData);
        success('New event published');
        refreshNotifications();
      }

      setIsModalOpen(false);
      await fetchEvents();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save event';
      toastError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingEventId) return;
    try {
      await eventsService.deleteEvent(deletingEventId);
      success('Event deleted successfully');
      setDeletingEventId(null);
      await fetchEvents();
    } catch (err) {
      toastError('Failed to delete event');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-sky-500" />
            Events Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Publish and manage campus announcements
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Event</span>
        </button>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No Events Published"
          description="Click 'New Event' above to post announcements."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 shadow-sm p-5 flex flex-col justify-between space-y-3 hover:border-cream-300 dark:hover:border-dark-600 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/50">
                    <Tag className="w-3 h-3 text-sky-500" />
                    {evt.class_name === 'All' ? 'Campus-Wide' : evt.class_name}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {new Date(evt.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-snug">
                  {evt.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">
                  {evt.description}
                </p>
              </div>

              <div className="space-y-1.5 pt-2.5 border-t border-cream-200 dark:border-dark-700 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{evt.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">{evt.venue}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleOpenEditModal(evt)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-xl border border-cream-200 dark:border-dark-600 hover:bg-cream-200 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setDeletingEventId(evt.id)}
                  className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Delete Event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? 'Edit Event' : 'New Event'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Annual Tech Symposium"
              className="w-full px-3 py-2 border border-cream-300 dark:border-dark-700 rounded-xl text-xs bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Event details, schedule, or prerequisites..."
              className="w-full px-3 py-2 border border-cream-300 dark:border-dark-700 rounded-xl text-xs bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-cream-300 dark:border-dark-700 rounded-xl text-xs bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Target Section
              </label>
              <select
                value={formData.class_name}
                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                className="w-full px-3 py-2 border border-cream-300 dark:border-dark-700 rounded-xl text-xs bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100"
              >
                <option value="All">All (Campus-Wide)</option>
                <option value="CSE-3A">CSE-3A Only</option>
                <option value="CSE-3B">CSE-3B Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Venue
            </label>
            <input
              type="text"
              required
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="e.g. Auditorium Block A"
              className="w-full px-3 py-2 border border-cream-300 dark:border-dark-700 rounded-xl text-xs bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-cream-200 dark:border-dark-700">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-cream-200 dark:hover:bg-dark-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium shadow-sm disabled:opacity-60 flex items-center gap-1.5"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>{editingEvent ? 'Save Changes' : 'Publish'}</span>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingEventId}
        onClose={() => setDeletingEventId(null)}
        title="Confirm Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Are you sure you want to remove this announcement?
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setDeletingEventId(null)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-cream-200 dark:hover:bg-dark-700"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EventsMgmtPage;
