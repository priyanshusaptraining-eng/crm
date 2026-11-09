import React, { useState, useEffect } from 'react';
import { Lead } from '../types/crm';
import { generateDemoMessage } from '../utils/crmLogic';
import { motion } from 'motion/react';
import { Calendar, Clock, Copy, Check, Send, X, Video } from 'lucide-react';

interface DemoScheduleModalProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSchedule: (
    leadId: string,
    demoDetails: {
      date: string;
      time: string;
      webinarTopic: string;
      customMessage: string;
    }
  ) => void;
}

export const DemoScheduleModal: React.FC<DemoScheduleModalProps> = ({
  lead,
  isOpen,
  onClose,
  onConfirmSchedule,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('03:00 PM');
  const [topic, setTopic] = useState<string>('Full-Stack Executive Certification Masterclass');
  const [copied, setCopied] = useState<boolean>(false);
  const [customMessage, setCustomMessage] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // Default to today
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
      if (lead) {
        const msg = generateDemoMessage(lead.name, today, '03:00 PM', topic);
        setCustomMessage(msg);
      }
      setCopied(false);
    }
  }, [isOpen, lead]);

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    if (lead) {
      const msg = generateDemoMessage(lead.name, newDate, selectedTime, topic);
      setCustomMessage(msg);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setSelectedTime(newTime);
    if (lead) {
      const msg = generateDemoMessage(lead.name, selectedDate, newTime, topic);
      setCustomMessage(msg);
    }
  };

  const handleTopicChange = (newTopic: string) => {
    setTopic(newTopic);
    if (lead) {
      const msg = generateDemoMessage(lead.name, selectedDate, selectedTime, newTopic);
      setCustomMessage(msg);
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(customMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead || !selectedDate) return;

    onConfirmSchedule(lead.id, {
      date: selectedDate,
      time: selectedTime,
      webinarTopic: topic,
      customMessage,
    });
    onClose();
  };

  if (!isOpen || !lead) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden transition-all duration-200 animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-900">
              Schedule Demo & Webinar Session
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Lead Context Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900">Prospect: {lead.name}</span>
              <span>Assigned: {lead.assignedUserName}</span>
            </div>
            <div className="text-slate-500 mt-1">
              Contact: {lead.phone} · {lead.email}
            </div>
          </div>

          {/* Date and Time Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="demo-date-picker" className="block text-xs font-semibold text-slate-700 mb-1">
                Demo Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="demo-date-picker"
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
                <Calendar className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="demo-time-picker" className="block text-xs font-semibold text-slate-700 mb-1">
                Start Time <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="demo-time-picker"
                  type="text"
                  required
                  value={selectedTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  placeholder="e.g. 03:00 PM"
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Webinar Topic */}
          <div>
            <label htmlFor="demo-topic-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Webinar / Demo Topic
            </label>
            <input
              id="demo-topic-input"
              type="text"
              value={topic}
              onChange={(e) => handleTopicChange(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          {/* Auto-Generated Message Template */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="auto-msg-template" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <span>Auto-Generated Message Template</span>
                <span className="text-xs text-indigo-600 font-normal">(Preserves proper noun: {lead.name})</span>
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-2 py-0.5 rounded hover:bg-indigo-50 transition-colors"
                title="Copy template to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Template</span>
                  </>
                )}
              </button>
            </div>

            <textarea
              id="auto-msg-template"
              rows={3}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
            <p className="text-xs text-slate-500">
              Template formatted ready to be copied and dispatched via WhatsApp, Email, or SMS.
            </p>
          </div>

          {/* Super Admin Notification Notice */}
          <div className="bg-indigo-50/70 border border-indigo-100 rounded-lg p-2.5 text-xs text-indigo-900 flex items-start gap-2">
            <span className="text-indigo-600 font-bold shrink-0">Note:</span>
            <span>
              Submitting this schedule automatically dispatches a real-time notification to the Super Admin alert feed.
            </span>
          </div>

          {/* Modal Actions */}
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
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Confirm & Dispatch Alert</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
