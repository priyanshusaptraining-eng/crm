import React, { useState, useRef, useEffect } from 'react';
import { Phone, Copy, Check, ExternalLink, MessageSquare, ChevronDown } from 'lucide-react';
import { normalizePhoneNumber, getTelUri, getWhatsAppUrl, generateWhatsAppMessage, DEFAULT_WHATSAPP_TEMPLATES } from '../utils/phoneUtils';

interface PhoneActionGroupProps {
  phone: string;
  candidateName: string;
  courseName?: string;
  counselorName?: string;
  onInitiateCall?: () => void;
  onOpenWhatsAppModal?: () => void;
  onNotifyToast: (msg: string) => void;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  className?: string;
}

export const PhoneActionGroup: React.FC<PhoneActionGroupProps> = ({
  phone,
  candidateName,
  courseName = 'Certification Program',
  counselorName = 'Counselor',
  onInitiateCall,
  onOpenWhatsAppModal,
  onNotifyToast,
  size = 'md',
  showNumber = true,
  className = '',
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const norm = normalizePhoneNumber(phone);

  // Close popup menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!norm.isValid && !norm.raw) {
      onNotifyToast('Invalid phone number.');
      return;
    }

    // Open phone dialer with tel: URI
    window.location.href = getTelUri(norm.raw);

    // Trigger CRM post-call workflow prompt
    if (onInitiateCall) {
      setTimeout(() => {
        onInitiateCall();
      }, 500);
    } else {
      onNotifyToast(`Opening dialer for ${norm.display}`);
    }
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(norm.raw);
    } catch {
      const el = document.createElement('textarea');
      el.value = norm.raw;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setIsCopied(true);
    setIsMenuOpen(false);
    onNotifyToast(`Copied phone number: ${norm.raw}`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleOpenWhatsAppDirect = (e: React.MouseEvent, isWeb: boolean = false) => {
    e.stopPropagation();
    setIsMenuOpen(false);

    if (!norm.waDigits) {
      onNotifyToast('Valid phone number required for WhatsApp.');
      return;
    }

    const defaultMsg = generateWhatsAppMessage(
      DEFAULT_WHATSAPP_TEMPLATES[0].text,
      candidateName,
      courseName,
      counselorName
    );

    const url = getWhatsAppUrl(norm.raw, defaultMsg, isWeb);
    window.open(url, '_blank', 'noopener,noreferrer');
    onNotifyToast(`Opening WhatsApp chat with ${candidateName}`);
  };

  const handleOpenCustomizeModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (onOpenWhatsAppModal) {
      onOpenWhatsAppModal();
    } else {
      handleOpenWhatsAppDirect(e, false);
    }
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const buttonPaddings = {
    sm: 'px-2 py-1 text-[11px]',
    md: 'px-2.5 py-1.5 text-xs',
    lg: 'px-3.5 py-2 text-sm',
  };

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`} ref={menuRef}>
      {/* 1. Phone Calling Action & Number */}
      <div className="inline-flex items-center bg-[#151F35] hover:bg-[#1E2D4A] border border-[#1E2D4A] rounded-xl overflow-hidden transition group">
        <a
          href={getTelUri(norm.raw)}
          onClick={handleCallClick}
          className={`flex items-center gap-1.5 ${buttonPaddings[size]} text-slate-200 group-hover:text-emerald-400 font-semibold font-mono tracking-tight transition active:scale-95`}
          title={`Call ${norm.display} (Opens phone dialer)`}
        >
          <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Phone className={iconSizes[size]} />
          </div>
          {showNumber && <span>{norm.display || norm.raw}</span>}
        </a>

        {/* Quick Copy Number button */}
        <button
          type="button"
          onClick={handleCopy}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-[#23324E] border-l border-[#1E2D4A] transition"
          title="Copy Phone Number Only"
          aria-label="Copy phone number"
        >
          {isCopied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* 2. Official Green WhatsApp Button */}
      <button
        type="button"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/40 text-[#25D366] transition shadow-xs active:scale-95"
        title="WhatsApp Quick Contact Menu"
        aria-label="Open WhatsApp Options"
      >
        {/* Official WhatsApp SVG Icon */}
        <svg
          className="w-4 h-4 fill-current shrink-0"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
        <ChevronDown className="w-3 h-3 opacity-70" />
      </button>

      {/* 3. Small Action Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#111827] border border-[#1E2D4A] rounded-2xl shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-[#1E2D4A]/60 mb-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              WhatsApp Actions
            </span>
            <span className="text-xs font-semibold text-white truncate block">
              {candidateName}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => handleOpenWhatsAppDirect(e, false)}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-[#151F35] flex items-center justify-between group transition"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#25D366]" />
              Open WhatsApp App
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
          </button>

          <button
            type="button"
            onClick={(e) => handleOpenWhatsAppDirect(e, true)}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:text-white hover:bg-[#151F35] flex items-center justify-between group transition"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              Open WhatsApp Web
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
          </button>

          <button
            type="button"
            onClick={handleOpenCustomizeModal}
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-amber-300 hover:bg-amber-500/10 flex items-center gap-2 transition"
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            Edit / Template Message
          </button>

          <div className="border-t border-[#1E2D4A]/60 my-1 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-[#151F35] flex items-center gap-2 transition"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              Copy Clean Number
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
