import React from 'react';
import { NavItemConfig } from '../types/crm';
import { SlidersHorizontal, Check, X, Eye, EyeOff } from 'lucide-react';

interface NavCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItemConfig[];
  onToggleItem: (id: string) => void;
  onResetDefaults: () => void;
}

export const NavCustomizationModal: React.FC<NavCustomizationModalProps> = ({
  isOpen,
  onClose,
  navItems,
  onToggleItem,
  onResetDefaults,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#3B5BFE] flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Customize Left Navigation Panel
              </h3>
              <p className="text-xs text-slate-400">
                Choose which links and modules to keep visible
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of items */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100 leading-relaxed">
            Select the options you want to keep on your left sidebar menu. Toggle switches instantly update the interface.
          </div>

          <div className="divide-y divide-slate-100">
            {navItems.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900">{item.label}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">{item.section}</span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleItem(item.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-all ${
                    item.visible
                      ? 'bg-blue-50 border-blue-200 text-[#3B5BFE]'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {item.visible ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-[#3B5BFE]" />
                      <span>Shown</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-[#F8FAFC]">
          <button
            type="button"
            onClick={onResetDefaults}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
          >
            Reset to Default
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-[#3B5BFE] hover:bg-blue-600 rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-blue-500/20"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply & Done</span>
          </button>
        </div>

      </div>
    </div>
  );
};
