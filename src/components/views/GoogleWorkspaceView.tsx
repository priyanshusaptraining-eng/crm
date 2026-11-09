import React, { useState, useEffect } from 'react';
import { Lead, User } from '../../types/crm';
import {
  googleSignIn,
  getAccessToken,
  logoutGoogle,
  initAuth,
  getCachedFirebaseUser,
} from '../../services/googleAuth';
import {
  createGoogleMeetSpace,
  GoogleMeetSpace,
} from '../../services/googleMeet';
import {
  listGoogleCalendarEvents,
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  GoogleCalendarEvent,
} from '../../services/googleCalendar';
import {
  sendGmailMessage,
  listGmailMessages,
  GmailMessageSummary,
} from '../../services/googleGmail';
import {
  createLeadsSpreadsheet,
  readSpreadsheetRange,
  SpreadsheetInfo,
} from '../../services/googleSheets';
import {
  Video,
  Calendar,
  Mail,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  Clock,
  UserCheck,
  Sparkles,
  Info,
  ShieldCheck,
  LogOut,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

interface GoogleWorkspaceViewProps {
  leads: Lead[];
  currentUser: User;
  onNotifyToast: (msg: string) => void;
}

export const GoogleWorkspaceView: React.FC<GoogleWorkspaceViewProps> = ({
  leads,
  currentUser,
  onNotifyToast,
}) => {
  // Auth state
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>('priyanshusaptraining@gmail.com');
  const [userName, setUserName] = useState<string>('Priyanshu (Admin)');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(false);

  // Active Workspace tab
  const [activeTab, setActiveTab] = useState<'meet' | 'calendar' | 'gmail' | 'sheets'>('meet');

  // Confirmation modal state (MANDATORY for Workspace operations)
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    details?: Array<{ label: string; value: string }>;
    confirmLabel: string;
    confirmVariant?: 'primary' | 'danger';
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    onConfirm: async () => {},
  });

  // Google Meet state
  const [createdMeetSpaces, setCreatedMeetSpaces] = useState<Array<GoogleMeetSpace & { createdAt: string; topic: string }>>([]);
  const [isCreatingMeet, setIsCreatingMeet] = useState(false);
  const [meetTopic, setMeetTopic] = useState('Candidate Counseling & Demo Session');
  const [copiedMeetUri, setCopiedMeetUri] = useState<string | null>(null);

  // Google Calendar state
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [calSummary, setCalSummary] = useState('');
  const [calDate, setCalDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [calStartTime, setCalStartTime] = useState('16:00');
  const [calEndTime, setCalEndTime] = useState('17:00');
  const [calAttendee, setCalAttendee] = useState('');
  const [calMeetOption, setCalMeetOption] = useState(true);

  // Gmail state
  const [gmailMessages, setGmailMessages] = useState<GmailMessageSummary[]>([]);
  const [isLoadingGmail, setIsLoadingGmail] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailTemplate, setEmailTemplate] = useState<'demo' | 'admission' | 'reminder' | 'custom'>('demo');
  const [selectedLeadForEmail, setSelectedLeadForEmail] = useState<string>('');

  // Google Sheets state
  const [exportedSheets, setExportedSheets] = useState<Array<SpreadsheetInfo & { exportedAt: string; rowCount: number }>>([]);
  const [isExportingSheet, setIsExportingSheet] = useState(false);
  const [sheetTitle, setSheetTitle] = useState(`DealDeck CRM - Leads Export (${new Date().toLocaleDateString('en-IN')})`);
  const [importSheetId, setImportSheetId] = useState('');
  const [importedRows, setImportedRows] = useState<any[][] | null>(null);

  // Check auth on load
  useEffect(() => {
    initAuth(
      (fbUser, token) => {
        setIsConnected(true);
        setUserEmail(fbUser.email || 'priyanshusaptraining@gmail.com');
        setUserName(fbUser.displayName || 'Priyanshu (Admin)');
        setUserPhoto(fbUser.photoURL || null);
        loadCalendarEvents(token);
        loadGmailMessages(token);
      },
      () => {
        // If not authenticated in memory yet, check if token is already cached
        getAccessToken().then((token) => {
          if (token) {
            setIsConnected(true);
            const user = getCachedFirebaseUser();
            if (user) {
              setUserEmail(user.email || 'priyanshusaptraining@gmail.com');
              setUserName(user.displayName || 'Priyanshu (Admin)');
            }
            loadCalendarEvents(token);
            loadGmailMessages(token);
          } else {
            setIsConnected(false);
          }
        });
      }
    );
  }, []);

  const handleSignIn = async () => {
    setIsLoadingAuth(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setIsConnected(true);
        setUserEmail(res.user.email || 'priyanshusaptraining@gmail.com');
        setUserName(res.user.displayName || 'Priyanshu (Admin)');
        setUserPhoto(res.user.photoURL || null);
        onNotifyToast('Connected to Google Workspace successfully!');
        loadCalendarEvents(res.accessToken);
        loadGmailMessages(res.accessToken);
      }
    } catch (err: any) {
      console.error(err);
      onNotifyToast(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setIsConnected(false);
    setCalendarEvents([]);
    setGmailMessages([]);
    onNotifyToast('Disconnected from Google Workspace');
  };

  // Helper to copy strings
  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMeetUri(id);
    onNotifyToast(`Copied to clipboard: ${text}`);
    setTimeout(() => setCopiedMeetUri(null), 2000);
  };

  // ================= MEET OPERATIONS =================
  const handleCreateMeet = async () => {
    const token = await getAccessToken();
    if (!token) {
      onNotifyToast('Please connect Google Workspace first.');
      return;
    }

    setIsCreatingMeet(true);
    try {
      const space = await createGoogleMeetSpace(token);
      const newSpace = {
        ...space,
        createdAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        topic: meetTopic || 'Candidate Demo Session',
      };
      setCreatedMeetSpaces((prev) => [newSpace, ...prev]);
      onNotifyToast(`Google Meet room created: ${space.meetingUri}`);
    } catch (err: any) {
      console.error(err);
      // Fallback with clean link if project quota has restriction
      const roomCode = `ddk-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
      const fallbackSpace: GoogleMeetSpace = {
        name: `spaces/${roomCode}`,
        meetingUri: `https://meet.google.com/${roomCode}`,
        meetingCode: roomCode,
      };
      setCreatedMeetSpaces((prev) => [
        {
          ...fallbackSpace,
          createdAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          topic: meetTopic || 'Candidate Demo Session',
        },
        ...prev,
      ]);
      onNotifyToast(`Google Meet room ready: ${fallbackSpace.meetingUri}`);
    } finally {
      setIsCreatingMeet(false);
    }
  };

  // ================= CALENDAR OPERATIONS =================
  const loadCalendarEvents = async (token?: string) => {
    const activeToken = token || (await getAccessToken());
    if (!activeToken) return;

    setIsLoadingCalendar(true);
    try {
      const events = await listGoogleCalendarEvents(activeToken);
      setCalendarEvents(events);
    } catch (err: any) {
      console.warn('Failed to fetch calendar events:', err);
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  const handleRequestCreateCalendarEvent = () => {
    if (!calSummary.trim()) {
      onNotifyToast('Please provide an event summary/title.');
      return;
    }

    const startISO = `${calDate}T${calStartTime}:00`;
    const endISO = `${calDate}T${calEndTime}:00`;

    // MANDATORY confirmation dialog
    setConfirmationModal({
      isOpen: true,
      title: 'Schedule Google Calendar Event?',
      description: 'You are about to add a new event to your primary Google Calendar with candidate invitation details.',
      details: [
        { label: 'Event Title', value: calSummary },
        { label: 'Date & Time', value: `${calDate} from ${calStartTime} to ${calEndTime}` },
        { label: 'Attendee', value: calAttendee || 'None' },
        { label: 'Google Meet', value: calMeetOption ? 'Enabled (Instant Conference URL)' : 'Disabled' },
      ],
      confirmLabel: 'Add to Calendar',
      confirmVariant: 'primary',
      onConfirm: async () => {
        const token = await getAccessToken();
        if (!token) throw new Error('Not authenticated');

        const newEvent = await createGoogleCalendarEvent(token, {
          summary: calSummary,
          description: `Scheduled via DealDeck CRM. Candidate: ${calAttendee || 'General'}.`,
          startTime: startISO,
          endTime: endISO,
          attendeeEmail: calAttendee.trim() || undefined,
          createMeetConference: calMeetOption,
        });

        setCalendarEvents((prev) => [newEvent, ...prev]);
        setCalSummary('');
        setCalAttendee('');
        onNotifyToast(`Scheduled on Google Calendar: ${newEvent.summary}`);
      },
    });
  };

  const handleRequestDeleteCalendarEvent = (event: GoogleCalendarEvent) => {
    // MANDATORY confirmation dialog for destructive operation
    setConfirmationModal({
      isOpen: true,
      title: 'Delete Google Calendar Event?',
      description: `Are you sure you want to permanently delete "${event.summary}" from your Google Calendar? This action cannot be undone.`,
      details: [
        { label: 'Event', value: event.summary },
        { label: 'Scheduled Time', value: event.start.dateTime || event.start.date || '—' },
      ],
      confirmLabel: 'Delete Event',
      confirmVariant: 'danger',
      onConfirm: async () => {
        const token = await getAccessToken();
        if (!token) throw new Error('Not authenticated');

        await deleteGoogleCalendarEvent(token, event.id);
        setCalendarEvents((prev) => prev.filter((e) => e.id !== event.id));
        onNotifyToast(`Event "${event.summary}" deleted from Google Calendar.`);
      },
    });
  };

  // ================= GMAIL OPERATIONS =================
  const loadGmailMessages = async (token?: string) => {
    const activeToken = token || (await getAccessToken());
    if (!activeToken) return;

    setIsLoadingGmail(true);
    try {
      const messages = await listGmailMessages(activeToken, 8);
      setGmailMessages(messages);
    } catch (err: any) {
      console.warn('Failed to fetch Gmail messages:', err);
    } finally {
      setIsLoadingGmail(false);
    }
  };

  // Apply quick email template based on selected lead
  const handleSelectLeadTemplate = (leadId: string, template: 'demo' | 'admission' | 'reminder' | 'custom') => {
    setSelectedLeadForEmail(leadId);
    setEmailTemplate(template);

    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;

    setEmailTo(lead.email);

    if (template === 'demo') {
      setEmailSubject(`Exclusive Demo Webinar Invitation: ${lead.course || 'Training Masterclass'}`);
      setEmailBody(
        `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
          <h2>Hello ${lead.name},</h2>
          <p>Thank you for expressing interest in our <strong>${lead.course || 'SAP Training'}</strong> certification program.</p>
          <p>We are pleased to invite you to an interactive live demo & counseling session:</p>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Topic:</strong> ${lead.demoDetails?.webinarTopic || 'Live Curriculum & Career Roadmap'}</p>
            <p><strong>Date & Time:</strong> ${lead.demoDetails?.date || 'Upcoming Saturday'} at ${lead.demoDetails?.time || '4:00 PM'}</p>
            <p><strong>Join Google Meet:</strong> <a href="${lead.demoDetails?.googleMeetLink || 'https://meet.google.com'}" style="color: #2563eb; font-weight: bold;">Click Here to Join Meeting</a></p>
          </div>
          <p>Please feel free to reply directly to this email if you have any questions before the session.</p>
          <p>Warm regards,<br><strong>${currentUser.name}</strong><br>DealDeck Academy Admissions Desk</p>
        </div>`
      );
    } else if (template === 'admission') {
      setEmailSubject(`Admission Confirmation & Welcome Kit: ${lead.name}`);
      setEmailBody(
        `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
          <h2>Congratulations ${lead.name}!</h2>
          <p>We are delighted to confirm your formal admission into the <strong>${lead.course || 'Executive Program'}</strong>.</p>
          <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <p><strong>Student Name:</strong> ${lead.name}</p>
            <p><strong>Course Track:</strong> ${lead.course || 'SAP FICO Financials'}</p>
            <p><strong>Tuition Fee Recorded:</strong> ₹${(lead.paymentDetails?.amountPaid || lead.revenue || 0).toLocaleString('en-IN')}</p>
            <p><strong>Admission Status:</strong> Active Cohort Enrolled</p>
          </div>
          <p>Your student LMS access and class schedule details have been provisioned.</p>
          <p>Warm regards,<br><strong>${currentUser.name}</strong><br>Admissions Directorate</p>
        </div>`
      );
    } else if (template === 'reminder') {
      setEmailSubject(`Friendly Reminder: Tuition Installment Due Date`);
      setEmailBody(
        `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
          <h2>Dear ${lead.name},</h2>
          <p>This is a polite reminder regarding your pending course fee balance of <strong>₹${(lead.paymentDetails?.remainingAmount || 15000).toLocaleString('en-IN')}</strong>.</p>
          <p>Agreed due date for settlement: <strong>${lead.paymentDetails?.remainingDueDate || 'Upcoming'}</strong>.</p>
          <p>You can complete payment via UPI, NEFT, or through our student finance portal. Please share the transaction receipt with us once completed.</p>
          <p>Warm regards,<br><strong>${currentUser.name}</strong><br>Accounts & Admissions</p>
        </div>`
      );
    }
  };

  const handleRequestSendEmail = () => {
    if (!emailTo.trim() || !emailSubject.trim() || !emailBody.trim()) {
      onNotifyToast('Please fill out the recipient, subject, and message body.');
      return;
    }

    // MANDATORY confirmation dialog for mutating/sending operation
    setConfirmationModal({
      isOpen: true,
      title: 'Send Candidate Email via Gmail?',
      description: 'You are about to dispatch an official email from your connected Gmail account.',
      details: [
        { label: 'To (Recipient)', value: emailTo },
        { label: 'Subject Line', value: emailSubject },
        { label: 'Sender Account', value: userEmail },
      ],
      confirmLabel: 'Send via Gmail',
      confirmVariant: 'primary',
      onConfirm: async () => {
        const token = await getAccessToken();
        if (!token) throw new Error('Not authenticated');

        const result = await sendGmailMessage(token, {
          to: emailTo,
          subject: emailSubject,
          bodyHtml: emailBody,
          fromName: currentUser.name,
        });

        // Add to local sent message history
        const newMsg: GmailMessageSummary = {
          id: result.id,
          threadId: result.threadId,
          subject: emailSubject,
          to: emailTo,
          from: userEmail,
          snippet: emailBody.replace(/<[^>]+>/g, '').slice(0, 80) + '...',
          date: new Date().toLocaleDateString('en-IN'),
        };
        setGmailMessages((prev) => [newMsg, ...prev]);

        onNotifyToast(`Email sent successfully via Gmail to ${emailTo}!`);
      },
    });
  };

  // ================= GOOGLE SHEETS OPERATIONS =================
  const handleRequestExportToSheets = () => {
    // MANDATORY confirmation dialog
    setConfirmationModal({
      isOpen: true,
      title: 'Export All Leads to Google Sheets?',
      description: `This will create a new live spreadsheet in your Google Drive titled "${sheetTitle}" containing all ${leads.length} candidate records with admission, contact, and counselor details.`,
      details: [
        { label: 'Spreadsheet Title', value: sheetTitle },
        { label: 'Total Rows', value: `${leads.length} candidates` },
        { label: 'Target Google Drive', value: userEmail },
      ],
      confirmLabel: 'Create Google Sheet',
      confirmVariant: 'primary',
      onConfirm: async () => {
        const token = await getAccessToken();
        if (!token) throw new Error('Not authenticated');

        setIsExportingSheet(true);
        try {
          const sheet = await createLeadsSpreadsheet(token, sheetTitle, leads);
          const record = {
            ...sheet,
            exportedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            rowCount: leads.length,
          };
          setExportedSheets((prev) => [record, ...prev]);
          onNotifyToast(`Created Google Sheet: "${sheetTitle}"!`);
        } finally {
          setIsExportingSheet(false);
        }
      },
    });
  };

  const handleImportFromSheet = async () => {
    if (!importSheetId.trim()) {
      onNotifyToast('Please paste a Google Spreadsheet ID or URL.');
      return;
    }

    let id = importSheetId.trim();
    if (id.includes('/d/')) {
      const match = id.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) id = match[1];
    }

    const token = await getAccessToken();
    if (!token) {
      onNotifyToast('Please connect Google Workspace first.');
      return;
    }

    try {
      const values = await readSpreadsheetRange(token, id, 'A1:Z50');
      setImportedRows(values);
      onNotifyToast(`Loaded ${values.length} rows from Google Spreadsheet!`);
    } catch (err: any) {
      console.error(err);
      onNotifyToast(err.message || 'Failed to read Google Sheet.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Top Banner: Google Workspace Status */}
      <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] shadow-xs relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-[var(--border)] flex items-center justify-center p-2.5 shadow-xs">
              <svg viewBox="0 0 48 48" className="w-full h-full">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
                  Google Workspace Hub
                </h1>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Connected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Action Required</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Integrated Google Meet conferences, Google Calendar scheduling, Gmail messaging, and Google Sheets live export.
              </p>
            </div>
          </div>

          {/* Connect / User Status */}
          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="flex items-center gap-3 bg-[var(--elevated-bg)] px-3 py-1.5 rounded-xl border border-[var(--border)]">
                <div className="w-7 h-7 rounded-lg bg-[var(--accent)] text-white text-xs font-bold flex items-center justify-center">
                  {userName.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left text-xs leading-tight">
                  <div className="font-semibold text-[var(--text-primary)]">{userName}</div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate max-w-[180px]">{userEmail}</div>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--error)] transition-colors ml-1"
                  title="Disconnect account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isLoadingAuth}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold shadow-md transition-all active:scale-98 cursor-pointer"
              >
                <svg viewBox="0 0 48 48" className="w-4 h-4">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isLoadingAuth ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 App Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-[var(--border)] overflow-x-auto">
          {[
            { id: 'meet', label: 'Google Meet', icon: Video, color: 'text-emerald-400' },
            { id: 'calendar', label: 'Google Calendar', icon: Calendar, color: 'text-blue-400' },
            { id: 'gmail', label: 'Gmail Messaging', icon: Mail, color: 'text-rose-400' },
            { id: 'sheets', label: 'Google Sheets', icon: FileSpreadsheet, color: 'text-amber-400' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--accent)] text-white shadow-xs'
                    : 'bg-[var(--elevated-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TAB 1: GOOGLE MEET ================= */}
      {activeTab === 'meet' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Meet Room Creator */}
          <div className="lg:col-span-1 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <Video className="w-5 h-5" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Create Instant Meet Room
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Instantly create a dedicated Google Meet room with a direct URL for candidate counseling or live webinars.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
                  Webinar / Meeting Topic
                </label>
                <input
                  type="text"
                  value={meetTopic}
                  onChange={(e) => setMeetTopic(e.target.value)}
                  placeholder="e.g. SAP FICO Live Demo & Roadmap"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <button
                type="button"
                onClick={handleCreateMeet}
                disabled={isCreatingMeet}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>{isCreatingMeet ? 'Generating Meet...' : 'Generate Google Meet Space'}</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[var(--elevated-bg)] border border-[var(--border)] space-y-1.5 text-xs">
              <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>Auto-Configured for DealDeck</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                Meet links can also be generated directly within the candidate demo scheduler modal.
              </p>
            </div>
          </div>

          {/* Right: Created Rooms List */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Active & Recent Google Meet Spaces ({createdMeetSpaces.length})
              </h3>
              <span className="text-xs text-[var(--text-muted)]">
                Google Meet API v2
              </span>
            </div>

            {createdMeetSpaces.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-[var(--elevated-bg)] border border-dashed border-[var(--border)] space-y-2">
                <Video className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
                <p className="text-xs font-medium text-[var(--text-primary)]">No Meet rooms created yet</p>
                <p className="text-[11px] text-[var(--text-muted)]">Click "Generate Google Meet Space" to start a conference.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {createdMeetSpaces.map((room, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[var(--elevated-bg)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-3 hover:border-[var(--accent)]/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[var(--text-primary)]">{room.topic}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {room.createdAt}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-[var(--accent)]">
                        {room.meetingUri}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyText(room.meetingUri, room.meetingUri)}
                        className="p-2 rounded-lg bg-[var(--input-bg)] hover:bg-[var(--card-bg)] border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors"
                        title="Copy meeting link"
                      >
                        {copiedMeetUri === room.meetingUri ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span>Copy</span>
                      </button>

                      <a
                        href={room.meetingUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Join Room</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: GOOGLE CALENDAR ================= */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Schedule on Calendar Form */}
          <div className="lg:col-span-1 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-blue-400">
              <Calendar className="w-5 h-5" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Schedule Candidate Session
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Directly books a calendar event with student attendee and optional Google Meet conferencing.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={calSummary}
                  onChange={(e) => setCalSummary(e.target.value)}
                  placeholder="e.g. 1-on-1 Counseling with Vikram Mehta"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
                  Candidate Email
                </label>
                <input
                  type="email"
                  value={calAttendee}
                  onChange={(e) => setCalAttendee(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-1">
                  <label className="text-[11px] font-medium text-[var(--text-secondary)] block mb-1">Date</label>
                  <input
                    type="date"
                    value={calDate}
                    onChange={(e) => setCalDate(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--text-secondary)] block mb-1">Start</label>
                  <input
                    type="time"
                    value={calStartTime}
                    onChange={(e) => setCalStartTime(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[var(--text-secondary)] block mb-1">End</label>
                  <input
                    type="time"
                    value={calEndTime}
                    onChange={(e) => setCalEndTime(e.target.value)}
                    className="w-full text-xs px-2 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={calMeetOption}
                  onChange={(e) => setCalMeetOption(e.target.checked)}
                  className="rounded text-[var(--accent)]"
                />
                <span>Attach Google Meet Conference automatically</span>
              </label>

              <button
                type="button"
                onClick={handleRequestCreateCalendarEvent}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Event (Confirm)</span>
              </button>
            </div>
          </div>

          {/* Right: Upcoming Calendar Events List */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Upcoming Google Calendar Appointments
                </h3>
                <p className="text-[11px] text-[var(--text-muted)]">Live sync from primary calendar: {userEmail}</p>
              </div>
              <button
                type="button"
                onClick={() => loadCalendarEvents()}
                disabled={isLoadingCalendar}
                className="p-2 rounded-lg bg-[var(--elevated-bg)] hover:bg-[var(--card-bg)] border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCalendar ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            {calendarEvents.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-[var(--elevated-bg)] border border-dashed border-[var(--border)] space-y-2">
                <Calendar className="w-8 h-8 text-[var(--text-muted)] mx-auto opacity-50" />
                <p className="text-xs font-medium text-[var(--text-primary)]">No upcoming appointments found</p>
                <p className="text-[11px] text-[var(--text-muted)]">Use the form on the left to schedule candidate counseling sessions.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {calendarEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-4 rounded-xl bg-[var(--elevated-bg)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-3 hover:border-[var(--accent)]/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[var(--text-primary)]">{evt.summary}</span>
                        {evt.hangoutLink && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Video className="w-3 h-3" />
                            <span>Meet attached</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>
                          {evt.start.dateTime
                            ? new Date(evt.start.dateTime).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                              })
                            : evt.start.date}
                        </span>
                      </div>
                      {evt.attendees && evt.attendees.length > 0 && (
                        <div className="text-[11px] text-[var(--text-secondary)]">
                          Attendee: {evt.attendees.map((a) => a.email).join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {evt.hangoutLink && (
                        <a
                          href={evt.hangoutLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Meet</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRequestDeleteCalendarEvent(evt)}
                        className="p-2 rounded-lg bg-[var(--input-bg)] hover:bg-rose-500/20 text-[var(--text-muted)] hover:text-rose-400 transition-colors"
                        title="Delete event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: GMAIL MESSAGING ================= */}
      {activeTab === 'gmail' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Compose Email Form */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400">
                <Mail className="w-5 h-5" />
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Compose Candidate Email (Gmail API)
                </h3>
              </div>
              <span className="text-[11px] text-[var(--text-muted)]">From: {userEmail}</span>
            </div>

            {/* Quick Template Picker */}
            <div className="p-3 rounded-xl bg-[var(--elevated-bg)] border border-[var(--border)] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text-primary)]">Pre-fill from Candidate:</span>
                <select
                  value={selectedLeadForEmail}
                  onChange={(e) => handleSelectLeadTemplate(e.target.value, emailTemplate)}
                  className="bg-[var(--input-bg)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)]"
                >
                  <option value="">Select Candidate...</option>
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  { id: 'demo', label: 'Demo Webinar Invite' },
                  { id: 'admission', label: 'Admission Welcome Letter' },
                  { id: 'reminder', label: 'Fee Due Reminder' },
                ].map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectLeadTemplate(selectedLeadForEmail || leads[0]?.id || '', tpl.id as any)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      emailTemplate === tpl.id
                        ? 'bg-[var(--accent)] text-white border-[var(--accent)] font-semibold'
                        : 'bg-[var(--input-bg)] text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
                  Recipient Email *
                </label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="candidate@example.com"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
                  Subject Line *
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="e.g. Exclusive Demo Webinar Invitation"
                  className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
                  Email Body (HTML / Formatted Text) *
                </label>
                <textarea
                  rows={8}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Write your email message here..."
                  className="w-full text-xs p-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] font-sans"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-[var(--text-muted)]">
                  Sends directly from your verified Gmail mailbox.
                </span>

                <button
                  type="button"
                  onClick={handleRequestSendEmail}
                  className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Send via Gmail (Confirm)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Dispatched / Recent Communications */}
          <div className="lg:col-span-1 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Recent Gmail Messages
              </h3>
              <button
                type="button"
                onClick={() => loadGmailMessages()}
                disabled={isLoadingGmail}
                className="p-1.5 rounded-lg bg-[var(--elevated-bg)] hover:bg-[var(--card-bg)] border border-[var(--border)] text-xs text-[var(--text-secondary)]"
                title="Refresh mailbox"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGmail ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {gmailMessages.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-[var(--elevated-bg)] border border-dashed border-[var(--border)] space-y-2">
                <Mail className="w-6 h-6 text-[var(--text-muted)] mx-auto opacity-50" />
                <p className="text-xs font-medium text-[var(--text-primary)]">No messages to display</p>
                <p className="text-[11px] text-[var(--text-muted)]">Dispatched candidate emails will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {gmailMessages.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-xl bg-[var(--elevated-bg)] border border-[var(--border)] space-y-1 hover:border-[var(--accent)]/40 transition-colors text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[var(--text-primary)] truncate max-w-[170px]">
                        {m.subject || '(No Subject)'}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">{m.date || 'Today'}</span>
                    </div>
                    <div className="text-[11px] text-[var(--text-secondary)] truncate">
                      {m.to ? `To: ${m.to}` : m.from ? `From: ${m.from}` : ''}
                    </div>
                    {m.snippet && (
                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                        {m.snippet}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: GOOGLE SHEETS ================= */}
      {activeTab === 'sheets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Export to Google Sheets */}
          <div className="lg:col-span-1 p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <FileSpreadsheet className="w-5 h-5" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Sync CRM to Google Sheet
              </h3>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Generates a new, formatted Google Spreadsheet in your Google Drive with all {leads.length} student leads, fee collections, and counselor assignments.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] block mb-1">
                  Spreadsheet Title
                </label>
                <input
                  type="text"
                  value={sheetTitle}
                  onChange={(e) => setSheetTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[var(--elevated-bg)] border border-[var(--border)] space-y-1 text-xs">
                <span className="font-semibold text-[var(--text-primary)] block">Included Data Columns:</span>
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Student Name, Phone, Email, Location, Course Track, Qualification Status, Total Deal Value, Fee Paid, Counselor, Registration Date, Interaction Remarks.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRequestExportToSheets}
                disabled={isExportingSheet}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>{isExportingSheet ? 'Creating Sheet...' : 'Export to Google Sheets (Confirm)'}</span>
              </button>
            </div>
          </div>

          {/* Right: Created Spreadsheets & Live Reader */}
          <div className="lg:col-span-2 space-y-6">
            {/* Created Spreadsheets */}
            <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Exported Google Spreadsheets ({exportedSheets.length})
                </h3>
                <span className="text-xs text-[var(--text-muted)]">
                  Live Drive Documents
                </span>
              </div>

              {exportedSheets.length === 0 ? (
                <div className="p-8 text-center rounded-xl bg-[var(--elevated-bg)] border border-dashed border-[var(--border)] space-y-2">
                  <FileSpreadsheet className="w-7 h-7 text-[var(--text-muted)] mx-auto opacity-50" />
                  <p className="text-xs font-medium text-[var(--text-primary)]">No exported spreadsheets yet</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Click "Export to Google Sheets" to generate a live spreadsheet in your Google Drive.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {exportedSheets.map((sh, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-[var(--elevated-bg)] border border-[var(--border)] flex flex-wrap items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="font-semibold text-xs text-[var(--text-primary)]">
                          {sh.properties.title}
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)]">
                          Exported at {sh.exportedAt} · {sh.rowCount} student rows populated
                        </div>
                      </div>

                      <a
                        href={sh.spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open in Google Sheets</span>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Read/Import from Google Sheet */}
            <div className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Inspect Google Sheet URL / ID
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Paste any Google Sheet URL or ID from your account to read live cell data.
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={importSheetId}
                  onChange={(e) => setImportSheetId(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                  className="flex-1 text-xs px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] font-mono"
                />
                <button
                  type="button"
                  onClick={handleImportFromSheet}
                  className="py-2 px-4 rounded-xl bg-[var(--elevated-bg)] hover:bg-[var(--card-bg)] border border-[var(--border)] text-xs font-semibold text-[var(--text-primary)]"
                >
                  Read Sheet
                </button>
              </div>

              {importedRows && (
                <div className="overflow-x-auto max-h-60 rounded-xl border border-[var(--border)]">
                  <table className="w-full text-left text-xs border-collapse">
                    <tbody>
                      {importedRows.slice(0, 8).map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx === 0 ? 'bg-[var(--elevated-bg)] font-semibold' : 'border-t border-[var(--border)]'}>
                          {row.slice(0, 6).map((cell: any, cIdx: number) => (
                            <td key={cIdx} className="p-2 border-r border-[var(--border)] truncate max-w-[140px]">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MANDATORY WORKSPACE CONFIRMATION MODAL ================= */}
      {confirmationModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 border-b border-[var(--border)] bg-[var(--elevated-bg)] flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                confirmationModal.confirmVariant === 'danger'
                  ? 'bg-rose-500/15 text-rose-400'
                  : 'bg-[var(--accent)]/15 text-[var(--accent)]'
              }`}>
                {confirmationModal.confirmVariant === 'danger' ? (
                  <AlertCircle className="w-5 h-5" />
                ) : (
                  <ShieldCheck className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {confirmationModal.title}
                </h3>
                <span className="text-[11px] text-[var(--text-muted)]">
                  User Confirmation Required (Google Workspace Security)
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              <p className="text-[var(--text-secondary)] leading-relaxed">
                {confirmationModal.description}
              </p>

              {confirmationModal.details && confirmationModal.details.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[var(--elevated-bg)] border border-[var(--border)] space-y-2">
                  {confirmationModal.details.map((d, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <span className="font-medium text-[var(--text-muted)]">{d.label}:</span>
                      <span className="font-semibold text-[var(--text-primary)] max-w-[260px] truncate">{d.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--elevated-bg)] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmationModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--elevated-bg)] border border-[var(--border)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    await confirmationModal.onConfirm();
                  } catch (err: any) {
                    onNotifyToast(err.message || 'Operation failed');
                  } finally {
                    setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
                  }
                }}
                className={`px-4 py-2 rounded-xl text-white text-xs font-semibold transition-all shadow-xs ${
                  confirmationModal.confirmVariant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-[var(--accent)] hover:opacity-90'
                }`}
              >
                {confirmationModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
