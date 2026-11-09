import React, { useState } from 'react';
import { ThemeId } from '../types/crm';
import { availableThemes, applyThemeToDocument } from '../data/themes';
import { Palette, X, Check, Sparkles } from 'lucide-react';

interface AppearanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSaveTheme: (theme: ThemeId) => void;
}

export const AppearanceModal: React.FC<AppearanceModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSaveTheme,
}) => {
  const [selectedPreviewTheme, setSelectedPreviewTheme] = useState<ThemeId>(currentTheme);

  if (!isOpen) return null;

  const handleSelect = (themeId: ThemeId) => {
    setSelectedPreviewTheme(themeId);
    applyThemeToDocument(themeId); // Live immediate preview
  };

  const handleApply = () => {
    onSaveTheme(selectedPreviewTheme);
    onClose();
  };

  const handleCancel = () => {
    applyThemeToDocument(currentTheme); // Restore previous theme
    setSelectedPreviewTheme(currentTheme);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] bg-[var(--card-bg)] border border-[var(--border)] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[var(--text-primary)]"
        role="dialog"
        aria-labelledby="appearance-title"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--elevated-bg)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 id="appearance-title" className="text-base font-semibold text-[var(--text-primary)]">
                Appearance
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Select your preferred visual environment
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="w-7 h-7 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--input-bg)] flex items-center justify-center transition-colors"
            aria-label="Close appearance drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            5 Commercial Themes
          </div>

          <div className="space-y-2.5">
            {availableThemes.map((theme) => {
              const isSelected = selectedPreviewTheme === theme.id;
              const isDefault = theme.id === 'midnight-navy';

              return (
                <div
                  key={theme.id}
                  onClick={() => handleSelect(theme.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)] ring-1 ring-[var(--accent)]'
                      : 'border-[var(--border)] hover:border-[var(--text-muted)] bg-[var(--elevated-bg)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[var(--text-primary)]">
                        {theme.name}
                      </span>
                      {isDefault && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--accent)] text-white">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Swatches preview */}
                      <div className="flex items-center gap-1 p-1 rounded-md bg-black/20 border border-white/5">
                        <div className="w-3.5 h-3.5 rounded-xs" style={{ backgroundColor: theme.primaryHex }} title="Background" />
                        <div className="w-3.5 h-3.5 rounded-xs" style={{ backgroundColor: theme.cardHex }} title="Surface" />
                        <div className="w-3.5 h-3.5 rounded-xs" style={{ backgroundColor: theme.accentHex }} title="Accent" />
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center ml-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {theme.tagline}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--elevated-bg)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Theme auto-persists in your browser.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3.5 py-1.5 rounded-lg border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--input-bg)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-4 py-1.5 rounded-lg bg-[var(--accent)] hover:opacity-90 text-white text-xs font-semibold transition-opacity shadow-xs"
            >
              Apply Theme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
