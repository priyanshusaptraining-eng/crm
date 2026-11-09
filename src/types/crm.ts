export type UserRole = 'super_admin' | 'counselor' | 'sales_user';
export type UserStatus = 'active' | 'deactivated';

export interface User {
  id: string; // User ID
  username?: string; // Login username / ID
  password?: string; // Login password
  name: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  canEdit: boolean;
  avatarColor: string;
  avatarUrl?: string;
  designation?: string;
  dprReminderTime?: string; // e.g. "18:00"
  dprGracePeriodMinutes?: number;
  monthlyTarget?: {
    admissions: number;
    revenue: number;
    dailyCalls?: number;
  };
}

export type CallStatus = 
  | 'new'
  | 'new_lead'
  | 'interested'
  | 'hot'
  | 'warm'
  | 'cold'
  | 'contacted'
  | 'followup'
  | 'call_later'
  | 'demo_scheduled'
  | 'npu' // Not Picking Up
  | 'ni'  // Not Interested
  | 'not_interested'
  | 'admission_joined'
  | 'converted'
  | 'lost';

export interface DPROcrMetrics {
  totalCalls: number;
  incomingCalls: number;
  outgoingCalls: number;
  missedCalls: number;
  rejectedCalls: number;
  neverAttendedCalls: number;
  npuCalls: number; // Not Pickup by Client
  uniqueCalls: number;
  totalDuration: string; // e.g. "14m 58s"
  incomingDuration: string; // e.g. "11m 28s"
  outgoingDuration: string; // e.g. "3m 30s"
  reportingDate: string; // YYYY-MM-DD
  confidenceScore?: number;
  extractedAt?: string;
}

export interface DPRCorrectionItem {
  id: string;
  timestamp: string;
  modifiedBy: string;
  reason: string;
  previousMetrics: DPROcrMetrics;
  updatedMetrics: DPROcrMetrics;
}

export type LeadStatus = 
  | 'New Lead' 
  | 'Demo Scheduled' 
  | 'Demo Attended' 
  | 'Fee Due' 
  | 'Admitted' 
  | 'Lost' 
  | 'NPU' 
  | string;

export interface DPRRecord {
  id: string;
  counselorId: string;
  counselorName: string;
  date: string; // YYYY-MM-DD
  submissionTimestamp: string;
  lastUpdatedTimestamp?: string;
  status: 'submitted' | 'verified' | 'corrected' | 'missing' | 'pending_verification';
  screenshotUrl?: string;
  ocrRawMetrics: DPROcrMetrics;
  confirmedMetrics: DPROcrMetrics;
  isCorrected: boolean;
  correctionHistory?: DPRCorrectionItem[];
  notes?: string;
}

export interface DPRPermissionConfig {
  userId: string;
  userName: string;
  accessLevel: 'no_access' | 'own_dpr' | 'selected_counselors' | 'all_counselors' | 'export_dpr';
  permittedCounselorIds?: string[];
  canViewDaily: boolean;
  canViewMonthly: boolean;
  canViewScreenshots: boolean;
  canViewOcrData: boolean;
  canExport: boolean;
  grantedBy: string;
  grantedAt: string;
}

export interface FilterCondition {
  id: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'is_empty' | 'is_not_empty' | 'greater_than' | 'less_than' | 'between' | 'before' | 'after' | 'in_list';
  value: string;
  valueTo?: string; // For 'between' operator
}

export interface AdvancedFilterQuery {
  search?: string;
  status?: (LeadStatus | string)[];
  counselorId?: string;
  datePreset?: 'all' | 'today' | 'yesterday' | 'last_7_days' | 'last_30_days' | 'this_week' | 'this_month' | 'prev_month' | 'custom';
  startDate?: string;
  endDate?: string;
  conditions: FilterCondition[];
  conditionLogic?: 'AND' | 'OR';
  conjunction?: 'AND' | 'OR';
  notInterestedScope?: 'all' | 'my' | 'none';
  candidateName?: string;
  statusList?: string[];
  counselorList?: string[];
  course?: string;
  source?: string;
  location?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: string;
  module: 'USER' | 'LEAD' | 'TARGET' | 'DPR' | 'PERMISSION' | 'AUTH' | 'SYSTEM';
  description: string;
  previousValue?: any;
  newValue?: any;
}

