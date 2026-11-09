import React, { useState } from 'react';
import { User, FontSizeOption } from '../../types/crm';
import { Settings, Shield, Type, Sliders, Save, Check } from 'lucide-react';

interface AdminSettingsViewProps {
  currentUser: User;
  dailyTarget: number;
  fontSize: FontSizeOption;
  onChangeAdminId: (newId: string) => void;
  onChangeDailyTarget: (newTarget: number) => void;
  onChangeFontSize: (newSize: FontSizeOption) => void;
  onNotifyToast: (msg: string) => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  currentUser,
  dailyTarget,
  fontSize,
  onChangeAdminId,
  onChangeDailyTarget,
  onChangeFontSize,
  onNotifyToast,
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const [adminIdInput, setAdminIdInput] = useState(currentUser.id);
  const [targetInput, setTargetInput] = useState(dailyTarget.toString());

  const handleSaveAdminId = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminIdInput.trim()) return;
    onChangeAdminId(adminIdInput.trim());
    onNotifyToast(`Super Admin ID changed to "${adminIdInput.trim()}"`);
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(targetInput, 10);
    if (isNaN(val) || val <= 0) return;
    onChangeDailyTarget(val);
    onNotifyToast(`Daily call target updated to ${val} calls`);
  };

  const fontSizes: { size: FontSizeOption; label: string; desc: string }[] = [
    { size: 12, label: '12px', desc: 'Compact dense view' },
    { size: 14, label: '14px', desc: 'Standard balanced default' },
    { size: 16, label: '16px', desc: 'Comfortable enhanced readability' },
    { size: 18, label: '18px', desc: 'Large high-contrast display' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Banner */}
      <div className="flex items-center gap-3 bg-[var(--crm-surface)] border border-[var(--crm-border)] p-5 rounded-2xl">
        <div className="w-10 h-10 rounded-xl bg-[var(--crm-primary)]/10 text-[var(--crm-primary)] flex items-center justify-center font-bold">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--crm-text)] tracking-tight">
            System & Personal Display Settings
          </h2>
          <p className="text-xs text-[var(--crm-text-secondary)] mt-0.5">
            Configure display font sizing (12, 14, 16, 18), administrative access IDs, and company performance targets
          </p>
        </div>
      </div>

      {/* Font Size Preferences Section */}
      <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[var(--crm-primary)]/15 text-[var(--crm-primary)] flex items-center justify-center">
            <Type className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--crm-text)] text-sm">
              Typography & Font Sizing Scale (12, 14, 16, 18)
            </h3>
            <p className="text-xs text-[var(--crm-text-secondary)]">
              Customize the interface font size to your personal reading comfort
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {fontSizes.map((item) => {
            const isSelected = fontSize === item.size;
            return (
              <button
                key={item.size}
                type="button"
                onClick={() => {
                  onChangeFontSize(item.size);
                  onNotifyToast(`Interface font size set to ${item.label}`);
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[var(--crm-primary)]/10 border-[var(--crm-primary)] ring-1 ring-[var(--crm-primary)]'
                    : 'bg-[var(--crm-input)] border-[var(--crm-border)] hover:border-[var(--crm-border)]'
                }`}
              >
                <div className={`font-bold text-sm ${isSelected ? 'text-[var(--crm-primary)]' : 'text-[var(--crm-text)]'}`}>
                  {item.label}
                </div>
                <div className="text-[11px] text-[var(--crm-text-secondary)] mt-1">
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Admin Credentials Management */}
      {isSuperAdmin && (
        <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[var(--crm-text)] text-sm">
                Super Admin ID & Credentials
              </h3>
              <p className="text-xs text-[var(--crm-text-secondary)]">
                Update the master administrator login identifier
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveAdminId} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={adminIdInput}
              onChange={(e) => setAdminIdInput(e.target.value)}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)] font-mono"
              placeholder="e.g. admin_priyanshu_01"
            />
            <button
              type="submit"
              className="text-xs px-4 py-2.5 rounded-xl bg-[var(--crm-primary)] text-white hover:opacity-90 font-medium transition-opacity flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Update Identifier</span>
            </button>
          </form>
        </div>
      )}

      {/* Daily Target Setting */}
      <div className="bg-[var(--crm-surface)] border border-[var(--crm-border)] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--crm-text)] text-sm">
              Daily Call Activity Target
            </h3>
            <p className="text-xs text-[var(--crm-text-secondary)]">
              Benchmark quota of sales consultation calls required per counselor daily
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveTarget} className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            min={5}
            max={200}
            value={targetInput}
            onChange={(e) => setTargetInput(e.target.value)}
            className="w-full sm:w-48 text-xs px-3.5 py-2.5 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)]"
          />
          <button
            type="submit"
            className="text-xs px-4 py-2.5 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] hover:border-[var(--crm-primary)] text-[var(--crm-text)] font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Target</span>
          </button>
        </form>
      </div>
    </div>
  );
};
