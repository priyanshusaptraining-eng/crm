import React, { useState } from 'react';
import { User, NavItemConfig } from '../types/crm';
import { 
  LayoutDashboard, 
  Users, 
  CalendarClock, 
  FileText, 
  CalendarDays, 
  Menu, 
  X, 
  Kanban, 
  Video, 
  GraduationCap, 
  CreditCard, 
  AlertCircle, 
  Target, 
  ShieldCheck, 
  UserCog, 
  History, 
  Settings, 
  Palette, 
  LogOut,
  Globe,
  Award,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';

interface BottomNavProps {
  activeNav: string;
  setActiveNav: (tabId: string) => void;
  currentUser: User;
  onOpenAppearance: () => void;
  onSignOut: () => void;
  navItems: NavItemConfig[];
  leadsCount?: number;
  pendingFollowupsCount?: number;
  isDprMissing?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeNav,
  setActiveNav,
  currentUser,
  onOpenAppearance,
  onSignOut,
  navItems,
  leadsCount = 11,
  pendingFollowupsCount = 3,
  isDprMissing = true,
}) => {
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);
  const isSuperAdmin = currentUser.role === 'super_admin';

  // Primary 5 mobile tabs
  const primaryTabs = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'leads',
      label: 'Leads',
      icon: Users,
      badge: leadsCount > 0 ? String(leadsCount) : null,
    },
    {
      id: 'followups',
      label: 'Calls',
      icon: CalendarClock,
      badge: pendingFollowupsCount > 0 ? String(pendingFollowupsCount) : null,
    },
    {
      id: 'dpr',
      label: 'DPR',
      icon: FileText,
      badge: isDprMissing ? '!' : null,
      isWarningBadge: isDprMissing,
    },
    {
      id: 'monthly_report',
      label: 'Report',
      icon: CalendarDays,
      badge: null,
    },
  ];

  // Secondary items for "More" drawer
  const moreItems = [
    { id: 'bulk_import', label: 'Bulk Lead Upload (Excel)', icon: FileSpreadsheet, section: 'Sales' },
    { id: 'pipeline', label: 'Lead Pipeline (Kanban)', icon: Kanban, section: 'Sales' },
    { id: 'demos', label: 'Demos & Webinars', icon: Video, section: 'Sales' },
    { id: 'admissions', label: 'Admissions Tracker', icon: GraduationCap, section: 'Finance' },
    { id: 'transactions', label: 'Fee Transactions', icon: CreditCard, section: 'Finance' },
    { id: 'dues', label: 'Pending Dues Ledger', icon: AlertCircle, section: 'Finance' },
    { id: 'workspace', label: 'Google Workspace Hub', icon: Globe, section: 'Integrations' },
    ...(isSuperAdmin
      ? [
          { id: 'counselors', label: 'Counselor Analytics', icon: Award, section: 'Admin' },
          { id: 'targets', label: 'Targets & Goals', icon: Target, section: 'Admin' },
          { id: 'dpr_access', label: 'DPR Access Delegation', icon: ShieldCheck, section: 'Admin' },
          { id: 'permissions', label: 'Team Management', icon: UserCog, section: 'Admin' },
          { id: 'audit_logs', label: 'Audit Trail', icon: History, section: 'Admin' },
          { id: 'settings', label: 'Admin Settings', icon: Settings, section: 'Admin' },
        ]
      : []),
  ];

  const handleSelectTab = (id: string) => {
    setActiveNav(id);
    setIsMoreDrawerOpen(false);
  };

  return (
    <>
      {/* Fixed Mobile Bottom Bar */}
      <nav 
        className="fixed bottom-0 inset-x-0 z-40 bg-[#0B1020]/95 backdrop-blur-md border-t border-[#1E2D4A] md:hidden px-2 py-1.5 pb-safe select-none shadow-2xl"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-around">
          {primaryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeNav === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 active:scale-90 ${
                  isActive
                    ? 'text-amber-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400 stroke-[2.4]' : 'text-slate-400'}`} />
                  {tab.badge && (
                    <span className={`absolute -top-1.5 -right-2.5 text-[9px] font-black px-1.5 py-0.2 rounded-full border ${
                      tab.isWarningBadge
                        ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                        : 'bg-amber-500 text-slate-950 border-amber-400'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-tight leading-none">
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-amber-400 mt-0.5" />
                )}
              </button>
            );
          })}

          {/* More Button */}
          <button
            type="button"
            onClick={() => setIsMoreDrawerOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-150 active:scale-90 ${
              isMoreDrawerOpen ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-1 tracking-tight leading-none">
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Slide-Up "More" Sheet */}
      {isMoreDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden flex flex-col justify-end animate-in fade-in duration-200"
          onClick={() => setIsMoreDrawerOpen(false)}
        >
          <div 
            className="bg-[#111827] border-t border-[#1E2D4A] rounded-t-3xl max-h-[85vh] overflow-y-auto p-5 pb-8 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle & Header */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-1.5 bg-[#1E2D4A] rounded-full mb-3" />
              <div className="w-full flex items-center justify-between pb-3 border-b border-[#1E2D4A]/60">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl ${currentUser.avatarColor} text-slate-950 font-black flex items-center justify-center text-xs shadow-xs`}>
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{currentUser.name}</h4>
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      {isSuperAdmin ? 'Super Admin' : 'Admissions Counselor'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMoreDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-[#151F35]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* List of Other Modules */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 block mb-1">
                CRM Modules
              </span>
              <div className="grid grid-cols-1 gap-1">
                {moreItems.map((item) => {
                  const Icon = item.icon;
                  const isCurrent = activeNav === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-semibold transition active:scale-98 ${
                        isCurrent
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-[#151F35]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isCurrent ? 'bg-amber-500/20 text-amber-400' : 'bg-[#151F35] text-slate-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions: Theme & Sign Out */}
            <div className="pt-3 border-t border-[#1E2D4A] space-y-2">
              <button
                type="button"
                onClick={() => {
                  setIsMoreDrawerOpen(false);
                  onOpenAppearance();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#151F35] hover:bg-[#1E2D4A] text-xs font-semibold text-slate-200 transition"
              >
                <Palette className="w-4 h-4 text-amber-400" />
                <span>Change Theme & Typography</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMoreDrawerOpen(false);
                  onSignOut();
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-semibold text-rose-400 border border-rose-500/20 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of CorporateAcademy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
