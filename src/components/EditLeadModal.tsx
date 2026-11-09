import React, { useState, useEffect } from 'react';
import { Lead, User, CallStatus } from '../types/crm';
import { Edit3, X, Check, Phone, Mail, MapPin } from 'lucide-react';

interface EditLeadModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onSaveLead: (updatedLead: Lead) => void;
}

export const EditLeadModal: React.FC<EditLeadModalProps> = ({
  lead,
  isOpen,
  onClose,
  users,
  onSaveLead,
}) => {
  if (!isOpen || !lead) return null;

  const [name, setName] = useState(lead.name);
  const [location, setLocation] = useState(lead.location || '');
  const [phone, setPhone] = useState(lead.phone);
  const [email, setEmail] = useState(lead.email);
  const [status, setStatus] = useState<CallStatus>(lead.status);
  const [assignedTo, setAssignedTo] = useState(lead.assignedTo);
  const [course, setCourse] = useState(lead.course || '');
  const [dealValue, setDealValue] = useState(lead.dealValue.toString());
  const [feedback, setFeedback] = useState(lead.feedback || '');

  useEffect(() => {
    if (lead) {
      setName(lead.name);
      setLocation(lead.location || '');
      setPhone(lead.phone);
      setEmail(lead.email);
      setStatus(lead.status);
      setAssignedTo(lead.assignedTo);
      setCourse(lead.course || '');
      setDealValue(lead.dealValue.toString());
      setFeedback(lead.feedback || '');
    }
  }, [lead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const assignedUser = users.find((u) => u.id === assignedTo) || {
      id: assignedTo,
      name: lead.assignedUserName,
    };

    const updated: Lead = {
      ...lead,
      name: name.trim(),
      location: location.trim(),
      phone: phone.trim(),
      email: email.trim(),
      status,
      assignedTo,
      assignedUserName: assignedUser.name,
      course: course.trim(),
      dealValue: parseFloat(dealValue) || lead.dealValue,
      feedback: feedback.trim(),
    };

    onSaveLead(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-[var(--crm-surface)] rounded-2xl shadow-2xl border border-[var(--crm-border)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--crm-border)] flex items-center justify-between bg-[var(--crm-elevated)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--crm-primary)]/15 text-[var(--crm-primary)] flex items-center justify-center font-bold">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--crm-text)]">
                Edit Lead Information
              </h3>
              <p className="text-xs text-[var(--crm-text-secondary)]">
                Update candidate name, location, contact, fee value, or counselor assignment
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[var(--crm-input)] hover:bg-[var(--crm-border)] text-[var(--crm-text-secondary)] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--crm-text-secondary)] block mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--crm-text-secondary)] block mb-1">
                Location (City / State)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mumbai, Maharashtra"
                className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--crm-text-secondary)] block mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)] font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--crm-text-secondary)] block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--crm-text-secondary)] block mb-1">
                Course Program
              </label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. SAP FICO Financials"
                className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[var(--crm-text-secondary)] block mb-1">
                Total Deal Value (₹)
              </label>
              <input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)] font-mono"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[var(--crm-text)]">
                  Lead Status *
                </label>
                <span className="text-[11px] text-[var(--crm-text-secondary)]">
                  Select current qualification stage
                </span>
              </div>

              {/* Native Select with enforced dark options */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CallStatus)}
                style={{ colorScheme: 'dark' }}
                className="w-full text-xs px-3 py-2.5 rounded-xl bg-[#0C162B] border border-[var(--crm-border)] text-[#F8FAFC] outline-none focus:border-[var(--crm-primary)] cursor-pointer"
              >
                <option value="new" style={{ backgroundColor: '#141E35', color: '#F8FAFC' }}>New Lead</option>
                <option value="interested" style={{ backgroundColor: '#141E35', color: '#F8FAFC' }}>Interested</option>
                <option value="call_later" style={{ backgroundColor: '#141E35', color: '#F8FAFC' }}>Call Later</option>
                <option value="demo_scheduled" style={{ backgroundColor: '#141E35', color: '#F8FAFC' }}>Demo Scheduled</option>
                <option value="npu" style={{ backgroundColor: '#141E35', color: '#F8FAFC' }}>NPU (Not Picking Up)</option>
                <option value="not_interested" style={{ backgroundColor: '#141E35', color: '#F8FAFC' }}>Not Interested (Lost / Dropped)</option>
                <option value="admission_joined" style={{ backgroundColor: '#141E35', color: '#F8FAFC' }}>Admission Joined (Enrolled)</option>
              </select>

              {/* Quick-Pick Visual Status Badges */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  { id: 'new', label: 'New Lead', color: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
                  { id: 'interested', label: 'Interested', color: 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10' },
                  { id: 'call_later', label: 'Call Later', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
                  { id: 'demo_scheduled', label: 'Demo Scheduled', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
                  { id: 'npu', label: 'NPU', color: 'border-slate-500/30 text-slate-400 bg-slate-500/10' },
                  { id: 'not_interested', label: 'Not Interested', color: 'border-rose-500/30 text-rose-400 bg-rose-500/10' },
                  { id: 'admission_joined', label: 'Admission Joined', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
                ].map((s) => {
                  const isCurrent = status === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStatus(s.id as CallStatus)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all flex items-center gap-1 ${
                        isCurrent
                          ? `${s.color} ring-1 ring-[var(--crm-primary)] shadow-xs`
                          : 'bg-[var(--crm-input)] border-[var(--crm-border)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text)]'
                      }`}
                    >
                      <span>{s.label}</span>
                      {isCurrent && <Check className="w-3 h-3" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--crm-text)] block mb-1">
                Assigned Counselor *
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="w-full text-xs px-3 py-2.5 rounded-xl bg-[#0C162B] border border-[var(--crm-border)] text-[#F8FAFC] outline-none focus:border-[var(--crm-primary)] cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id} style={{ backgroundColor: '#141E35', color: '#F8FAFC' }}>
                    {u.name} ({u.role === 'super_admin' ? 'Admin' : 'Counselor'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--crm-text-secondary)] block mb-1">
              Latest Feedback Remark
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Record candidate discussion summary..."
              className="w-full text-xs p-3 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)]"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--crm-border)]">
            <button
              type="button"
              onClick={onClose}
              className="text-xs px-4 py-2 rounded-xl bg-[var(--crm-input)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-xs px-4 py-2 rounded-xl bg-[var(--crm-primary)] text-white hover:opacity-90 font-medium transition-opacity flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
