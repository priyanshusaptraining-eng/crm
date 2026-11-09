import React from 'react';
import { User } from '../types/crm';
import { motion } from 'motion/react';
import { Lock, X, Check, Eye, Edit3 } from 'lucide-react';

interface UserPermissionsModalProps {
  users: User[];
  isOpen: boolean;
  onClose: () => void;
  onToggleUserPermission: (userId: string, canEdit: boolean) => void;
}

export const UserPermissionsModal: React.FC<UserPermissionsModalProps> = ({
  users,
  isOpen,
  onClose,
  onToggleUserPermission,
}) => {
  if (!isOpen) return null;

  const salesUsers = users.filter((u) => u.role === 'sales_user');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900">
              Role-Based Access: Sales User Permissions
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

        <div className="p-6 space-y-4">
          <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
            <span className="font-semibold text-slate-900">Super Admin Authority:</span>
            <p className="mt-1">
              Super Admin can view and edit all leads. Other users can only view or edit their own leads, strictly based on the permissions toggled below.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {salesUsers.map((user) => (
              <div key={user.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                  <div className="text-xs text-slate-500 font-mono">
                    ID: {user.id} · {user.email}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onToggleUserPermission(user.id, false)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md border flex items-center gap-1.5 transition-colors ${
                      !user.canEdit
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleUserPermission(user.id, true)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md border flex items-center gap-1.5 transition-colors ${
                      user.canEdit
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>View & Edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
