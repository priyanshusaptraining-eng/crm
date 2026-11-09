import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserCog, 
  Lock, 
  Unlock, 
  Check, 
  X, 
  Sparkles, 
  FileText, 
  CalendarDays, 
  Eye, 
  Download,
  AlertCircle
} from 'lucide-react';
import { User, DPRPermissionConfig } from '../../types/crm';

interface DprAccessControlViewProps {
  currentUser: User;
  allUsers: User[];
  permissions: DPRPermissionConfig[];
  onUpdatePermissions: (newPerms: DPRPermissionConfig[]) => void;
  onNotifyToast: (msg: string) => void;
}

export const DprAccessControlView: React.FC<DprAccessControlViewProps> = ({
  currentUser,
  allUsers,
  permissions,
  onUpdatePermissions,
  onNotifyToast,
}) => {
  const [localPerms, setLocalPerms] = useState<DPRPermissionConfig[]>(permissions);
  const isSuperAdmin = currentUser.role === 'super_admin';

  const handleToggle = (userId: string, field: keyof DPRPermissionConfig) => {
    if (!isSuperAdmin) {
      onNotifyToast('Permission denied: Only Super Admin Priyanshu can modify DPR access permissions.');
      return;
    }

    setLocalPerms((prev) =>
      prev.map((p) => {
        if (p.userId === userId) {
          return {
            ...p,
            [field]: !p[field],
          };
        }
        return p;
      })
    );
  };

  const handleSaveAll = () => {
    onUpdatePermissions(localPerms);
    onNotifyToast('DPR Access Control permissions updated and committed to audit log.');
  };

  return (
    <div className="space-y-6">
      {/* Top Bento Header */}
      <div className="bg-[#111827] border border-[#1E2D4A] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                Security & Role Delegation
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              DPR Access Control & Visibility Delegation
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Configure which team members can inspect daily performance reports, view original OCR screenshots, 
              view historical monthly ledgers, and export compliance data.
            </p>
          </div>

          {isSuperAdmin && (
            <button
              onClick={handleSaveAll}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition shadow-lg shadow-amber-500/20 self-start sm:self-center"
            >
              Save Permission Changes
            </button>
          )}
        </div>
      </div>

      {/* Permissions Matrix Bento Card */}
      <div className="bg-[#111827] border border-[#1E2D4A] rounded-2xl p-6 shadow-xl">
        <div className="mb-4 pb-3 border-b border-[#1E2D4A] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Delegated DPR Permissions Matrix</h2>
          <span className="text-xs text-slate-400 font-medium">
            Active Accounts: Priyanshu (Super Admin) & Deepti (Counselor)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E2D4A] text-slate-400 font-semibold bg-[#151F35]/60">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role / Scope</th>
                <th className="py-3 px-3 text-center">View Daily DPR</th>
                <th className="py-3 px-3 text-center">View Monthly Report</th>
                <th className="py-3 px-3 text-center">View Screenshots</th>
                <th className="py-3 px-3 text-center">Inspect OCR Raw Data</th>
                <th className="py-3 px-3 text-center">Export Excel/CSV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2D4A]/60">
              {localPerms.map((perm) => {
                const user = allUsers.find((u) => u.id === perm.userId);
                const isTargetAdmin = perm.userId === 'usr_priyanshu';

                return (
                  <tr key={perm.userId} className="hover:bg-[#151F35]/40 transition">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          isTargetAdmin ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
                        }`}>
                          {user?.name.charAt(0) || 'U'}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{user?.name}</span>
                          <span className="text-[11px] text-slate-400">{user?.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isTargetAdmin
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {isTargetAdmin ? 'All Counselors (Super Admin)' : 'Own DPR Only'}
                      </span>
                    </td>

                    {/* View Daily */}
                    <td className="py-4 px-3 text-center">
                      <button
                        type="button"
                        disabled={isTargetAdmin || !isSuperAdmin}
                        onClick={() => handleToggle(perm.userId, 'canViewDaily')}
                        className={`p-1.5 rounded-lg transition ${
                          perm.canViewDaily
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-[#151F35] text-slate-500'
                        }`}
                      >
                        {perm.canViewDaily ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* View Monthly */}
                    <td className="py-4 px-3 text-center">
                      <button
                        type="button"
                        disabled={isTargetAdmin || !isSuperAdmin}
                        onClick={() => handleToggle(perm.userId, 'canViewMonthly')}
                        className={`p-1.5 rounded-lg transition ${
                          perm.canViewMonthly
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-[#151F35] text-slate-500'
                        }`}
                      >
                        {perm.canViewMonthly ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* View Screenshots */}
                    <td className="py-4 px-3 text-center">
                      <button
                        type="button"
                        disabled={isTargetAdmin || !isSuperAdmin}
                        onClick={() => handleToggle(perm.userId, 'canViewScreenshots')}
                        className={`p-1.5 rounded-lg transition ${
                          perm.canViewScreenshots
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-[#151F35] text-slate-500'
                        }`}
                      >
                        {perm.canViewScreenshots ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* View OCR Data */}
                    <td className="py-4 px-3 text-center">
                      <button
                        type="button"
                        disabled={isTargetAdmin || !isSuperAdmin}
                        onClick={() => handleToggle(perm.userId, 'canViewOcrData')}
                        className={`p-1.5 rounded-lg transition ${
                          perm.canViewOcrData
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-[#151F35] text-slate-500'
                        }`}
                      >
                        {perm.canViewOcrData ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </td>

                    {/* Export */}
                    <td className="py-4 px-3 text-center">
                      <button
                        type="button"
                        disabled={isTargetAdmin || !isSuperAdmin}
                        onClick={() => handleToggle(perm.userId, 'canExport')}
                        className={`p-1.5 rounded-lg transition ${
                          perm.canExport
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-[#151F35] text-slate-500'
                        }`}
                      >
                        {perm.canExport ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-5 p-3.5 bg-[#151F35]/50 border border-[#1E2D4A] rounded-xl flex items-center gap-3 text-xs text-slate-400">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Security Policy: Super Admin Priyanshu Sharma has immutable global administrative privileges. Counselor Deepti is restricted to her own assigned leads and DPR entries by default.
          </span>
        </div>
      </div>
    </div>
  );
};
