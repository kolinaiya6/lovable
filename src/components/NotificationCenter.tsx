import React, { useState, useEffect } from 'react';
import { AppNotification, PartyEvent, UserProfile } from '../types';
import { storage } from '../services/storage';
import { 
  Bell, 
  X, 
  Clock, 
  Calendar, 
  MapPin, 
  Check, 
  Sparkles, 
  Trash2, 
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface NotificationCenterProps {
  currentUser: UserProfile | null;
  events: PartyEvent[];
  onSelectEvent?: (event: PartyEvent) => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  currentUser,
  events,
  onSelectEvent,
  onOpenAuth,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);

  useEffect(() => {
    const update = () => {
      const all = storage.getNotifications();
      // Filter for current user or guest
      const userNotifs = currentUser 
        ? all.filter(n => n.userId === currentUser.id)
        : all.filter(n => n.type === 'event_reminder_2h');
      setNotifications(userNotifs);

      // Check for newest unread 2-hour reminder to pop up as a floating toast alert
      const latestUnreadReminder = userNotifs.find(n => !n.isRead && n.type === 'event_reminder_2h');
      if (latestUnreadReminder && (!activeToast || activeToast.id !== latestUnreadReminder.id)) {
        setActiveToast(latestUnreadReminder);
      }
    };

    update();
    const unsubscribe = storage.subscribe(update);
    return () => unsubscribe();
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    storage.markNotificationRead(id);
    if (activeToast?.id === id) {
      setActiveToast(null);
    }
  };

  const handleClear = (id: string) => {
    storage.clearNotification(id);
    if (activeToast?.id === id) {
      setActiveToast(null);
    }
  };

  const handleTriggerTestReminder = () => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    // Find the first event to send a 2h alert for
    const targetEvent = events[0];
    if (targetEvent) {
      storage.triggerImmediate2HourReminder(currentUser.id, targetEvent.id);
    }
  };

  return (
    <>
      {/* Navbar Bell Button */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 transition-colors border border-white/10"
          title="Automated Event Alerts & Reminders"
          aria-label="View notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E63946] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse border border-[#0d0d12]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div 
            className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-full mt-2 w-[calc(100vw-24px)] sm:w-96 rounded-2xl bg-[#14141c]/95 backdrop-blur-xl border border-white/15 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                    Live Event Alerts
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full font-mono">
                        {unreadCount} new
                      </span>
                    )}
                  </h3>
                  <p className="text-[10px] text-slate-400">Automated 2-hour pre-event radar</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={() => storage.markAllNotificationsRead()}
                    className="text-[10px] text-slate-400 hover:text-white px-2 py-1 rounded bg-white/5 transition-colors"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto my-3 space-y-2.5 pr-1">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-30 text-amber-400" />
                  <p className="font-semibold text-white">No active 2-hour alerts right now</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    RSVP to tonight's parties to receive automated alerts 2 hours before kickoff!
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const matchedEvent = events.find(e => e.id === notif.eventId);
                  return (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-xl border transition-all text-xs relative ${
                        notif.isRead 
                          ? 'bg-white/[0.02] border-white/5 opacity-75' 
                          : 'bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 font-bold text-amber-300">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                          <span>{notif.title}</span>
                        </div>
                        <button
                          onClick={() => handleClear(notif.id)}
                          className="text-slate-500 hover:text-red-400 p-0.5"
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-slate-200 mt-1 leading-relaxed text-[11px]">
                        {notif.message}
                      </p>

                      {matchedEvent && (
                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <MapPin className="w-3 h-3 text-[#E63946]" />
                            <span>{matchedEvent.venueName}</span>
                          </div>

                          <button
                            onClick={() => {
                              if (onSelectEvent) onSelectEvent(matchedEvent);
                              handleMarkAsRead(notif.id);
                              setIsOpen(false);
                            }}
                            className="text-[10px] font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
                          >
                            <span>Open Party Pass</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Test Trigger Helper */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 text-[10px]">Test automated alert:</span>
              <button
                onClick={handleTriggerTestReminder}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold transition-all flex items-center gap-1 text-[11px]"
              >
                <Sparkles className="w-3 h-3" />
                <span>Simulate 2-Hour Alert</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating 2-Hour Toast Banner (Appears automatically when an event is starting in < 2 hours) */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-40px)] animate-in slide-in-from-bottom duration-300">
          <div className="rounded-2xl bg-gradient-to-r from-[#1c1810] to-[#121218] border-2 border-amber-500/60 p-4 shadow-2xl shadow-amber-500/20 text-white backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-black flex items-center justify-center shrink-0 font-bold">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 border border-amber-500/40">
                    2-Hour Party Radar
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Just now</span>
                </div>
                <h4 className="font-bold text-sm text-white mt-1">
                  {activeToast.title}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {activeToast.message}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  {activeToast.eventId && (
                    <button
                      onClick={() => {
                        const evt = events.find(e => e.id === activeToast.eventId);
                        if (evt && onSelectEvent) onSelectEvent(evt);
                        handleMarkAsRead(activeToast.id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1 transition-all"
                    >
                      <span>Show VIP Pass</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => handleMarkAsRead(activeToast.id)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold transition-all"
                  >
                    Got it
                  </button>
                </div>
              </div>
              <button
                onClick={() => setActiveToast(null)}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Close alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
