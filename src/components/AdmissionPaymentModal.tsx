import React, { useState, useEffect } from 'react';
import { Lead } from '../types/crm';
import { GraduationCap, IndianRupee, Calendar, Check, X, AlertCircle } from 'lucide-react';

interface AdmissionPaymentModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveAdmissionPayment: (
    leadId: string,
    payment: {
      amountPaid: number;
      totalCourseFee: number;
      isRegistrationOnly: boolean;
      remainingAmount: number;
      remainingDueDate: string;
      receiptNumber: string;
    }
  ) => void;
}

export const AdmissionPaymentModal: React.FC<AdmissionPaymentModalProps> = ({
  lead,
  isOpen,
  onClose,
  onSaveAdmissionPayment,
}) => {
  const [amountPaid, setAmountPaid] = useState<number>(5000);
  const [totalCourseFee, setTotalCourseFee] = useState<number>(28000);
  const [isRegistrationOnly, setIsRegistrationOnly] = useState<boolean>(true);
  const [remainingDueDate, setRemainingDueDate] = useState<string>('2026-11-20');
  const [receiptNumber, setReceiptNumber] = useState<string>('');

  useEffect(() => {
    if (isOpen && lead) {
      const fee = lead.dealValue || 28000;
      setTotalCourseFee(fee);
      const paid = lead.paymentDetails?.amountPaid || 5000;
      setAmountPaid(paid);
      setIsRegistrationOnly(lead.paymentDetails?.isRegistrationOnly ?? (paid < fee));
      setRemainingDueDate(lead.paymentDetails?.remainingDueDate || lead.paymentDetails?.nextDueDate || '2026-11-20');
      setReceiptNumber(lead.paymentDetails?.receiptNumber || `RCPT-${lead.id.slice(0, 5).toUpperCase()}`);
    }
  }, [isOpen, lead]);

  if (!isOpen || !lead) return null;

  const remainingAmount = Math.max(0, totalCourseFee - amountPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAdmissionPayment(lead.id, {
      amountPaid: Number(amountPaid),
      totalCourseFee: Number(totalCourseFee),
      isRegistrationOnly,
      remainingAmount: isRegistrationOnly ? remainingAmount : 0,
      remainingDueDate: isRegistrationOnly ? remainingDueDate : '',
      receiptNumber,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-[var(--crm-surface)] rounded-2xl shadow-2xl border border-[var(--crm-border)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--crm-border)] bg-[var(--crm-elevated)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--crm-text)]">
                Admission Joined & Tuition Settlement
              </h3>
              <p className="text-xs text-[var(--crm-text-secondary)]">
                Record payment collected and schedule remaining installment date
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--crm-text-secondary)] hover:text-[var(--crm-text)] hover:bg-[var(--crm-input)]"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Candidate Card */}
          <div className="bg-[var(--crm-input)] rounded-xl p-3 text-xs border border-[var(--crm-border)] flex items-center justify-between">
            <div>
              <span className="font-bold text-[var(--crm-text)] text-sm">{lead.name}</span>
              <span className="text-[var(--crm-text-secondary)] font-mono ml-2">({lead.phone})</span>
            </div>
            <div className="text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full text-[11px] border border-emerald-500/20">
              {lead.course || 'Admissions Joined'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--crm-text-secondary)] mb-1">
                Receipt / Voucher Number
              </label>
              <input
                type="text"
                required
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--crm-text-secondary)] mb-1">
                Total Course Fee (₹)
              </label>
              <input
                type="number"
                required
                value={totalCourseFee}
                onChange={(e) => setTotalCourseFee(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--crm-text-secondary)] mb-1">
              Amount Collected Now (₹) *
            </label>
            <input
              type="number"
              required
              value={amountPaid}
              onChange={(e) => {
                const val = Number(e.target.value);
                setAmountPaid(val);
                if (val >= totalCourseFee) {
                  setIsRegistrationOnly(false);
                }
              }}
              className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)] font-mono text-emerald-400 font-bold"
            />
          </div>

          {/* Payment Type Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-[var(--crm-text-secondary)]">
              Payment Category
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsRegistrationOnly(true)}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  isRegistrationOnly
                    ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                    : 'bg-[var(--crm-input)] border-[var(--crm-border)] text-[var(--crm-text-secondary)]'
                }`}
              >
                <div className="font-bold">Token / Registration</div>
                <div className="text-[10px] mt-0.5 opacity-80">Remaining due on schedule</div>
              </button>

              <button
                type="button"
                onClick={() => setIsRegistrationOnly(false)}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  !isRegistrationOnly
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                    : 'bg-[var(--crm-input)] border-[var(--crm-border)] text-[var(--crm-text-secondary)]'
                }`}
              >
                <div className="font-bold">Full Settlement</div>
                <div className="text-[10px] mt-0.5 opacity-80">100% course tuition cleared</div>
              </button>
            </div>
          </div>

          {/* Remaining balance conditional section */}
          {isRegistrationOnly && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-400 font-medium">Remaining Outstanding Balance:</span>
                <span className="text-amber-400 font-bold font-mono text-sm">
                  ₹{remainingAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-amber-300 mb-1">
                  Scheduled Next Due Date (When will they pay the rest?) *
                </label>
                <input
                  type="date"
                  required={isRegistrationOnly}
                  value={remainingDueDate}
                  onChange={(e) => setRemainingDueDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-[var(--crm-input)] border border-amber-500/30 text-[var(--crm-text)] outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--crm-border)]">
            <button
              type="button"
              onClick={onClose}
              className="text-xs px-3.5 py-2 rounded-xl bg-[var(--crm-input)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Record & Enrol Student</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