export interface PaymentDetails {
  amountPaid: number;
  totalCourseFee: number;
  isRegistrationOnly: boolean;
  remainingAmount: number;
  remainingDueDate: string;
  nextDueDate?: string;
  receiptNumber?: string;
  paymentDate?: string;
  paymentMode?: 'UPI' | 'NetBanking' | 'Card' | 'Cash';
  transactionReference?: string;
  courseBatch?: string;
  courseEnrolled?: string;
}

export interface DemoDetails {
  date: string;
  time: string;
  webinarTopic: string;
  googleMeetLink: string;
  scheduledAt?: string;
  attended: boolean | null;
  messageText?: string;
}

export interface NoteHistoryItem {
  id: string;
  timestamp: string;
  author: string;
  type: 'call' | 'whatsapp' | 'meeting' | 'counseling' | 'objection' | 'general';
  text: string;
}

export interface Lead {
  id: string;
  name: string;
  location: string; // City / Location (e.g., Delhi, Mumbai, Bengaluru)
  phone: string;
  email: string;
  course?: string;
  source?: string;
  feedback: string;
  notesHistory?: NoteHistoryItem[];
  status: CallStatus;
  lostReason?: string;
  assignedTo: string; // User ID
  assignedUserName: string;
  isAddedToday: boolean;
  isPendingToday: boolean;
  callsCount: number;
  callsMade?: number;
  revenue: number; // Realized revenue from fee paid
  dealValue: number;
  demoDetails?: DemoDetails;
  paymentDetails?: PaymentDetails;
  createdAt: string;
  priority?: 'High' | 'Medium' | 'Normal';
  followUpDate?: string;
}

export interface SuperAdminNotification {
  id: string;
  type: 'demo_scheduled' | 'admission_joined' | 'admin_id_changed' | 'user_created' | 'lead_reassigned';
  title: string;
  message: string;
  leadId?: string;
  leadName?: string;
  timestamp: string;
  read: boolean;
}

export interface TargetAuditItem {
  id: string;
  timestamp?: string;
  updatedAt?: string;
  modifiedBy?: string;
  updatedBy?: string;
  admissionTarget?: number;
  revenueTarget?: number;
  monthlyAdmissions?: number;
  monthlyRevenue?: number;
  period: 'monthly' | 'quarterly' | 'yearly';
}

export interface TargetConfig {
  dailyCalls: number;
  monthlyAdmissions: number;
  monthlyRevenue: number;
  period: 'monthly' | 'quarterly' | 'yearly';
  history?: TargetAuditItem[];
}

export interface DashboardMetrics {
  dailyCallTarget: number;
  dailyCallCount: number;
  achievementPercentage: number;
  totalCalls: number;
  newLeadsCount: number;
  leadsAddedTodayCount: number;
  pendingLeadsTodayCount: number;
  scheduledLeadsCount: number;
  totalRevenue: number;
  admissionTarget: number;
  admissionsCount: number;
  revenueTarget: number;
  // Pacing calculations
  requiredDailyAdmissions: number;
  actualDailyAdmissions: number;
  requiredDailyRevenue: number;
  actualDailyRevenue: number;
  daysRemainingInMonth: number;
  lastAdmissionDate?: string;
  daysSinceLastAdmission: number;
}

export interface ActivityTask {
  id: string;
  leadId: string;
  studentName: string;
  phone: string;
  type: 'call' | 'demo' | 'followup' | 'payment_reminder';
  dueDate: string;
  dueTime?: string;
  assignedCounselor: string;
  priority: 'high' | 'medium' | 'normal';
  status: 'pending' | 'completed' | 'overdue';
  notes?: string;
}

export interface NavItemConfig {
  id: string;
  label: string;
  iconName: string;
  section: 'MENU' | 'ADMISSIONS & FINANCIAL' | 'ANALYTICS' | 'SYSTEM';
  visible: boolean;
  badge?: number | string;
}

export type FontSizeOption = 12 | 14 | 16 | 18;

export type ThemeId = 'midnight-navy' | 'charcoal-amber' | 'slate-executive' | 'obsidian' | 'clean-light';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  category: 'Dark' | 'Light';
  primaryHex: string;
  accentHex: string;
  cardHex: string;
  borderHex: string;
}
