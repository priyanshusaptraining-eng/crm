/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  User, 
  Lead, 
  SuperAdminNotification, 
  CallStatus, 
  NavItemConfig, 
  FontSizeOption, 
  NoteHistoryItem,
  TargetConfig,
  ThemeId,
  DPRRecord,
  DPRPermissionConfig,
  AuditLogItem,
  DPROcrMetrics
} from './types/crm';
import { 
  initialUsers, 
  initialLeads, 
  initialNotifications, 
  initialNavItems,
  initialDPRRecords,
  initialDPRPermissions,
  initialAuditLogs
} from './data/mockData';
import { filterLeadsForUser, calculateLeadMetrics } from './utils/crmLogic';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { LeadTable } from './components/LeadTable';
import { LeadProfileDrawer } from './components/LeadProfileDrawer';
import { GoogleMeetDemoModal } from './components/GoogleMeetDemoModal';
import { AdmissionPaymentModal } from './components/AdmissionPaymentModal';
import { AddLeadModal } from './components/AddLeadModal';
import { EditLeadModal } from './components/EditLeadModal';
import { AppearanceModal } from './components/AppearanceModal';
import { LoginPage } from './components/LoginPage';
import { DprUploadModal } from './components/DprUploadModal';
import { DprReminderModal } from './components/DprReminderModal';
import { BottomNav } from './components/BottomNav';
import { CallOutcomeModal } from './components/CallOutcomeModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { getTelUri } from './utils/phoneUtils';
import { applyThemeToDocument, AVAILABLE_THEMES } from './data/themes';

// Dedicated Views
import { DashboardView } from './components/views/DashboardView';
import { DailyDprView } from './components/views/DailyDprView';
import { MonthlyReportView } from './components/views/MonthlyReportView';
import { DprAccessControlView } from './components/views/DprAccessControlView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { LeadPipelineView } from './components/views/LeadPipelineView';
import { FollowupsActivitiesView } from './components/views/FollowupsActivitiesView';
import { DemosWebinarsView } from './components/views/DemosWebinarsView';
import { AdmissionsJoinedView } from './components/views/AdmissionsJoinedView';
import { FeeTransactionsView } from './components/views/FeeTransactionsView';
import { PendingDueDatesView } from './components/views/PendingDueDatesView';
import { ConversionAnalyticsView } from './components/views/ConversionAnalyticsView';
import { CounselorPerformanceView } from './components/views/CounselorPerformanceView';
import { TargetsGoalsView } from './components/views/TargetsGoalsView';
import { TeamPermissionsView } from './components/views/TeamPermissionsView';
import { AdminSettingsView } from './components/views/AdminSettingsView';
import { GoogleWorkspaceView } from './components/views/GoogleWorkspaceView';
import { BulkLeadUploadView } from './components/views/BulkLeadUploadView';

import { Check } from 'lucide-react';

