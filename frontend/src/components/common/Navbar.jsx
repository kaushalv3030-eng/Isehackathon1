import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, LogOut, Check, Sun, Moon, Menu } from 'lucide-react';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { isDark, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <header className="sticky top-0 z-30 bg-cream-50/90 dark:bg-dark-900/90 backdrop-blur-md border-b border-cream-200/80 dark:border-dark-700 px-4 sm:px-6 py-2.5 transition-colors">
      <div className="flex items-center justify-between">
        {/* Left: Mobile Toggle & Minimal Portal Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-cream-200/60 dark:hover:bg-dark-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Campus Portal</span>
            <span>&bull;</span>
            <span className="capitalize">{user?.role}</span>
          </div>
        </div>

        {/* Right: Theme Toggle, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-cream-200/60 dark:hover:bg-dark-800 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Notification Bell Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-cream-200/60 dark:hover:bg-dark-800 transition-colors focus:outline-none"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-bold text-white bg-sky-500 rounded-full border-2 border-cream-50 dark:border-dark-900 shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-cream-200 dark:border-dark-700 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-cream-100 dark:border-dark-700 bg-cream-50/50 dark:bg-dark-850/50">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 uppercase tracking-wider">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 px-1.5 py-0.5 rounded-full font-semibold">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-medium flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-cream-100 dark:divide-dark-700">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => notif.is_read === 0 && markAsRead(notif.id)}
                        className={`p-3 text-xs transition-colors cursor-pointer ${
                          notif.is_read === 0
                            ? 'bg-sky-50/40 dark:bg-sky-950/20 font-medium text-slate-900 dark:text-slate-100'
                            : 'hover:bg-cream-50/60 dark:hover:bg-dark-700/40 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="leading-snug flex-1">{notif.message}</p>
                          {notif.is_read === 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                          {formatTime(notif.created_at)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-cream-200 dark:border-dark-700">
            <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                {user?.name}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="capitalize">{user?.role}</span>
                {user?.class_name && <span>&bull; {user.class_name}</span>}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-dark-800 rounded-lg transition-colors ml-1"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
