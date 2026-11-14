import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Search,
  AlertCircle,
  CalendarDays,
  UserCheck,
  GraduationCap,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { isFaculty } = useAuth();

  const studentLinks = [
    { name: 'Overview', to: '/student/overview', icon: LayoutDashboard },
    { name: 'Timetable', to: '/student/timetable', icon: Calendar },
    { name: 'Lost & Found', to: '/student/lost-found', icon: Search },
    { name: 'Complaints', to: '/student/complaints', icon: AlertCircle },
    { name: 'Events', to: '/student/events', icon: CalendarDays },
    { name: 'Attendance', to: '/student/attendance', icon: UserCheck }
  ];

  const facultyLinks = [
    { name: 'Overview', to: '/faculty/overview', icon: LayoutDashboard },
    { name: 'Timetable', to: '/faculty/timetables', icon: Calendar },
    { name: 'Lost & Found', to: '/faculty/lost-found', icon: Search },
    { name: 'Attendance', to: '/faculty/attendance', icon: UserCheck },
    { name: 'Complaints', to: '/faculty/complaints', icon: AlertCircle },
    { name: 'Events', to: '/faculty/events', icon: CalendarDays }
  ];

  const links = isFaculty ? facultyLinks : studentLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-dark-950/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 bg-cream-50/95 dark:bg-dark-900 border-r border-cream-200/80 dark:border-dark-700 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-cream-200/80 dark:border-dark-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center text-white shadow-sm shadow-sky-500/30">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-slate-100">
                Smart Campus
              </span>
              <p className="text-[10px] font-medium text-slate-400 capitalize">
                {isFaculty ? 'Faculty' : 'Student'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                      : 'text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-cream-200/60 dark:hover:bg-dark-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-600'}`} />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