export default function App() {
  // Authentication & Session
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUserId, setCurrentUserId] = useState<string>(initialUsers[0].id);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Application Data State with multi-layer persistence (localStorage + Server DB)
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem('corporateacademy_leads');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse leads from localStorage', e);
    }
    return initialLeads;
  });

  // Keep localStorage in sync on every lead mutation
  useEffect(() => {
    try {
      localStorage.setItem('corporateacademy_leads', JSON.stringify(leads));
    } catch (e) {
      console.warn('Failed to save leads to localStorage', e);
    }
  }, [leads]);

  // Sync with backend /api/leads on mount
  useEffect(() => {
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.leads) && data.leads.length > 0) {
          setLeads(data.leads);
        } else if (leads.length > 0) {
          fetch('/api/leads/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leads, duplicateAction: 'import_all' }),
          }).catch(() => {});
        }
      })
      .catch((err) => {
        console.warn('Backend leads sync note:', err);
      });
  }, []);

  const [notifications, setNotifications] = useState<SuperAdminNotification[]>(initialNotifications);
  const [navItems, setNavItems] = useState<NavItemConfig[]>(initialNavItems);
  const [activeNav, setActiveNav] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<FontSizeOption>(14);

  // Dynamic Targets & Goals State
  const [targets, setTargets] = useState<TargetConfig>({
    dailyCalls: 40,
    monthlyAdmissions: 20,
    monthlyRevenue: 300000,
    period: 'monthly',
    history: [
      {
        id: 'tgt_init',
        timestamp: '2026-11-01 09:00',
        modifiedBy: 'Priyanshu (Admin)',
        admissionTarget: 20,
        revenueTarget: 300000,
        period: 'monthly',
      },
    ],
  });

  // Modals & Drawer State
  const [selectedProfileLead, setSelectedProfileLead] = useState<Lead | null>(null);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  const [selectedDemoLead, setSelectedDemoLead] = useState<Lead | null>(null);
  const [demoInitialDate, setDemoInitialDate] = useState<string | undefined>(undefined);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const [selectedAdmissionLead, setSelectedAdmissionLead] = useState<Lead | null>(null);
  const [isAdmissionModalOpen, setIsAdmissionModalOpen] = useState(false);

  const [selectedEditLead, setSelectedEditLead] = useState<Lead | null>(null);
  const [isEditLeadModalOpen, setIsEditLeadModalOpen] = useState(false);

  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isAppearanceModalOpen, setIsAppearanceModalOpen] = useState(false);
  const [currentThemeId, setCurrentThemeId] = useState<ThemeId>('midnight-navy');

  // Mobile Call & WhatsApp Action State
  const [activeCallLead, setActiveCallLead] = useState<Lead | null>(null);
  const [isCallOutcomeOpen, setIsCallOutcomeOpen] = useState<boolean>(false);
  const [activeWhatsAppLead, setActiveWhatsAppLead] = useState<Lead | null>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState<boolean>(false);

  // Enterprise DPR & Compliance State
  const [dprRecords, setDprRecords] = useState<DPRRecord[]>(initialDPRRecords);
  const [dprPermissions, setDprPermissions] = useState<DPRPermissionConfig[]>(initialDPRPermissions);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialAuditLogs);
  const [isDprUploadModalOpen, setIsDprUploadModalOpen] = useState<boolean>(false);
  const [dprUploadDate, setDprUploadDate] = useState<string>('2026-11-08');
  const [isDprReminderOpen, setIsDprReminderOpen] = useState<boolean>(true);
  const [hasDismissedDprReminder, setHasDismissedDprReminder] = useState<boolean>(false);

  // Initialize theme on mount from localStorage
  useEffect(() => {
    const saved = (localStorage.getItem('dealdeck_theme') as ThemeId) || 'midnight-navy';
    const themeExists = AVAILABLE_THEMES.some((t) => t.id === saved);
    const validTheme = themeExists ? saved : 'midnight-navy';
    setCurrentThemeId(validTheme);
    applyThemeToDocument(validTheme);
  }, []);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];
  const isSuperAdmin = currentUser.role === 'super_admin';

  // Leads filtered by user role
  const visibleLeads = filterLeadsForUser(leads, currentUser);

  // Overall metrics calculated with dynamic targets
  const metrics = calculateLeadMetrics(
    isSuperAdmin ? leads : visibleLeads,
    targets.dailyCalls,
    targets.monthlyAdmissions,
    targets.monthlyRevenue
  );

  // Handler: Change theme
  const handleApplyTheme = (themeId: ThemeId) => {
    setCurrentThemeId(themeId);
    applyThemeToDocument(themeId);
    showToast(`Applied theme: ${AVAILABLE_THEMES.find((t) => t.id === themeId)?.name || themeId}`);
  };

  // Handler: Update Admin User ID
  const handleUpdateAdminId = (newId: string) => {
    const oldId = users.find((u) => u.role === 'super_admin')?.id || '';
    setUsers((prev) =>
      prev.map((u) => (u.role === 'super_admin' ? { ...u, id: newId } : u))
    );
    if (currentUserId === oldId) {
      setCurrentUserId(newId);
    }

    const notif: SuperAdminNotification = {
      id: `notif_${Date.now()}`,
      type: 'admin_id_changed',
      title: 'Super Admin User ID Updated',
      message: `Administrator ID changed from "${oldId}" to "${newId}".`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(`Super Admin User ID updated to: ${newId}`);
  };

  // Handler: Open DPR Upload Modal
  const handleOpenDprUpload = (date: string = '2026-11-08') => {
    setDprUploadDate(date);
    setIsDprUploadModalOpen(true);
    setIsDprReminderOpen(false);
  };

  // Handler: Submit & Verify DPR
  const handleDprSubmit = (
    metrics: DPROcrMetrics,
    screenshotUrl?: string,
    notes?: string
  ) => {
    const reportingDate = metrics.reportingDate || dprUploadDate || '2026-11-08';
    const isDeepti = currentUser.id === 'usr_deepti';

    const newRecord: DPRRecord = {
      id: `dpr_${reportingDate.replace(/-/g, '')}_${currentUser.id}`,
      counselorId: currentUser.id,
      counselorName: currentUser.name,
      date: reportingDate,
      submissionTimestamp: new Date().toISOString(),
      status: 'verified',
      screenshotUrl: screenshotUrl || (isDeepti ? '/assets/aistudio/image_2e1bcb19.png' : undefined),
      ocrRawMetrics: metrics,
      confirmedMetrics: metrics,
      isCorrected: false,
      notes: notes || 'Verified daily DPR call log submission via CorporateAcademy OCR.',
    };

    setDprRecords((prev) => {
      const filtered = prev.filter(
        (r) => !(r.date === reportingDate && r.counselorId === currentUser.id)
      );
      return [newRecord, ...filtered];
    });

    // Append to Audit Log
    const newAudit: AuditLogItem = {
      id: `audit_dpr_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'DPR_SUBMISSION',
      module: 'DPR',
      description: `Daily Performance Report verified for ${reportingDate}: ${metrics.totalCalls} calls, ${metrics.totalDuration}.`,
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    setIsDprUploadModalOpen(false);
    setIsDprReminderOpen(false);
    showToast(`DPR verified & recorded for ${reportingDate}! (${metrics.totalCalls} calls)`);
  };

  // Handler: Reassign Lead to Counselor
  const handleReassignLead = (leadId: string, newUserId: string) => {
    const targetUser = users.find((u) => u.id === newUserId);
    if (!targetUser) return;

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const reassignNote: NoteHistoryItem = {
            id: `note_reassign_${Date.now()}`,
            timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
            author: currentUser.name,
            type: 'general',
            text: `Lead reassigned from ${l.assignedUserName} to ${targetUser.name}`,
          };
          return {
            ...l,
            assignedTo: newUserId,
            assignedUserName: targetUser.name,
            notesHistory: [reassignNote, ...(l.notesHistory || [])],
          };
        }
        return l;
      })
    );

    setSelectedProfileLead((prev) =>
      prev && prev.id === leadId
        ? {
            ...prev,
            assignedTo: newUserId,
            assignedUserName: targetUser.name,
          }
        : prev
    );

    const notif: SuperAdminNotification = {
      id: `notif_${Date.now()}`,
      type: 'lead_reassigned',
      title: 'Lead Reassigned',
      message: `${currentUser.name} transferred lead to ${targetUser.name}.`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(`Lead reassigned to ${targetUser.name}!`);
  };

  // Handler: Add Conversation Note to Lead
  const handleAddNoteToLead = (
    leadId: string,
    noteText: string,
    noteType: 'call' | 'whatsapp' | 'meeting' | 'counseling' | 'objection' | 'general'
  ) => {
    const newNote: NoteHistoryItem = {
      id: `note_${Date.now()}`,
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      author: currentUser.name,
      type: noteType,
      text: noteText,
    };

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          return {
            ...l,
            feedback: noteText,
            notesHistory: [newNote, ...(l.notesHistory || [])],
          };
        }
        return l;
      })
    );

    setSelectedProfileLead((prev) =>
      prev && prev.id === leadId
        ? {
            ...prev,
            feedback: noteText,
            notesHistory: [newNote, ...(prev.notesHistory || [])],
          }
        : prev
    );

    showToast('Conversation remark logged successfully!');
  };

  // Handler: Open Demo Scheduler
  const handleOpenDemoScheduler = (lead: Lead, initialDate?: string) => {
    setSelectedDemoLead(lead);
    setDemoInitialDate(initialDate);
    setIsDemoModalOpen(true);
  };

  // Handler: Confirm and Send Google Meet demo schedule
  const handleSendSchedule = (
    leadId: string,
    demoDetails: {
      date: string;
      time: string;
      webinarTopic: string;
      googleMeetLink: string;
      messageText: string;
    }
  ) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const scheduleNote: NoteHistoryItem = {
            id: `note_demo_${Date.now()}`,
            timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
            author: currentUser.name,
            type: 'meeting',
            text: `Webinar scheduled on ${demoDetails.date} at ${demoDetails.time} via Google Meet`,
          };
          return {
            ...l,
            status: 'demo_scheduled' as const,
            demoDetails: {
              ...demoDetails,
              scheduledAt: new Date().toISOString(),
              attended: null,
            },
            notesHistory: [scheduleNote, ...(l.notesHistory || [])],
          };
        }
        return l;
      })
    );

    const targetLead = leads.find((l) => l.id === leadId);
    showToast(`Google Meet demo scheduled for ${targetLead?.name || 'student'}!`);
  };

  // Handler: Save Admission and Payment details
  const handleSaveAdmissionPayment = (
    leadId: string,
    payment: {
      amountPaid: number;
      totalCourseFee: number;
      isRegistrationOnly: boolean;
      remainingAmount: number;
      remainingDueDate: string;
      receiptNumber: string;
    }
  ) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const admissionNote: NoteHistoryItem = {
            id: `note_adm_${Date.now()}`,
            timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
            author: currentUser.name,
            type: 'counseling',
            text: `Admission confirmed! Paid: ₹${payment.amountPaid.toLocaleString('en-IN')}${
              payment.isRegistrationOnly
                ? ` (Token). Balance ₹${payment.remainingAmount.toLocaleString('en-IN')} due on ${payment.remainingDueDate}`
                : ' (Full payment settled)'
            }`,
          };
          return {
            ...l,
            status: 'admission_joined',
            dealValue: payment.totalCourseFee,
            paymentDetails: {
              amountPaid: payment.amountPaid,
              totalCourseFee: payment.totalCourseFee,
              isRegistrationOnly: payment.isRegistrationOnly,
              remainingAmount: payment.remainingAmount,
              remainingDueDate: payment.remainingDueDate,
              receiptNumber: payment.receiptNumber,
              paymentDate: new Date().toISOString().slice(0, 10),
              courseBatch: l.course || 'SAP Master Batch',
              paymentMode: 'UPI',
            },
            notesHistory: [admissionNote, ...(l.notesHistory || [])],
          };
        }
        return l;
      })
    );

    const notif: SuperAdminNotification = {
      id: `notif_${Date.now()}`,
      type: 'admission_joined',
      title: 'New Admission Joined & Tuition Recorded',
      message: `Enrolled student with ₹${payment.amountPaid.toLocaleString('en-IN')} collected.`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast('Student enrollment & tuition recorded successfully!');
  };

  // Handler: Status change
  const handleStatusChange = (leadId: string, newStatus: CallStatus) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const statusNote: NoteHistoryItem = {
            id: `note_status_${Date.now()}`,
            timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
            author: currentUser.name,
            type: 'general',
            text: `Status updated to ${newStatus.replace('_', ' ')}`,
          };
          return {
            ...l,
            status: newStatus,
            notesHistory: [statusNote, ...(l.notesHistory || [])],
          };
        }
        return l;
      })
    );
  };

  // Handler: Log call
  const handleLogCall = (leadId: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const callNote: NoteHistoryItem = {
            id: `note_call_${Date.now()}`,
            timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
            author: currentUser.name,
            type: 'call',
            text: `Outgoing phone call consultation logged by ${currentUser.name}`,
          };
          return {
            ...l,
            callsCount: (l.callsCount || l.callsMade || 0) + 1,
            callsMade: (l.callsMade || l.callsCount || 0) + 1,
            notesHistory: [callNote, ...(l.notesHistory || [])],
          };
        }
        return l;
      })
    );
    showToast('Call logged to candidate record');
  };

  // Handler: 1-Tap Phone Call Initiation
  const handleInitiateCall = (lead: Lead) => {
    const telUri = getTelUri(lead.phone);
    window.location.href = telUri;
    setActiveCallLead(lead);
    setIsCallOutcomeOpen(true);
    showToast(`Calling ${lead.name} (${lead.phone})...`);
  };

  // Handler: Open WhatsApp Preview & Customization Modal
  const handleOpenWhatsAppModal = (lead: Lead) => {
    setActiveWhatsAppLead(lead);
    setIsWhatsAppModalOpen(true);
  };

  // Handler: Save Post-Call Outcome with Note & Next Follow-up
  const handleSaveCallOutcome = (
    leadId: string,
    newStatus: CallStatus,
    noteText: string,
    nextFollowupDate?: string,
    nextFollowupTime?: string,
    callConnected?: boolean
  ) => {
    const timestamp = new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });

    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId) {
          const formattedFollowup = nextFollowupDate
            ? (nextFollowupTime ? `${nextFollowupDate} ${nextFollowupTime}` : nextFollowupDate)
            : l.followUpDate;

          const callOutcomeNote: NoteHistoryItem = {
            id: `note_call_${Date.now()}`,
            timestamp,
            author: currentUser.name,
            type: 'call',
            text: `[Call: ${callConnected ? 'Connected' : 'Not Connected'} -> ${newStatus.replace(/_/g, ' ')}] ${noteText}`,
          };

          return {
            ...l,
            status: newStatus,
            callsCount: (l.callsCount || l.callsMade || 0) + 1,
            callsMade: (l.callsMade || l.callsCount || 0) + 1,
            lastContacted: timestamp,
            followUpDate: nextFollowupDate || l.followUpDate,
            feedback: noteText || l.feedback,
            notesHistory: [callOutcomeNote, ...(l.notesHistory || [])],
          };
        }
        return l;
      })
    );

    // Record in Audit Trail
    const targetLeadName = leads.find((l) => l.id === leadId)?.name || 'Candidate';
    const newAudit: AuditLogItem = {
      id: `audit_call_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorId: currentUser.id,
      actorName: currentUser.name,
      action: 'CALL_LOGGED',
      module: 'LEAD',
      description: `Call outcome recorded for ${targetLeadName}: ${callConnected ? 'Connected' : 'Missed'} -> Status: ${newStatus}.`,
    };
    setAuditLogs((prev) => [newAudit, ...prev]);

    setIsCallOutcomeOpen(false);
    setActiveCallLead(null);
    showToast(`Call outcome & status recorded for ${targetLeadName}!`);
  };

  // Handler: Save lead edit
  const handleSaveLeadEdit = (updatedLead: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
    setSelectedProfileLead((prev) => (prev && prev.id === updatedLead.id ? updatedLead : prev));
    showToast('Candidate record updated successfully!');
  };

  // Handler: Add new lead
  const handleAddNewLead = (data: {
    name: string;
    email: string;
    phone: string;
    location?: string;
    course?: string;
    assignedTo: string;
    dealValue: number;
    isAddedToday: boolean;
    isPendingToday: boolean;
  }) => {
    const counselor = users.find((u) => u.id === data.assignedTo) || currentUser;
    const newLead: Lead = {
      id: `lead_${Date.now()}`,
      name: data.name,
      location: data.location || 'Mumbai, Maharashtra',
      phone: data.phone,
      email: data.email,
      course: data.course || 'SAP FICO Financials',
      source: 'Direct Portal Entry',
      status: 'new',
      feedback: 'Inbound student inquiry registered',
      dealValue: data.dealValue || 28000,
      revenue: 0,
      assignedTo: counselor.id,
      assignedUserName: counselor.name,
      callsCount: 0,
      callsMade: 0,
      isAddedToday: true,
      isPendingToday: true,
      createdAt: new Date().toISOString(),
      notesHistory: [
        {
          id: `note_init_${Date.now()}`,
          timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
          author: currentUser.name,
          type: 'general',
          text: `Inbound candidate record created by ${currentUser.name}`,
        },
      ],
    };

    setLeads((prev) => [newLead, ...prev]);
    showToast(`Added new lead: ${data.name}`);
  };

  // Handler: Toggle demo attendance
  const handleToggleAttendance = (leadId: string, attended: boolean) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id === leadId && l.demoDetails) {
          return {
            ...l,
            demoDetails: {
              ...l.demoDetails,
              attended,
            },
          };
        }
        return l;
      })
    );
  };

  // Handler: Add / Update User
  const handleAddUser = (newUser: User) => {
    setUsers((prev) => [...prev, newUser]);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  // Open candidate profile drawer
  const handleOpenLeadProfile = (lead: Lead) => {
    setSelectedProfileLead(lead);
    setIsProfileDrawerOpen(true);
  };

  // If user is not authenticated, render Login Page
  if (!isAuthenticated) {
    return (
      <LoginPage
        users={users}
        onLogin={(user) => {
          setCurrentUserId(user.id);
          setIsAuthenticated(true);
          showToast(`Welcome back, ${user.name}!`);
        }}
      />
    );
  }

  const activeNavItem = navItems.find((i) => i.id === activeNav);
  const activeNavLabel = activeNavItem ? activeNavItem.label : 'Dashboard';

  return (
    <div className={`min-h-screen w-full bg-[var(--crm-bg)] text-[var(--crm-text)] flex font-sans overflow-hidden font-size-${fontSize}`}>
      
      {/* Full-Screen Edge-to-Edge Layout */}
      <div className="w-full h-screen flex overflow-hidden relative z-10">
        
        {/* Left Navigation Sidebar (Collapsible 218px / 68px) */}
        <Sidebar
          navItems={navItems}
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenAppearance={() => setIsAppearanceModalOpen(true)}
          currentUser={currentUser}
          onSignOut={() => {
            setIsAuthenticated(false);
            showToast('Signed out of DealDeck CRM portal');
          }}
        />

        {/* Main Content Viewport */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[var(--crm-bg)]">
          
          {/* Top Bar with Breadcrumbs, Session Switcher, Appearance Trigger */}
          <TopNav
            title={activeNavLabel}
            currentUser={currentUser}
            allUsers={users}
            onSwitchUser={(id) => {
              setCurrentUserId(id);
              const u = users.find((x) => x.id === id);
              showToast(`Switched active session to: ${u?.name} (${u?.role === 'super_admin' ? 'Super Admin' : 'Counselor'})`);
            }}
            notifications={notifications}
            onOpenNotifications={() => showToast('All notifications are up to date')}
            onOpenAdminIdModal={() => setActiveNav('settings')}
            onOpenPermissionsModal={() => setActiveNav('permissions')}
            onOpenAppearance={() => setIsAppearanceModalOpen(true)}
            onNavigateWorkspace={() => setActiveNav('workspace')}
            onSignOut={() => {
              setIsAuthenticated(false);
              setIsAuthenticated(false);
              showToast('Signed out of CorporateAcademy CRM');
            }}
          />

          {/* View Container with bottom safe-area spacing for mobile bottom bar */}
          <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-7 pb-24 md:pb-8">
            <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
              
              {/* 1. Dashboard View (Executive Monitoring) */}
              {activeNav === 'dashboard' && (
                <DashboardView
                  leads={leads}
                  currentUser={currentUser}
                  allUsers={users}
                  metrics={metrics}
                  targets={targets}
                  dprRecords={dprRecords}
                  onNavigateToTab={setActiveNav}
                  onOpenLeadProfile={handleOpenLeadProfile}
                  onOpenDemoScheduler={(lead) => handleOpenDemoScheduler(lead)}
                  onOpenDprUpload={() => handleOpenDprUpload('2026-11-08')}
                  onInitiateCall={handleInitiateCall}
                  onOpenWhatsAppModal={handleOpenWhatsAppModal}
                  onNotifyToast={showToast}
                />
              )}

              {/* 1b. Daily DPR Module */}
              {activeNav === 'dpr' && (
                <DailyDprView
                  currentUser={currentUser}
                  allUsers={users}
                  dprRecords={dprRecords}
                  onOpenUploadModal={(date) => handleOpenDprUpload(date || '2026-11-08')}
                  onNotifyToast={showToast}
                />
              )}

              {/* 1c. Monthly DPR Report Module */}
              {activeNav === 'monthly_report' && (
                <MonthlyReportView
                  currentUser={currentUser}
                  allUsers={users}
                  dprRecords={dprRecords}
                  onOpenUploadModal={(date) => handleOpenDprUpload(date || '2026-11-08')}
                  onNotifyToast={showToast}
                />
              )}

              {/* 2. Leads Management View (10-column table on desktop + clean cards on mobile) */}
              {activeNav === 'leads' && (
                <LeadTable
                  leads={visibleLeads}
                  currentUser={currentUser}
                  allUsers={users}
                  onOpenLeadProfile={handleOpenLeadProfile}
                  onOpenEditModal={(lead) => {
                    setSelectedEditLead(lead);
                    setIsEditLeadModalOpen(true);
                  }}
                  onOpenDemoScheduler={(lead) => handleOpenDemoScheduler(lead)}
                  onOpenAdmissionModal={(lead) => {
                    setSelectedAdmissionLead(lead);
                    setIsAdmissionModalOpen(true);
                  }}
                  onReassignCounselor={handleReassignLead}
                  onStatusChange={handleStatusChange}
                  onAddNewLead={() => setIsAddLeadModalOpen(true)}
                  onOpenBulkImport={() => setActiveNav('bulk_import')}
                  onLogCall={handleLogCall}
                  onInitiateCall={handleInitiateCall}
                  onOpenWhatsAppModal={handleOpenWhatsAppModal}
                  onNotifyToast={showToast}
                />
              )}

              {/* 2b. Real Excel & Google Sheets Bulk Lead Upload View (500+ records) */}
              {activeNav === 'bulk_import' && (
                <BulkLeadUploadView
                  currentUser={currentUser}
                  allUsers={users}
                  existingLeads={leads}
                  onImportSuccess={(newlyImported, summary) => {
                    setLeads((prev) => [...newlyImported, ...prev]);

                    const audit: AuditLogItem = {
                      id: `audit_import_${Date.now()}`,
                      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
                      actorId: currentUser.id,
                      actorName: currentUser.name,
                      action: 'BULK_IMPORT',
                      module: 'LEAD',
                      description: `Bulk imported ${summary.importedCount} leads from Excel for ${summary.targetCounselorName} (${summary.duplicateCount} duplicates skipped, ${summary.invalidCount} invalid).`,
                    };
                    setAuditLogs((prev) => [audit, ...prev]);

                    showToast(`Bulk imported ${summary.importedCount} leads for ${summary.targetCounselorName}!`);
                  }}
                  onNavigateToLeads={() => {
                    setActiveNav('leads');
                  }}
                  onNotifyToast={showToast}
                />
              )}

              {/* 2c. Google Workspace Hub View */}
              {activeNav === 'workspace' && (
                <GoogleWorkspaceView
                  leads={leads}
                  currentUser={currentUser}
                  onNotifyToast={showToast}
                />
              )}

              {/* 3. Lead Pipeline View (Kanban) */}
              {activeNav === 'pipeline' && (
                <LeadPipelineView
                  leads={visibleLeads}
                  currentUser={currentUser}
                  allUsers={users}
                  onOpenClientDetail={handleOpenLeadProfile}
                  onOpenDemoScheduler={(lead) => handleOpenDemoScheduler(lead)}
                  onOpenAdmissionModal={(lead) => {
                    setSelectedAdmissionLead(lead);
                    setIsAdmissionModalOpen(true);
                  }}
                  onStatusChange={handleStatusChange}
                  onAddNewLead={() => setIsAddLeadModalOpen(true)}
                  onNotifyToast={showToast}
                />
              )}

              {/* 4. Demos & Webinars View */}
              {activeNav === 'demos' && (
                <DemosWebinarsView
                  leads={leads}
                  currentUser={currentUser}
                  onOpenDemoModal={(lead) => handleOpenDemoScheduler(lead)}
                  onToggleAttendance={handleToggleAttendance}
                  onNotifyToast={showToast}
                />
              )}

              {/* 5. Follow-ups & Activities Queue */}
              {activeNav === 'followups' && (
                <FollowupsActivitiesView
                  leads={visibleLeads}
                  currentUser={currentUser}
                  allUsers={users}
                  onOpenClientDetail={handleOpenLeadProfile}
                  onOpenDemoScheduler={(lead) => handleOpenDemoScheduler(lead)}
                  onLogCall={handleLogCall}
                  onInitiateCall={handleInitiateCall}
                  onOpenWhatsAppModal={handleOpenWhatsAppModal}
                  onNotifyToast={showToast}
                />
              )}

              {/* 6. Admissions Tracker & Tuition Ledger */}
              {activeNav === 'admissions' && (
                <AdmissionsJoinedView
                  leads={leads}
                  currentUser={currentUser}
                  onOpenPaymentModal={(lead) => {
                    setSelectedAdmissionLead(lead);
                    setIsAdmissionModalOpen(true);
                  }}
                />
              )}

              {/* 7. Fee Transactions Ledger */}
              {activeNav === 'transactions' && (
                <FeeTransactionsView
                  leads={leads}
                  currentUser={currentUser}
                />
              )}

              {/* 8. Pending Due Dates Tracker */}
              {(activeNav === 'installments' || activeNav === 'dues') && (
                <PendingDueDatesView
                  leads={leads}
                  currentUser={currentUser}
                  onOpenPaymentModal={(lead) => {
                    setSelectedAdmissionLead(lead);
                    setIsAdmissionModalOpen(true);
                  }}
                  onNotifyToast={showToast}
                />
              )}

              {/* 9. Conversion & Loss Analytics */}
              {activeNav === 'analytics' && (
                <ConversionAnalyticsView
                  leads={visibleLeads}
                  currentUser={currentUser}
                  allUsers={users}
                  targets={targets}
                  onOpenTargetModal={() => setActiveNav('targets')}
                  onReassignLead={handleReassignLead}
                  onOpenClientDetail={handleOpenLeadProfile}
                  onNotifyToast={showToast}
                />
              )}

              {/* 10. Counselor Performance & Leaderboard */}
              {activeNav === 'counselors' && (
                <CounselorPerformanceView
                  leads={leads}
                  currentUser={currentUser}
                  allUsers={users}
                  targets={targets}
                  onOpenTargetModal={() => setActiveNav('targets')}
                />
              )}

              {/* 11. Targets & Goals Configuration View */}
              {activeNav === 'targets' && (
                <TargetsGoalsView
                  targets={targets}
                  metrics={metrics}
                  currentUser={currentUser}
                  onSaveTargets={(newTargets) => {
                    setTargets(newTargets);
                    showToast(`Updated performance targets for ${newTargets.period} cycle!`);
                  }}
                  onNotifyToast={showToast}
                />
              )}

              {/* 11b. DPR Access Control */}
              {activeNav === 'dpr_access' && (
                <DprAccessControlView
                  currentUser={currentUser}
                  allUsers={users}
                  permissions={dprPermissions}
                  onUpdatePermissions={(newP) => {
                    setDprPermissions(newP);
                    const audit: AuditLogItem = {
                      id: `audit_perm_${Date.now()}`,
                      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
                      actorId: currentUser.id,
                      actorName: currentUser.name,
                      action: 'DPR_PERMISSIONS_UPDATE',
                      module: 'DPR',
                      description: 'Updated delegated DPR access permissions across counselors.',
                    };
                    setAuditLogs((prev) => [audit, ...prev]);
                  }}
                  onNotifyToast={showToast}
                />
              )}

              {/* 11c. Audit Logs & Activity Trail */}
              {activeNav === 'audit_logs' && (
                <AuditLogsView
                  currentUser={currentUser}
                  auditLogs={auditLogs}
                  onNotifyToast={showToast}
                />
              )}

              {/* 12. Team Credentials & Permissions */}
              {activeNav === 'permissions' && (
                <TeamPermissionsView
                  users={users}
                  currentUser={currentUser}
                  onAddUser={handleAddUser}
                  onUpdateUser={handleUpdateUser}
                  onNotifyToast={showToast}
                />
              )}

              {/* 13. Admin Settings */}
              {activeNav === 'settings' && (
                <AdminSettingsView
                  currentUser={currentUser}
                  dailyTarget={targets.dailyCalls}
                  fontSize={fontSize}
                  onChangeAdminId={handleUpdateAdminId}
                  onChangeDailyTarget={(val) => setTargets((prev) => ({ ...prev, dailyCalls: val }))}
                  onChangeFontSize={setFontSize}
                  onNotifyToast={showToast}
                />
              )}

            </div>
          </main>
        </div>

      </div>

      {/* Slide-In Candidate Profile Drawer */}
      <LeadProfileDrawer
        lead={selectedProfileLead}
        isOpen={isProfileDrawerOpen}
        onClose={() => {
          setIsProfileDrawerOpen(false);
          setSelectedProfileLead(null);
        }}
        allUsers={users}
        currentUser={currentUser}
        onReassignCounselor={handleReassignLead}
        onAddNote={handleAddNoteToLead}
        onOpenDemoScheduler={(lead) => handleOpenDemoScheduler(lead)}
        onOpenAdmissionModal={(lead) => {
          setSelectedAdmissionLead(lead);
          setIsAdmissionModalOpen(true);
        }}
        onInitiateCall={handleInitiateCall}
        onOpenWhatsAppModal={handleOpenWhatsAppModal}
        onNotifyToast={showToast}
      />

      {/* Edit Lead Modal */}
      <EditLeadModal
        lead={selectedEditLead}
        isOpen={isEditLeadModalOpen}
        onClose={() => {
          setIsEditLeadModalOpen(false);
          setSelectedEditLead(null);
        }}
        users={users}
        onSaveLead={handleSaveLeadEdit}
      />

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        users={users}
        onAddLead={handleAddNewLead}
      />

      {/* Google Meet Demo Modal */}
      <GoogleMeetDemoModal
        lead={selectedDemoLead}
        isOpen={isDemoModalOpen}
        initialDate={demoInitialDate}
        onClose={() => {
          setIsDemoModalOpen(false);
          setSelectedDemoLead(null);
          setDemoInitialDate(undefined);
        }}
        onSendSchedule={handleSendSchedule}
      />

      {/* Admission & Fee Payment Modal */}
      <AdmissionPaymentModal
        lead={selectedAdmissionLead}
        isOpen={isAdmissionModalOpen}
        onClose={() => {
          setIsAdmissionModalOpen(false);
          setSelectedAdmissionLead(null);
        }}
        onSaveAdmissionPayment={handleSaveAdmissionPayment}
      />

      {/* Appearance / Theme Selector Drawer */}
      <AppearanceModal
        isOpen={isAppearanceModalOpen}
        onClose={() => setIsAppearanceModalOpen(false)}
        currentTheme={currentThemeId}
        onSaveTheme={handleApplyTheme}
      />

      {/* DPR Missing Reminder Pop-up for Counselor Deepti */}
      {currentUser.role === 'counselor' && !hasDismissedDprReminder && isDprReminderOpen && (
        <DprReminderModal
          isOpen={true}
          currentUser={currentUser}
          todayDate="2026-11-08"
          todayDprRecord={dprRecords.find((r) => r.date === '2026-11-08' && r.counselorId === currentUser.id)}
          onOpenUpload={() => {
            setIsDprReminderOpen(false);
            setIsDprUploadModalOpen(true);
          }}
          onClose={() => {
            setHasDismissedDprReminder(true);
            setIsDprReminderOpen(false);
          }}
        />
      )}

      {/* Daily DPR Screenshot Upload & OCR Extraction Modal */}
      <DprUploadModal
        isOpen={isDprUploadModalOpen}
        onClose={() => setIsDprUploadModalOpen(false)}
        currentUser={currentUser}
        initialDate={dprUploadDate}
        onSaveDPR={(rec) => {
          setDprRecords((prev) => [
            rec,
            ...prev.filter((r) => !(r.date === rec.date && r.counselorId === rec.counselorId)),
          ]);
          const newAudit: AuditLogItem = {
            id: `audit_dpr_${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            actorId: currentUser.id,
            actorName: currentUser.name,
            action: 'DPR_SUBMISSION',
            module: 'DPR',
            description: `Daily Performance Report verified for ${rec.date}: ${rec.confirmedMetrics.totalCalls} calls (${rec.confirmedMetrics.totalDuration}).`,
          };
          setAuditLogs((prev) => [newAudit, ...prev]);
          setIsDprUploadModalOpen(false);
          setIsDprReminderOpen(false);
          showToast(`DPR successfully recorded & verified for ${rec.date}!`);
        }}
        onNotifyToast={showToast}
      />

      {/* Mobile Safe-Area Bottom Navigation Bar (md:hidden) */}
      <BottomNav
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        currentUser={currentUser}
        onOpenAppearance={() => setIsAppearanceModalOpen(true)}
        onSignOut={() => {
          setIsAuthenticated(false);
          showToast('Signed out of CorporateAcademy CRM');
        }}
        navItems={navItems}
        leadsCount={visibleLeads.length}
        pendingFollowupsCount={visibleLeads.filter(l => l.status === 'call_later' || l.followUpDate === 'Today').length}
        isDprMissing={!dprRecords.some(r => r.date === '2026-11-08' && r.counselorId === currentUser.id)}
      />

      {/* Post-Call Outcome & Activity Logger Modal */}
      <CallOutcomeModal
        isOpen={isCallOutcomeOpen}
        onClose={() => {
          setIsCallOutcomeOpen(false);
          setActiveCallLead(null);
        }}
        lead={activeCallLead}
        currentUser={currentUser}
        onSaveOutcome={handleSaveCallOutcome}
        onNotifyToast={showToast}
      />

      {/* WhatsApp Message Preview, Customization & Quick-Launch Modal */}
      <WhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => {
          setIsWhatsAppModalOpen(false);
          setActiveWhatsAppLead(null);
        }}
        lead={activeWhatsAppLead}
        currentUser={currentUser}
        onNotifyToast={showToast}
      />

      {/* User Action Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 bg-[var(--crm-elevated)] text-[var(--crm-text)] text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 border border-[var(--crm-border)] animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
