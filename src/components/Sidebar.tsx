import React from 'react';
import { NavItemConfig, User } from '../types/crm';
import {
  LayoutDashboard,
  Users,
  Kanban,
  Video,
  CalendarClock,
  GraduationCap,
  CreditCard,
  AlertCircle,
  BarChart3,
  Award,
  Target,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Palette,
  LogOut,
  Globe,
  FileText,
  CalendarDays,
  UserCog,
  History,
  FileSpreadsheet,
} from 'lucide-react';

interface SidebarProps {
  navItems: NavItemConfig[];
  activeNav: string;
  setActiveNav: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenAppearance: () => void;
  currentUser: User;
  onSignOut: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  navItems,
  activeNav,
  setActiveNav,
  isCollapsed,
  onToggleCollapse,
  onOpenAppearance,
  currentUser,
  onSignOut,
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard': return <LayoutDashboard className="w-4 h-4 shrink-0" />;
      case 'Users': return <Users className="w-4 h-4 shrink-0" />;
      case 'Globe': return <Globe className="w-4 h-4 shrink-0 text-emerald-400" />;
      case 'Kanban': return <Kanban className="w-4 h-4 shrink-0" />;
      case 'FileText': return <FileText className="w-4 h-4 shrink-0 text-amber-400" />;
      case 'CalendarDays': return <CalendarDays className="w-4 h-4 shrink-0 text-blue-400" />;
      case 'Video': return <Video className="w-4 h-4 shrink-0" />;
      case 'CalendarClock': return <CalendarClock className="w-4 h-4 shrink-0" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4 shrink-0" />;
      case 'CreditCard': return <CreditCard className="w-4 h-4 shrink-0" />;
      case 'AlertCircle': return <AlertCircle className="w-4 h-4 shrink-0" />;
      case 'BarChart3': return <BarChart3 className="w-4 h-4 shrink-0" />;
      case 'Award': return <Award className="w-4 h-4 shrink-0" />;
      case 'Target': return <Target className="w-4 h-4 shrink-0" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />;
      case 'UserCog': return <UserCog className="w-4 h-4 shrink-0 text-purple-400" />;
      case 'History': return <History className="w-4 h-4 shrink-0 text-sky-400" />;
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-4 h-4 shrink-0 text-amber-400" />;
      case 'Settings': return <Settings className="w-4 h-4 shrink-0" />;
      default: return <LayoutDashboard className="w-4 h-4 shrink-0" />;
    }
  };

  const sections: { title: string; key: 'MENU' | 'ADMISSIONS & FINANCIAL' | 'ANALYTICS' | 'SYSTEM' }[] = [
    { title: 'MENU', key: 'MENU' },
    { title: 'ADMISSIONS & FINANCIAL', key: 'ADMISSIONS & FINANCIAL' },
    { title: 'ANALYTICS', key: 'ANALYTICS' },
    ...(isSuperAdmin ? [{ title: 'SYSTEM (ADMIN)', key: 'SYSTEM' as const }] : []),
  ];

  return (
    <aside
      className={`h-screen bg-[var(--sidebar-bg)] border-r border-[var(--border)] flex flex-col justify-between transition-all duration-200 select-none shrink-0 z-30 ${
        isCollapsed ? 'w-[68px]' : 'w-[224px]'
      }`}
    >
      {/* Top Brand Header */}
      <div className="flex flex-col">
        <div className="h-14 px-3.5 flex items-center justify-between border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center shrink-0 text-xs shadow-md shadow-amber-500/20">
              CA
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden leading-tight">
                <span className="font-extrabold text-xs sm:text-[13px] tracking-tight text-[var(--text-primary)] truncate">
                  CorporateAcademy
                </span>
                <span className="text-[10px] text-amber-400/90 font-semibold truncate tracking-wider uppercase">
                  Admissions & DPR OS
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-7 h-7 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--elevated-bg)] flex items-center justify-center transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div className="p-2 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
          {sections.map((sec) => {
            const items = navItems.filter((i) => {
              if (i.section !== sec.key || !i.visible) return false;
              // Strict Counselor RBAC check
              if (!isSuperAdmin) {
                if (['targets', 'dpr_access', 'permissions', 'audit_logs', 'settings', 'counselors'].includes(i.id)) {
                  return false;
                }
              }
              return true;
            });

            if (items.length === 0) return null;

            return (
              <div key={sec.key} className="space-y-1">
                {!isCollapsed && (
                  <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-bold tracking-wider text-[var(--text-muted)] uppercase">
                    {sec.title}
                  </div>
                )}
                {isCollapsed && <div className="h-2" />}

                <nav className="space-y-0.5">
                  {items.map((item) => {
                    const isActive = activeNav === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveNav(item.id)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[12px] font-medium transition-all group relative ${
                          isActive
                            ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold shadow-2xs border border-[var(--accent)]/20'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--elevated-bg)]'
                        }`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[var(--accent)]" />
                        )}

                        <div className={isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'}>
                          {getIcon(item.iconName)}
                        </div>

                        {!isCollapsed && (
                          <span className="truncate flex-1 text-left">
                            {item.label}
                          </span>
                        )}

                        {!isCollapsed && item.badge && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            item.badge === 'Pending'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : isActive 
                              ? 'bg-[var(--accent)] text-white' 
                              : 'bg-[var(--elevated-bg)] text-[var(--text-muted)] border border-[var(--border)]'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Footer with Appearance & User Profile */}
      <div className="p-2 border-t border-[var(--border)] space-y-1.5 bg-[var(--sidebar-bg)]">
        {/* Appearance Trigger Button */}
        <button
          type="button"
          onClick={onOpenAppearance}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--elevated-bg)] transition-colors"
          title="Change Theme & Appearance"
        >
          <Palette className="w-4 h-4 text-[var(--accent)] shrink-0" />
          {!isCollapsed && <span>Appearance Theme</span>}
        </button>

        {/* User profile compact card */}
        <div className="flex items-center justify-between p-1.5 rounded-xl bg-[var(--elevated-bg)] border border-[var(--border)] overflow-hidden">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className={`w-7 h-7 rounded-lg ${currentUser.avatarColor} text-slate-950 font-bold flex items-center justify-center text-xs shrink-0 shadow-sm`}>
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-amber-400 font-medium capitalize truncate">
                  {currentUser.role === 'super_admin' ? 'Super Admin' : 'Counselor'}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onSignOut}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-rose-400 hover:bg-[var(--input-bg)] transition-colors"
            title="Sign Out"
            aria-label="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
