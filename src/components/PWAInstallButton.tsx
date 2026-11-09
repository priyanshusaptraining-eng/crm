import React, { useState } from 'react';
import { Download, Smartphone, Check, X, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '',
  variant = 'compact'
}) => {
  const { isInstallable, isInstalled, installApp } = usePWAInstall();
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [installedNotice, setInstalledNotice] = useState(false);

  // Check if iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;

  const handleInstallClick = async () => {
    if (isInstalled) {
      setInstalledNotice(true);
      setTimeout(() => setInstalledNotice(false), 3000);
      return;
    }

    if (isInstallable) {
      const success = await installApp();
      if (success) {
        setInstalledNotice(true);
        setTimeout(() => setInstalledNotice(false), 3000);
      }
    } else if (isIOS) {
      setShowIosGuide(true);
    } else {
      // General instructions
      setShowIosGuide(true);
    }
  };

  if (isInstalled) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-lg ${className}`}>
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        <span>App Installed</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Install CorporateAcademy CRM App"
        className={`inline-flex items-center gap-2 font-medium text-xs rounded-lg transition-all ${
          variant === 'full'
            ? 'w-full justify-center px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-semibold hover:from-amber-400 hover:to-amber-500 shadow-md shadow-amber-500/20'
            : 'px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 hover:text-amber-200'
        } ${className}`}
      >
        <Smartphone className="w-4 h-4 text-amber-400" />
        <span>{variant === 'full' ? 'Install App on Phone' : 'Install App'}</span>
        <Download className="w-3 h-3 opacity-70" />
      </button>

      {/* iOS or Manual Add to Home Screen Instructions Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111827] border border-[#1E2D4A] rounded-2xl p-5 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-4 text-amber-400">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-base font-semibold text-white mb-1">
              Install CorporateAcademy CRM
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Access leads, instant WhatsApp messaging, and 1-tap calling right from your phone home screen like a native app.
            </p>

            <div className="space-y-3 bg-[#0B1020] p-3.5 rounded-xl border border-slate-800 mb-4 text-xs text-slate-300">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-slate-800 rounded text-amber-400 shrink-0">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-white">1. Tap the Share button</p>
                      <p className="text-slate-400">Located at the bottom of Safari browser.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-slate-800 rounded text-amber-400 shrink-0">
                      <PlusSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-white">2. Select &apos;Add to Home Screen&apos;</p>
                      <p className="text-slate-400">Scroll down and tap &quot;Add to Home Screen&quot;.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 bg-slate-800 rounded text-amber-400 shrink-0">
                      <Download className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Android / Chrome</p>
                      <p className="text-slate-400">Tap browser menu (3 dots) &rarr; &quot;Install app&quot; or &quot;Add to Home screen&quot;.</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 bg-amber-500 text-slate-950 font-semibold rounded-xl text-xs hover:bg-amber-400 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {installedNotice && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>App is installed and ready on your home screen!</span>
        </div>
      )}
    </>
  );
};
