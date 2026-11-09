import React from 'react';
import { User, SuperAdminNotification } from '../types/crm';
import { ShieldCheck, UserCheck, Bell, Settings, Lock } from 'lucide-react';

interface HeaderProps {
  activeTab: 'preview' | 'spec' | 'matrix';
  setActiveTab: (tab: 'preview' | 'spec' | 'matrix') => void;
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  notifications: SuperAdminNotification[];
  onOpenNotifications: () => void;
  onOpenAdminIdModal: () => void;
  onOpenPermissionsModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  allUsers,
  onSwitchUser,
  notifications,
  onOpenNotifications,
  onOpenAdminIdModal,
  onOpenPermissionsModal,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const isSuperAdmin = currentUser.role === 'super_admin';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-wider">
              CR
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
                CRM Architecture Suite
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline whitespace-nowrap">
                Specification Generator & Live Interactive Preview
              </span>
            </div>
          </div>

          {/* Zone 2: Primary Nav Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'preview'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Interactive CRM Preview
            </button>
            <button
              onClick={() => setActiveTab('spec')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'spec'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              CRM Specification Document
            </button>
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'matrix'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Execution Checklist
            </button>
          </nav>

          {/* Zone 3: Active User Session & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Super Admin Notifications Bell */}
            {isSuperAdmin && (
              <button
                type="button"
                onClick={onOpenNotifications}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                title="Super Admin Notifications"
                aria-label={`Super Admin Notifications, ${unreadCount} unread`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                  </span>
                )}
              </button>
            )}

            {/* Role / User Switcher */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <label htmlFor="user-role-select" className="sr-only">Select User Role</label>
              <div className="flex items-center gap-1.5 px-2">
                {isSuperAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                ) : (
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                )}
                <span className="text-xs font-semibold text-slate-700 hidden md:inline">
                  {currentUser.role === 'super_admin' ? 'Super Admin' : 'Sales User'}
                </span>
              </div>
              <select
                id="user-role-select"
                value={currentUser.id}
                onChange={(e) => onSwitchUser(e.target.value)}
                className="text-xs font-medium bg-white text-slate-800 border border-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-900"
              >
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role === 'super_admin' ? 'Super Admin' : u.canEdit ? 'Edit Access' : 'View Only'})
                  </option>
                ))}
              </select>
            </div>

            {/* Admin ID / Permission management tools */}
            {isSuperAdmin ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={onOpenAdminIdModal}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  title="Change Admin User ID"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Change Admin ID</span>
                </button>
                <button
                  type="button"
                  onClick={onOpenPermissionsModal}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  title="Configure Sales User Permissions"
                >
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">User Permissions</span>
                </button>
              </div>
            ) : (
              <div className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Permission: <span className="font-semibold text-slate-800">{currentUser.canEdit ? 'View & Edit' : 'View Only'}</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
