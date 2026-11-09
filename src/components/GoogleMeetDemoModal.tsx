import React, { useState, useEffect } from 'react';
import { Lead } from '../types/crm';
import { generateDemoMessage } from '../utils/crmLogic';
import { Video, Copy, Check, Send, X, Calendar, Clock } from 'lucide-react';

interface GoogleMeetDemoModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  onSendSchedule: (
    leadId: string,
    demoDetails: {
      date: string;
      time: string;
      webinarTopic: string;
      googleMeetLink: string;
      messageText: string;
    }
  ) => void;
}

export const GoogleMeetDemoModal: React.FC<GoogleMeetDemoModalProps> = ({
  lead,
  isOpen,
  onClose,
  initialDate,
  onSendSchedule,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('04:00 PM');
  const [meetLink, setMeetLink] = useState<string>('https://meet.google.com/crm-demo-live');
  const [topic, setTopic] = useState<string>('Career Mentorship & Course Demo');
  const [messageText, setMessageText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && lead) {
      const defaultDate = initialDate || lead.demoDetails?.date || new Date().toISOString().split('T')[0];
      const defaultTime = lead.demoDetails?.time || '04:00 PM';
      setSelectedDate(defaultDate);
      setSelectedTime(defaultTime);
      const link = lead.demoDetails?.googleMeetLink || 'https://meet.google.com/crm-demo-live';
      setMeetLink(link);
      const msg = generateDemoMessage(lead.name, defaultDate, defaultTime, link);
      setMessageText(msg);
      setCopied(false);
    }
  }, [isOpen, lead, initialDate]);

  if (!isOpen || !lead) return null;

  const handleUpdateDetails = (newDate: string, newTime: string, newLink: string) => {
    setSelectedDate(newDate);
    setSelectedTime(newTime);
    setMeetLink(newLink);
    setMessageText(generateDemoMessage(lead.name, newDate, newTime, newLink));
  };

  const handleCopy = () => {
    const el = document.createElement('textarea');
    el.value = messageText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    onSendSchedule(lead.id, {
      date: selectedDate,
      time: selectedTime,
      webinarTopic: topic,
      googleMeetLink: meetLink,
      messageText,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-[var(--crm-surface)] rounded-2xl shadow-2xl border border-[var(--crm-border)] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[var(--crm-border)] flex items-center justify-between bg-[var(--crm-elevated)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--crm-text)]">
                Schedule Demo / Webinar Session
              </h3>
              <p className="text-xs text-[var(--crm-text-secondary)]">
                Setup Google Meet for <strong className="text-[var(--crm-text)]">{lead.name}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[var(--crm-input)] hover:bg-[var(--crm-border)] text-[var(--crm-text-secondary)] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--crm-text-secondary)] block mb-1">
                Demo Date *
              </label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={(e) => handleUpdateDetails(e.target.value, selectedTime, meetLink)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--crm-text-secondary)] block mb-1">
                Demo Time *
              </label>
              <input
                type="text"
                value={selectedTime}
                onChange={(e) => handleUpdateDetails(selectedDate, e.target.value, meetLink)}
                placeholder="e.g. 04:00 PM"
                className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-[var(--crm-text-secondary)]">
                Google Meet Link
              </label>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const { getAccessToken, googleSignIn } = await import('../services/googleAuth');
                    const { createGoogleMeetSpace } = await import('../services/googleMeet');
                    let token = await getAccessToken();
                    if (!token) {
                      const res = await googleSignIn();
                      token = res?.accessToken || null;
                    }
                    if (token) {
                      const space = await createGoogleMeetSpace(token);
                      handleUpdateDetails(selectedDate, selectedTime, space.meetingUri);
                    } else {
                      const code = `ddk-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 5)}`;
                      handleUpdateDetails(selectedDate, selectedTime, `https://meet.google.com/${code}`);
                    }
                  } catch (e: any) {
                    const code = `ddk-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 5)}`;
                    handleUpdateDetails(selectedDate, selectedTime, `https://meet.google.com/${code}`);
                  }
                }}
                className="text-[11px] text-[var(--crm-primary)] hover:underline flex items-center gap-1 font-semibold"
              >
                <Video className="w-3 h-3 text-emerald-400" />
                <span>Generate Live Google Meet Space</span>
              </button>
            </div>
            <input
              type="text"
              value={meetLink}
              onChange={(e) => handleUpdateDetails(selectedDate, selectedTime, e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)] font-mono"
            />
          </div>

          {/* Generated message preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-[var(--crm-text-secondary)]">
                Generated Invitation Message Preview
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-[var(--crm-primary)] hover:underline flex items-center gap-1 font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-[var(--crm-input)] border border-[var(--crm-border)] text-[var(--crm-text)] outline-none focus:border-[var(--crm-primary)] leading-relaxed"
            />
          </div>

          {/* Footer Actions */}
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
              <Send className="w-3.5 h-3.5" />
              <span>Confirm & Save Schedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
