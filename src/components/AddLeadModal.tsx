import React, { useState } from 'react';
import { User } from '../types/crm';
import { UserPlus, X, Check } from 'lucide-react';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onAddLead: (leadData: {
    name: string;
    email: string;
    phone: string;
    location?: string;
    course?: string;
    assignedTo: string;
    dealValue: number;
    isAddedToday: boolean;
    isPendingToday: boolean;
  }) => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({
  isOpen,
  onClose,
  users,
  onAddLead,
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [course, setCourse] = useState('SAP FICO Financials');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [assignedTo, setAssignedTo] = useState(users[1]?.id || users[0]?.id || '');
  const [dealValue, setDealValue] = useState(28000);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddLead({
      name: name.trim(),
      location: location.trim() || 'Mumbai, Maharashtra',
      course: course.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: phone.trim(),
      assignedTo,
      dealValue: Number(dealValue),
      isAddedToday: true,
      isPendingToday: true,
    });

    setName('');
    setLocation('');
    setEmail('');
    setPhone('+91 ');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="bg-[var(--crm-surface)] rounded-2xl shadow-2xl border border-[var(--crm-border)] w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--crm-border)] bg-[var(--crm-elevated)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--crm-primary)]/15 text-[var(--crm-primary)] flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[var(--crm-text)]">
              Add New Student Lead
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--crm-text-secondary)] hover:text-[var(--crm-text)] hover:bg-[var(--crm-input)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[var(--crm-text-secondary)] mb-1">
              Candidate Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tanvi Mehta"
              className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--crm-text-secondary)] mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)] font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--crm-text-secondary)] mb-1">
                Location / City
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Pune, MH"
                className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--crm-text-secondary)] mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--crm-text-secondary)] mb-1">
                Course Track
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)]"
              >
                <option value="SAP FICO Financials">SAP FICO Financials</option>
                <option value="SAP MM Materials">SAP MM Materials</option>
                <option value="SAP SD Sales & Dist">SAP SD Sales & Dist</option>
                <option value="SAP ABAP Engineering">SAP ABAP Engineering</option>
                <option value="SAP S/4HANA Masterclass">SAP S/4HANA Masterclass</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--crm-text-secondary)] mb-1">
                Tuition Fee (₹)
              </label>
              <input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--crm-text-secondary)] mb-1">
              Assign to Counselor
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)]"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role === 'super_admin' ? 'Admin' : 'Counselor'})
                </option>
              ))}
            </select>
          </div>

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
              className="text-xs px-4 py-2 rounded-xl bg-[var(--crm-primary)] text-white hover:opacity-90 font-medium flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Lead</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
