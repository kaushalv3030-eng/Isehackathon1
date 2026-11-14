import React, { useState, useEffect } from 'react';
import { eventsService } from '../../services/api';
import EmptyState from '../../components/common/EmptyState';
import { CalendarDays, Calendar, MapPin, User, Loader2, Tag } from 'lucide-react';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-sky-500" />
          Events &amp; Updates
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Campus announcements, workshops, and schedules
        </p>
      </div>

      {/* Main Events Feed */}
      {loading ? (
        <div className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-sky-500 animate-spin mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading events...</p>
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No Events Scheduled"
          description="There are currently no upcoming events posted."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-cream-100 dark:bg-dark-800 rounded-2xl border border-cream-200 dark:border-dark-700 shadow-sm p-5 hover:border-cream-300 dark:hover:border-dark-600 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-900/50">
                    <Tag className="w-3 h-3 text-sky-500" />
                    {evt.class_name === 'All' ? 'Campus-Wide' : evt.class_name}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {new Date(evt.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                  {evt.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  {evt.description}
                </p>
              </div>

              <div className="pt-3 border-t border-cream-200 dark:border-dark-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <Calendar className="w-4 h-4 text-sky-500" />
                    <span>{evt.date}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    <span>{evt.venue}</span>
                  </span>
                </div>

                {evt.created_by_name && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                    <User className="w-3 h-3" />
                    <span>{evt.created_by_name}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
