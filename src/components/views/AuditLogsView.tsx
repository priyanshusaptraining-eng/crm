import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ShieldAlert, 
  Clock, 
  FileText, 
  Target, 
  UserCheck, 
  Lock,
  Download
} from 'lucide-react';
import { User, AuditLogItem } from '../../types/crm';

interface AuditLogsViewProps {
  currentUser: User;
  auditLogs: AuditLogItem[];
  onNotifyToast: (msg: string) => void;
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({
  currentUser,
  auditLogs,
  onNotifyToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter((log) => {
    if (moduleFilter !== 'all' && log.module !== moduleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.actorName.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getModuleBadge = (mod: string) => {
    switch (mod) {
      case 'DPR':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">DPR</span>;
      case 'TARGET':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">TARGET</span>;
      case 'LEADS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">LEADS</span>;
      case 'AUTH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">AUTH</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30">{mod}</span>;
    }
  };

  const handleExportLogs = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Timestamp,Actor,Module,Action,Description\n' +
      filteredLogs.map(l => `"${l.timestamp}","${l.actorName}","${l.module}","${l.action}","${l.description.replace(/"/g, '""')}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CorporateAcademy_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotifyToast('Audit logs exported successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Header Bento Card */}
      <div className="bg-[#111827] border border-[#1E2D4A] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <History className="w-5 h-5" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
                Compliance & Traceability
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              System Audit Logs & Activity Trail
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Immutable ledger of administrative actions, DPR submissions, target modifications, 
              credential switches, and lead reassignments across CorporateAcademy CRM.
            </p>
          </div>

          <button
            onClick={handleExportLogs}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#151F35] hover:bg-[#1E2D4A] border border-[#1E2D4A] transition shadow self-start sm:self-center"
          >
            <Download className="w-4 h-4 text-purple-400" />
            Export Audit Trail
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111827] border border-[#1E2D4A] rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit descriptions, actors, or events..."
            className="w-full pl-10 pr-4 py-2 bg-[#151F35] border border-[#1E2D4A] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition"
          />
        </div>

        <div className="flex items-center gap-2 bg-[#151F35] border border-[#1E2D4A] rounded-xl px-3 py-2">
          <span className="text-xs text-slate-400">Filter Module:</span>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#111827] text-white">All Modules</option>
            <option value="DPR" className="bg-[#111827] text-white">DPR Submissions</option>
            <option value="TARGET" className="bg-[#111827] text-white">Target Changes</option>
            <option value="LEADS" className="bg-[#111827] text-white">Lead Reassignments</option>
            <option value="SYSTEM" className="bg-[#111827] text-white">System Config</option>
            <option value="AUTH" className="bg-[#111827] text-white">Authentication</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#111827] border border-[#1E2D4A] rounded-2xl p-6 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1E2D4A] text-slate-400 font-semibold bg-[#151F35]/60">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-3">Module</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E2D4A]/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#151F35]/40 transition">
                  <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                    {log.actorName}
                  </td>
                  <td className="py-3.5 px-3">
                    {getModuleBadge(log.module)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300 font-semibold">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 text-xs">
                    {log.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
