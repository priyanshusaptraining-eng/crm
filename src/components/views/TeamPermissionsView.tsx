import React, { useState } from 'react';
import { User } from '../../types/crm';
import { ShieldCheck, UserPlus, Key, Lock, CheckCircle2, Eye, EyeOff, ShieldAlert, X } from 'lucide-react';

interface TeamPermissionsViewProps {
  users: User[];
  currentUser: User;
  onAddUser: (newUser: User) => void;
  onUpdateUser: (updatedUser: User) => void;
  onNotifyToast: (msg: string) => void;
}

export const TeamPermissionsView: React.FC<TeamPermissionsViewProps> = ({
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onNotifyToast,
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const [showAddModal, setShowAddModal] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('password123');
  const [newRole, setNewRole] = useState<'super_admin' | 'sales_user'>('sales_user');
  const [newCanEdit, setNewCanEdit] = useState(true);

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUsername.trim()) return;

    const id = `usr_${newUsername.trim().toLowerCase().replace(/\s+/g, '_')}`;
    const newUser: User = {
      id,
      username: newUsername.trim().toLowerCase(),
      password: newPassword.trim(),
      name: newName.trim(),
      email: newEmail.trim() || `${newUsername.trim()}@dealdeck.internal`,
      role: newRole,
      canEdit: newCanEdit,
      avatarColor: newRole === 'super_admin' ? 'bg-blue-600' : 'bg-emerald-600',
      designation: newRole === 'super_admin' ? 'Super Admin' : 'Admissions Counselor',
    };

    onAddUser(newUser);
    onNotifyToast(`Account created for ${newUser.name} with User ID "${newUser.username}"!`);
    setShowAddModal(false);
    setNewName('');
    setNewEmail('');
    setNewUsername('');
    setNewPassword('password123');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--crm-surface)] border border-[var(--crm-border)] p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[var(--crm-text)] tracking-tight">
              Team Credentials & Access Control
            </h2>
            <p className="text-xs text-[var(--crm-text-secondary)] mt-0.5">
              {isSuperAdmin
                ? 'Create counselor accounts, manage User IDs, inspect passwords, and assign role permissions'
                : 'Your account credentials and role security permissions'}
            </p>
          </div>
        </div>

        {isSuperAdmin && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[var(--crm-primary)] hover:opacity-90 text-white font-medium text-xs transition-opacity self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Counselor / User</span>
          </button>
        )}
      </div>

      {/* Users Table / Credential Cards */}
      <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-[var(--crm-border)] flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">
            Registered System Accounts ({users.length})
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--crm-input)] border-b border-[var(--crm-border)] text-[11px] font-semibold uppercase tracking-wider text-[var(--crm-text-secondary)]">
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">User ID / Username</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Role Designation</th>
                <th className="py-3 px-4">Edit Permission</th>
                <th className="py-3 px-4">Password Credential</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--crm-border)] text-[var(--crm-text)]">
              {users.map((u) => {
                const isPwVisible = visiblePasswords[u.id] || false;
                const canManageThis = isSuperAdmin || u.id === currentUser.id;

                return (
                  <tr key={u.id} className="hover:bg-[var(--crm-elevated)] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[var(--crm-text)]">
                      {u.name} {u.id === currentUser.id ? '(You)' : ''}
                    </td>

                    <td className="py-3 px-4 font-mono text-[var(--crm-primary)] font-semibold">
                      {u.username || u.id}
                    </td>

                    <td className="py-3 px-4 text-[var(--crm-text-secondary)]">
                      {u.email}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        u.role === 'super_admin'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {u.role === 'super_admin' ? 'Super Admin' : 'Counselor'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {isSuperAdmin && u.role !== 'super_admin' ? (
                        <button
                          onClick={() => {
                            onUpdateUser({ ...u, canEdit: !u.canEdit });
                            onNotifyToast(`Updated permissions for ${u.name}`);
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold transition-colors ${
                            u.canEdit
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                          }`}
                        >
                          {u.canEdit ? 'Can Edit Leads' : 'Read Only'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-[var(--crm-text-secondary)]">
                          {u.canEdit ? 'Full Edit' : 'Read Only'}
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {canManageThis ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-[var(--crm-text)]">
                            {isPwVisible ? u.password : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(u.id)}
                            className="p-1 rounded text-[var(--crm-text-secondary)] hover:text-[var(--crm-text)] transition-colors"
                          >
                            {isPwVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[var(--crm-text-secondary)] font-mono">••••••••</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--crm-text)]">Create Counselor / User Account</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-[var(--crm-input)] text-[var(--crm-text-secondary)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-xs text-[var(--crm-text-secondary)] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)]"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--crm-text-secondary)] block mb-1">User ID / Username</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. priya_counselor"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)] font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--crm-text-secondary)] block mb-1">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. priya@dealdeck.com"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)]"
                />
              </div>

              <div>
                <label className="text-xs text-[var(--crm-text-secondary)] block mb-1">Account Password</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)] font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-[var(--crm-input)] text-[var(--crm-text-secondary)] hover:text-[var(--crm-text)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-xs px-3.5 py-1.5 rounded-xl bg-[var(--crm-primary)] text-white hover:opacity-90 font-medium"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
