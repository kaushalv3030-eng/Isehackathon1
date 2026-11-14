import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { timetableService } from '../../services/api';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { Calendar, Download, Maximize2, Loader2, RefreshCw } from 'lucide-react';

const TimetablePage = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const res = await timetableService.getMyTimetable();
      if (res.data.success) {
        setTimetable(res.data.timetable);
      }
    } catch (err) {
      console.error('Error fetching timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, []);

  const handleDownload = () => {
    if (!timetable?.image_path) return;
    const link = document.createElement('a');
    link.href = timetable.image_path;
    link.download = `Timetable_${user?.class_name || 'Class'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-500" />
            Class Timetable: {user?.class_name}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Weekly lecture and lab schedule
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTimetable}
            className="p-2 rounded-xl border border-cream-200 dark:border-dark-700 bg-white dark:bg-dark-800 hover:bg-cream-100 dark:hover:bg-dark-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {timetable?.image_path && (
            <>
              <button
                onClick={() => setIsZoomOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-cream-200 dark:border-dark-700 bg-white dark:bg-dark-800 hover:bg-cream-100 dark:hover:bg-dark-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors shadow-sm"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Zoom</span>
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-sm shadow-sky-500/20 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-cream-200/90 dark:border-dark-700 p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 text-sky-500 animate-spin mb-2" />
          <p className="text-xs text-slate-400">Loading timetable...</p>
        </div>
      ) : !timetable || !timetable.image_path ? (
        <EmptyState
          icon={Calendar}
          title="No Timetable Uploaded"
          description={`No schedule currently published for section ${user?.class_name || ''}.`}
        />
      ) : (
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-cream-200/90 dark:border-dark-700 shadow-sm overflow-hidden p-4 sm:p-5">
          <div
            className="cursor-pointer group relative overflow-hidden rounded-xl bg-cream-50/50 dark:bg-dark-900 border border-cream-200 dark:border-dark-700 p-2 flex items-center justify-center"
            onClick={() => setIsZoomOpen(true)}
          >
            <img
              src={timetable.image_path}
              alt={`Timetable ${user?.class_name}`}
              className="w-full max-h-[550px] object-contain rounded-lg group-hover:scale-[1.005] transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-dark-950/0 group-hover:bg-dark-950/20 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-dark-900/80 text-white text-xs font-medium rounded-lg backdrop-blur-sm flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Click to Expand</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Zoom Modal */}
      <Modal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        title={`Timetable: ${user?.class_name}`}
        maxWidth="max-w-5xl"
      >
        <div className="space-y-3">
          <div className="bg-dark-950 rounded-xl p-2 flex items-center justify-center overflow-auto max-h-[75vh]">
            <img
              src={timetable?.image_path}
              alt="Timetable Zoom"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
          <div className="flex justify-end pt-1">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Image</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TimetablePage;
