import React, { useState } from 'react';
import { Lead, User } from '../../types/crm';
import { CalendarClock, AlertTriangle, MessageCircle, CheckCircle2, Phone, Search, Copy, Check } from 'lucide-react';

interface PendingDueDatesViewProps {
  leads: Lead[];
  currentUser: User;
  onOpenPaymentModal: (lead: Lead) => void;
  onNotifyToast: (msg: string) => void;
}

export const PendingDueDatesView: React.FC<PendingDueDatesViewProps> = ({
  leads,
  currentUser,
  onOpenPaymentModal,
  onNotifyToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const isSuperAdmin = currentUser.role === 'super_admin';

  // Filter leads with pending remainingAmount > 0
  const pendingLeads = leads.filter((l) => {
    if (!isSuperAdmin && l.assignedTo !== currentUser.id) return false;
    return (
      (l.status === 'admission_joined' || (l.paymentDetails && l.paymentDetails.amountPaid > 0)) &&
      l.paymentDetails &&
      l.paymentDetails.remainingAmount > 0
    );
  });

  const filtered = pendingLeads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm) ||
      (l.paymentDetails?.receiptNumber && l.paymentDetails.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPendingAmount = pendingLeads.reduce((acc, l) => acc + (l.paymentDetails?.remainingAmount || 0), 0);
  const totalTokensReceived = pendingLeads.reduce((acc, l) => acc + (l.paymentDetails?.amountPaid || 0), 0);

  const handleCopyReminder = (lead: Lead) => {
    const payment = lead.paymentDetails;
    if (!payment) return;

    const message = `Hi ${lead.name}, this is a gentle reminder from DealDeck Admissions regarding your course enrollment. Your remaining tuition installment of ₹${payment.remainingAmount.toLocaleString('en-IN')} is scheduled for settlement on ${payment.nextDueDate || payment.remainingDueDate || 'the agreed date'}. Please let us know if you need any assistance with the payment link!`;
    
    // Copy using textarea fallback to avoid sandbox permission errors
    const el = document.createElement('textarea');
    el.value = message;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    setCopiedId(lead.id);
    onNotifyToast(`Reminder message copied for ${lead.name}!`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[var(--crm-surface)] border border-[var(--crm-border)] p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--crm-text)] tracking-tight">
              Pending Dues & Installment Commitments
            </h2>
            <p className="text-xs text-[var(--crm-text-secondary)] mt-0.5">
              {isSuperAdmin
                ? 'All scheduled student installment commitments and due date follow-ups company-wide'
                : `Installment follow-up commitments assigned to ${currentUser.name}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>{pendingLeads.length} Students with Outstanding Balance</span>
          </span>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] p-4 rounded-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">
            Total Outstanding Balance
          </div>
          <div className="text-2xl font-bold text-amber-400 tracking-tight mt-1 tabular-nums">
            ₹{totalPendingAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[var(--crm-text-secondary)] mt-1">
            Pending receivable from {pendingLeads.length} enrolled students
          </div>
        </div>

        <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] p-4 rounded-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">
            Initial Token Received
          </div>
          <div className="text-2xl font-bold text-emerald-400 tracking-tight mt-1 tabular-nums">
            ₹{totalTokensReceived.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-[var(--crm-text-secondary)] mt-1">
            Advance deposits already credited to account
          </div>
        </div>

        <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] p-4 rounded-2xl">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">
            Settlement Rate
          </div>
          <div className="text-2xl font-bold text-[var(--crm-primary)] tracking-tight mt-1 tabular-nums">
            {totalTokensReceived + totalPendingAmount > 0
              ? `${Math.round((totalTokensReceived / (totalTokensReceived + totalPendingAmount)) * 100)}%`
              : '0%'}
          </div>
          <div className="text-[11px] text-[var(--crm-text-secondary)] mt-1">
            Tuition realization ratio on installment deals
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] p-3 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--crm-text-secondary)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student by name, receipt, or phone..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] placeholder-[var(--crm-text-secondary)] outline-none focus:border-[var(--crm-primary)]"
          />
        </div>
      </div>

      {/* Due Dates Table */}
      <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--crm-input)] border-b border-[var(--crm-border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4 text-right">Total Tuition</th>
                <th className="py-3 px-4 text-right">Paid Token</th>
                <th className="py-3 px-4 text-right">Pending Balance</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Counselor</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--crm-border)] text-[var(--crm-text)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-[var(--crm-text-secondary)]">
                    No pending tuition dues found.
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => {
                  const pay = lead.paymentDetails;
                  const isCopied = copiedId === lead.id;

                  return (
                    <tr key={lead.id} className="hover:bg-[var(--crm-elevated)] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[var(--crm-text)]">{lead.name}</div>
                        <div className="text-[10px] text-[var(--crm-text-secondary)]">
                          {pay?.receiptNumber || 'RCPT-N/A'} • {lead.location}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono text-[var(--crm-text-secondary)]">
                        {lead.phone}
                      </td>

                      <td className="py-3 px-4 text-right font-medium tabular-nums">
                        ₹{(pay?.totalCourseFee || lead.dealValue || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-right font-semibold text-emerald-400 tabular-nums">
                        ₹{(pay?.amountPaid || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-amber-400 tabular-nums">
                        ₹{(pay?.remainingAmount || 0).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                          {pay?.nextDueDate || pay?.remainingDueDate || '2026-11-15'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-[11px]">
                        <span className="px-2 py-0.5 rounded bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)]">
                          {lead.assignedUserName}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleCopyReminder(lead)}
                            className="p-1.5 rounded-lg bg-[var(--crm-input)] hover:bg-[var(--crm-primary)] hover:text-white text-[var(--crm-text-secondary)] transition-colors border border-[var(--crm-border)]"
                            title="Copy payment reminder message"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => onOpenPaymentModal(lead)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-[var(--crm-input)] hover:bg-emerald-600 hover:text-white text-[var(--crm-text)] transition-colors border border-[var(--crm-border)]"
                          >
                            Collect Balance
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
