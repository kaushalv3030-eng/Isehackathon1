import React, { useState, useEffect } from 'react';
import { timetableService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Calendar, Upload, Loader2, RefreshCw } from 'lucide-react';

const TimetableMgmtPage = () => {
  const [selectedClass, setSelectedClass] = useState('CSE-3A');
  const [currentTimetable, setCurrentTimetable] = useState(null);
  const [loading, setLoading] = useState(true);

  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const { success, error: toastError } = useToast();

  const loadTimetableForClass = async (className) => {
    setLoading(true);
    setSelectedFile(null);
    setPreviewUrl('');
    try {
      const res = await timetableService.getClassTimetable(className);
      if (res.data.success) {
        setCurrentTimetable(res.data.timetable);
      }
    } catch (err) {
      console.error('Error fetching timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimetableForClass(selectedClass);
  }, [selectedClass]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toastError('Please choose a timetable image to upload.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('class_name', selectedClass);
      formData.append('image', selectedFile);

      const res = await timetableService.uploadTimetable(formData);
      if (res.data.success) {
        success(`Timetable for ${selectedClass} uploaded successfully`);
        setCurrentTimetable(res.data.timetable);
        setSelectedFile(null);
        setPreviewUrl('');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to upload timetable.';
      toastError(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-sky-500" />
          Timetable Management
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Upload and manage class timetables
        </p>
      </div>

      {/* Class Selector Bar */}
      <div className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            Class:
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-cream-300 dark:border-dark-700 rounded-xl text-sm font-medium bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          >
            <option value="CSE-3A">CSE-3A</option>
            <option value="CSE-3B">CSE-3B</option>
            <option value="ISE-3A">ISE-3A</option>
            <option value="ECE-3A">ECE-3A</option>
          </select>
        </div>

        <button
          onClick={() => loadTimetableForClass(selectedClass)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cream-200 dark:border-dark-600 hover:bg-cream-200 dark:hover:bg-dark-700 text-xs font-medium text-slate-600 dark:text-slate-300 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
      </div>

      {/* Grid: Current Timetable Preview + Upload / Replace Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Current Active Timetable Preview (7 Cols) */}
        <div className="lg:col-span-7 bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-cream-200 dark:border-dark-700">
              <div>
                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                  Current Schedule: {selectedClass}
                </h3>
                {currentTimetable?.updated_at && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    Updated: {new Date(currentTimetable.updated_at).toLocaleString()}
                  </p>
                )}
              </div>
              {currentTimetable && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 font-medium">
                  Active
                </span>
              )}
            </div>

            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">Loading schedule...</p>
              </div>
            ) : currentTimetable?.image_path ? (
              <div className="bg-white dark:bg-dark-900 rounded-xl border border-cream-200 dark:border-dark-700 p-2 flex items-center justify-center overflow-hidden">
                <img
                  src={currentTimetable.image_path}
                  alt={`Timetable for ${selectedClass}`}
                  className="w-full max-h-[420px] object-contain rounded-lg"
                />
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-cream-300 dark:border-dark-700 rounded-xl bg-cream-50/50 dark:bg-dark-900/50 p-6 text-center">
                <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Timetable Uploaded</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1">
                  Upload an image for {selectedClass} using the form on the right.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Upload / Replace Form (5 Cols) */}
        <div className="lg:col-span-5 bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="pb-3 mb-4 border-b border-cream-200 dark:border-dark-700">
              <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                Upload Timetable
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Section: <span className="font-semibold text-sky-500">{selectedClass}</span>
              </p>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                  Select Image File
                </label>
                <label className="cursor-pointer border-2 border-dashed border-cream-300 dark:border-dark-600 hover:border-sky-500 dark:hover:border-sky-400 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all block bg-white dark:bg-dark-900">
                  <Upload className="w-7 h-7 text-sky-500 mb-2" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {selectedFile ? selectedFile.name : 'Click to select image'}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                    Supports JPG, PNG, WEBP, or SVG
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {previewUrl && (
                <div className="p-2.5 bg-white dark:bg-dark-900 rounded-xl border border-cream-200 dark:border-dark-700 space-y-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">Preview:</span>
                  <div className="max-h-40 overflow-hidden rounded-lg border border-cream-200 dark:border-dark-700 flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="New preview"
                      className="max-h-40 w-full object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Publish Timetable</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetableMgmtPage;
