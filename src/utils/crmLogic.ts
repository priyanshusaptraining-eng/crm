import { Lead, User, DashboardMetrics } from '../types/crm';

/**
 * Calculates percentage achievement rounded to 1 decimal place.
 */
export function calculateAchievement(value: number, target: number): number {
  if (target <= 0) return 0;
  const percentage = (value / target) * 100;
  return Math.round(percentage * 10) / 10;
}

/**
 * Generates the standardized demo message with Google Meet link.
 */
export function generateDemoMessage(
  leadName: string,
  dateStr: string,
  timeStr: string,
  meetLink: string = 'https://meet.google.com/xyz-tech-demo'
): string {
  return `Hi ${leadName}, we have scheduled your webinar session on ${dateStr} at ${timeStr}. You can join this session using the link: ${meetLink}. Looking forward to your active participation!`;
}

/**
 * Role-based access control:
 * Super admin can view all leads.
 * Regular sales users can only view leads assigned to their User ID.
 */
export function filterLeadsForUser(leads: Lead[], user: User): Lead[] {
  if (user.role === 'super_admin') {
    return leads;
  }
  return leads.filter((lead) => lead.assignedTo === user.id);
}

/**
 * Role-based edit permission check:
 */
export function canUserEditLead(user: User, lead: Lead): boolean {
  if (user.role === 'super_admin') {
    return true;
  }
  return lead.assignedTo === user.id && user.canEdit === true;
}

/**
 * Can user assign or reassign leads?
 */
export function canUserAssignLead(user: User, lead: Lead): boolean {
  if (user.role === 'super_admin') {
    return true;
  }
  return lead.assignedTo === user.id && user.canEdit === true;
}

/**
 * Computes all CRM dashboard and lead management metrics with realistic pacing.
 */
export function calculateLeadMetrics(
  leads: Lead[], 
  dailyCallTarget: number = 50,
  admissionTarget: number = 20,
  revenueTarget: number = 300000
): DashboardMetrics {
  const totalCalls = leads.reduce((sum, lead) => sum + (lead.callsCount || 0), 0);
  const newLeadsCount = leads.filter((lead) => lead.status === 'new_lead').length;
  const leadsAddedTodayCount = leads.filter((lead) => lead.isAddedToday).length;
  const pendingLeadsTodayCount = leads.filter((lead) => lead.isPendingToday).length;
  const scheduledLeadsCount = leads.filter(
    (lead) => Boolean(lead.demoDetails?.date)
  ).length;

  const totalRevenue = leads.reduce((sum, lead) => sum + (lead.paymentDetails?.amountPaid || lead.revenue || 0), 0);
  const admittedLeads = leads.filter((l) => l.status === 'admission_joined');
  const admissionsCount = admittedLeads.length;
  
  const dailyCallCount = totalCalls;
  const achievementPercentage = calculateAchievement(dailyCallCount, dailyCallTarget);

  // Calendar math for pace
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const currentDay = Math.min(totalDaysInMonth, now.getDate());
  const daysRemainingInMonth = Math.max(1, totalDaysInMonth - currentDay);

  const remainingAdmissions = Math.max(0, admissionTarget - admissionsCount);
  const requiredDailyAdmissions = Math.round((remainingAdmissions / daysRemainingInMonth) * 10) / 10;
  const actualDailyAdmissions = Math.round((admissionsCount / Math.max(1, currentDay)) * 10) / 10;

  const remainingRevenue = Math.max(0, revenueTarget - totalRevenue);
  const requiredDailyRevenue = Math.round(remainingRevenue / daysRemainingInMonth);
  const actualDailyRevenue = Math.round(totalRevenue / Math.max(1, currentDay));

  // Find most recent admission date
  let lastAdmissionDate: string | undefined = undefined;
  let daysSinceLastAdmission = 0;
  if (admittedLeads.length > 0) {
    const dates = admittedLeads
      .map(l => l.paymentDetails?.paymentDate || l.createdAt)
      .filter(Boolean)
      .sort()
      .reverse();
    if (dates.length > 0) {
      lastAdmissionDate = dates[0];
      const lastDate = new Date(lastAdmissionDate);
      const diffMs = now.getTime() - lastDate.getTime();
      daysSinceLastAdmission = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }
  }

  return {
    dailyCallTarget,
    dailyCallCount,
    achievementPercentage,
    totalCalls,
    newLeadsCount,
    leadsAddedTodayCount,
    pendingLeadsTodayCount,
    scheduledLeadsCount,
    totalRevenue,
    admissionTarget,
    admissionsCount,
    revenueTarget,
    requiredDailyAdmissions,
    actualDailyAdmissions,
    requiredDailyRevenue,
    actualDailyRevenue,
    daysRemainingInMonth,
    lastAdmissionDate,
    daysSinceLastAdmission,
  };
}

/**
 * Funnel and Loss Analytics
 */
export function computeFunnelAnalytics(leads: Lead[]) {
  const total = leads.length;
  const contacted = leads.filter((l) => l.callsCount > 0).length;
  const demosScheduled = leads.filter((l) => Boolean(l.demoDetails?.date)).length;
  const demosAttended = leads.filter((l) => l.demoDetails?.attended === true).length;
  const admissions = leads.filter((l) => l.status === 'admission_joined').length;

  const notInterested = leads.filter((l) => l.status === 'ni' || l.status === 'lost');
  const npu = leads.filter((l) => l.status === 'npu');
  const missedDemos = leads.filter((l) => l.demoDetails && l.demoDetails.attended === false);

  const conversionRate = total > 0 ? Math.round((admissions / total) * 1000) / 10 : 0;
  const totalCalls = leads.reduce((sum, l) => sum + l.callsCount, 0);
  const avgCallsPerAdmission = admissions > 0 ? Math.round((totalCalls / admissions) * 10) / 10 : 0;

  return {
    total,
    contacted,
    demosScheduled,
    demosAttended,
    admissions,
    notInterestedCount: notInterested.length,
    npuCount: npu.length,
    missedDemosCount: missedDemos.length,
    conversionRate,
    avgCallsPerAdmission,
    lostLeads: [...notInterested, ...npu],
  };
}
