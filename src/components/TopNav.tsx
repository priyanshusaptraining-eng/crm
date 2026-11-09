import React from 'react';
import { User, SuperAdminNotification } from '../types/crm';
import { Bell, ShieldCheck, UserCheck, KeyRound, Palette, LogOut, Search } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface TopNavProps {
  title: string;
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (userId: string) => void;
  notifications: SuperAdminNotification[];
  onOpenNotifications: () => void;
  onOpenAdminIdModal: () => void;
  onOpenPermissionsModal: () => void;
  onOpenAppearance: () => void;
  onSignOut: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onNavigateWorkspace?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  title,
  currentUser,
  allUsers,
  onSwitchUser,
  notifications,
  onOpenNotifications,
  onOpenAdminIdModal,
  onOpenAppearance,
  onSignOut,
  searchQuery,
  onSearchChange,
  onNavigateWorkspace,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const isSuperAdmin = currentUser.role === 'super_admin';

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="h-14 px-4 sm:px-6 border-b border-[var(--border)] bg-[var(--sidebar-bg)] flex items-center justify-between gap-4 shrink-0 select-none">
      {/* Left: Breadcrumbs / Title */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
            <span>CorporateAcademy</span>
            <span>/</span>
            <span className="text-[var(--text-secondary)] font-semibold">{title}</span>
          </div>
          <h1 className="text-base font-bold text-[var(--text-primary)] leading-tight tracking-tight truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Center: Global Quick Search (if provided) */}
      {onSearchChange !== undefined && (
        <div className="hidden md:flex items-center relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            value={searchQuery || ''}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search leads, phone, email..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-[var(--input-bg)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]"
          />
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Google Workspace Shortcut */}
        {onNavigateWorkspace && (
          <button
            type="button"
            onClick={onNavigateWorkspace}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--elevated-bg)] hover:bg-[var(--card-bg)] border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shadow-2xs"
            title="Google Workspace Hub (Meet, Calendar, Gmail, Sheets)"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="hidden sm:inline">Google Workspace</span>
          </button>
        )}

        {/* PWA Install Button */}
        <PWAInstallButton className="hidden sm:inline-flex" />

        {/* Date Display */}
        <span className="hidden xl:inline text-xs font-medium text-[var(--text-muted)] px-2 py-1 rounded bg-[var(--elevated-bg)] border border-[var(--border)] tabular-nums">
          {todayFormatted}
        </span>

        {/* Appearance Trigger */}
        <button
          type="button"
          onClick={onOpenAppearance}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--elevated-bg)] hover:bg-[var(--card-bg)] border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shadow-2xs"
          title="Change Theme & Appearance"
        >
          <Palette className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="hidden sm:inline">Theme</span>
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={onOpenNotifications}
          className="w-8 h-8 rounded-lg bg-[var(--elevated-bg)] hover:bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] relative transition-colors shadow-2xs"
          title="Super Admin Notifications"
          aria-label={`Notifications, ${unreadCount} unread`}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--error)] ring-2 ring-[var(--sidebar-bg)]" />
          )}
        </button>

        {/* User Role Switcher Dropdown */}
        <div className="flex items-center gap-1.5 bg-[var(--elevated-bg)] border border-[var(--border)] px-2.5 py-1.5 rounded-lg shadow-2xs">
          {isSuperAdmin ? (
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
          ) : (
            <UserCheck className="w-3.5 h-3.5 text-[var(--success)]" />
          )}
          <select
            id="user-select-switch"
            value={currentUser.id}
            onChange={(e) => onSwitchUser(e.target.value)}
            className="text-xs font-semibold text-[var(--text-primary)] bg-transparent border-none focus:outline-none cursor-pointer pr-1"
          >
            {allUsers.map((u) => (
              <option key={u.id} value={u.id} className="bg-[var(--card-bg)] text-[var(--text-primary)]">
                {u.name} ({u.role === 'super_admin' ? 'Admin' : 'Counselor'})
              </option>
            ))}
          </select>
        </div>

        {/* Change Admin ID button */}
        {isSuperAdmin && (
          <button
            type="button"
            onClick={onOpenAdminIdModal}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--elevated-bg)] hover:bg-[var(--card-bg)] border border-[var(--border)] rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors shadow-2xs"
            title="Edit Super Admin User ID"
          >
            <KeyRound className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Admin ID</span>
          </button>
        )}

        {/* Sign Out */}
        <button
          type="button"
          onClick={onSignOut}
          className="p-2 rounded-lg bg-[var(--elevated-bg)] hover:bg-[var(--card-bg)] text-[var(--text-muted)] hover:text-[var(--error)] border border-[var(--border)] transition-colors shadow-2xs"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
