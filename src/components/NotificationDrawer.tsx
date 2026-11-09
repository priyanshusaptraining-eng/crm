import React from 'react';
import { SuperAdminNotification } from '../types/crm';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, CheckCheck, Video, DollarSign, Settings } from 'lucide-react';

interface NotificationDrawerProps {
  notifications: SuperAdminNotification[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onSelectLead?: (leadId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllAsRead,
  onSelectLead,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 transform translate-x-0 animate-in slide-in-from-right">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Super Admin Alert Stream
                </h3>
                <span className="text-xs text-slate-500">
                  {unreadCount} unread system notifications
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark read</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                aria-label="Close notifications"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No notifications logged yet.
              </div>
            ) : (
              <AnimatePresence>
                {notifications.map((notif) => {
                  const isDemo = notif.type === 'demo_scheduled';
                  const isConversion = notif.type === 'admission_joined';
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3.5 rounded-lg border text-xs transition-colors ${
                        !notif.read
                          ? 'bg-indigo-50/50 border-indigo-200'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-md bg-white border border-slate-200 shrink-0 mt-0.5">
                          {isDemo && <Video className="w-4 h-4 text-purple-600" />}
                          {isConversion && <DollarSign className="w-4 h-4 text-emerald-600" />}
                          {!isDemo && !isConversion && <Settings className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900">{notif.title}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1 leading-relaxed">
                            {notif.message}
                          </p>

                          {notif.leadId && onSelectLead && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectLead(notif.leadId!);
                                onClose();
                              }}
                              className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
                            >
                              <span>View prospect details</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 text-center">
            Automated alerts dispatched directly to Super Admin per CRM specification.
          </div>
        </div>
      </div>
    </div>
  );
};
