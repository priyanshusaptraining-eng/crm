import React, { useState } from 'react';
import { Lead, User } from '../types/crm';
import { 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  MessageSquare, 
  Sparkles, 
  Send,
  FileText,
  UserCheck
} from 'lucide-react';
import { 
  normalizePhoneNumber, 
  getWhatsAppUrl, 
  generateWhatsAppMessage, 
  DEFAULT_WHATSAPP_TEMPLATES 
} from '../utils/phoneUtils';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  currentUser: User;
  onNotifyToast: (msg: string) => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  lead,
  currentUser,
  onNotifyToast,
}) => {
  if (!isOpen || !lead) return null;

  const norm = normalizePhoneNumber(lead.phone);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(DEFAULT_WHATSAPP_TEMPLATES[0].id);

  // Initialize editable message with template
  const [customMessage, setCustomMessage] = useState<string>(() => {
    return generateWhatsAppMessage(
      DEFAULT_WHATSAPP_TEMPLATES[0].text,
      lead.name,
      lead.course,
      currentUser.name
    );
  });

  const [isCopied, setIsCopied] = useState(false);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = DEFAULT_WHATSAPP_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      const generated = generateWhatsAppMessage(
        tmpl.text,
        lead.name,
        lead.course,
        currentUser.name
      );
      setCustomMessage(generated);
    }
  };

  const handleSendViaWhatsApp = (isWeb: boolean = false) => {
    if (!norm.waDigits) {
      onNotifyToast('Invalid candidate phone number.');
      return;
    }

    const url = getWhatsAppUrl(norm.raw, customMessage, isWeb);
    window.open(url, '_blank', 'noopener,noreferrer');
    onNotifyToast(`Opening WhatsApp chat with ${lead.name}`);
    onClose();
  };

  const handleCopyMessage = () => {
    try {
      navigator.clipboard.writeText(customMessage);
    } catch {
      const el = document.createElement('textarea');
      el.value = customMessage;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setIsCopied(true);
    onNotifyToast('Copied WhatsApp message text.');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-[#111827] border border-[#1E2D4A] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#1E2D4A] bg-[#151F35] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-[220px]">
                  WhatsApp Outreach: {lead.name}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#25D366]/20 text-[#25D366] px-2 py-0.5 rounded-full border border-[#25D366]/30">
                  Ready to Send
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {norm.display || lead.phone} • {lead.course || 'Admissions'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-[#1E2D4A] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Quick Template Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Select Message Template
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEFAULT_WHATSAPP_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tmpl.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition active:scale-98 ${
                    selectedTemplateId === tmpl.id
                      ? 'bg-[#25D366]/15 border-[#25D366]/50 text-white shadow-xs'
                      : 'bg-[#151F35] border-[#1E2D4A] text-slate-300 hover:bg-[#1E2D4A]'
                  }`}
                >
                  <span className="block truncate text-slate-200">{tmpl.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Editable Message Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Message Content (Editable before sending)
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Type your WhatsApp message..."
              className="w-full p-3 bg-[#151F35] border border-[#1E2D4A] rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#25D366] transition resize-none leading-relaxed"
            />

            <p className="text-[11px] text-slate-500 mt-1 italic">
              Note: Clicking send opens the official WhatsApp link with the message prefilled; you can review in WhatsApp and hit Send.
            </p>
          </div>

          {/* Recipient verification info */}
          <div className="p-3 bg-[#151F35]/70 border border-[#1E2D4A] rounded-xl flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#25D366]" />
              Recipient: <strong className="text-white">{norm.e164}</strong>
            </span>
            <span className="text-slate-400 text-[11px]">Country: +{norm.countryCode}</span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 border-t border-[#1E2D4A]/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-[#151F35] hover:bg-[#1E2D4A] border border-[#1E2D4A] transition text-center"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => handleSendViaWhatsApp(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#151F35] hover:bg-[#1E2D4A] border border-[#1E2D4A] transition flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              Open WhatsApp Web
            </button>

            <button
              type="button"
              onClick={() => handleSendViaWhatsApp(false)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-[#25D366] hover:bg-[#20ba5a] transition shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Open in WhatsApp App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
