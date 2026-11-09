import React, { useState } from 'react';
import { User } from '../types/crm';
import { motion } from 'motion/react';
import { Settings, X, Check, ShieldAlert } from 'lucide-react';

interface AdminIdModalProps {
  adminUser: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdateAdminId: (newId: string) => void;
}

export const AdminIdModal: React.FC<AdminIdModalProps> = ({
  adminUser,
  isOpen,
  onClose,
  onUpdateAdminId,
}) => {
  const [newAdminId, setNewAdminId] = useState<string>(adminUser.id);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = newAdminId.trim();

    if (!cleanId) {
      setError('Admin User ID cannot be blank.');
      return;
    }

    if (cleanId.length < 3) {
      setError('Admin User ID must contain at least 3 characters.');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(cleanId)) {
      setError('Admin User ID may only contain letters, numbers, hyphens, and underscores.');
      return;
    }

    setError(null);
    onUpdateAdminId(cleanId);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900">
              Modify Super Admin User ID
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Context Requirement Compliance:</p>
              <p className="mt-0.5">
                The administrator account user ID is fully customizable. Modifying this identifier updates the active login session and system audit trails.
              </p>
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-1">
              Current Admin User ID:
            </span>
            <div className="text-xs font-mono bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-700">
              {adminUser.id}
            </div>
          </div>

          <div>
            <label htmlFor="new-admin-id-input" className="block text-xs font-semibold text-slate-700 mb-1">
              New Admin User ID <span className="text-rose-500">*</span>
            </label>
            <input
              id="new-admin-id-input"
              type="text"
              required
              value={newAdminId}
              onChange={(e) => {
                setNewAdminId(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. admin_primary_global"
              className="w-full text-xs font-mono border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
            <span className="text-xs text-slate-500 mt-1 block">
              Allowed: letters, numbers, hyphens, and underscores.
            </span>
          </div>

          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
              {error}
            </div>
          )}

          {success && (
            <div className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Admin User ID updated successfully!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              Save New Admin ID
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
