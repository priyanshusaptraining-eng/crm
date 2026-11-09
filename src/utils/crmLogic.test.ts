import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAchievement,
  generateDemoMessage,
  filterLeadsForUser,
  canUserEditLead,
  calculateLeadMetrics,
} from './crmLogic';
import { Lead, User } from '../types/crm';

const mockSuperAdmin: User = {
  id: 'admin_primary_01',
  name: 'Super Admin',
  email: 'admin@dealdeck.internal',
  role: 'super_admin',
  canEdit: true,
  avatarColor: 'bg-blue-600',
};

const mockUser1: User = {
  id: 'usr_amit',
  name: 'Amit Verma',
  email: 'amit@dealdeck.internal',
  role: 'sales_user',
  canEdit: true,
  avatarColor: 'bg-emerald-600',
};

const mockUser2ReadOnly: User = {
  id: 'usr_priya',
  name: 'Priya Sen',
  email: 'priya@dealdeck.internal',
  role: 'sales_user',
  canEdit: false,
  avatarColor: 'bg-violet-600',
};

const mockLeads: Lead[] = [
  {
    id: 'lead_1',
    name: 'Rahul',
    location: 'Delhi NCR',
    phone: '+91 98765 43210',
    email: 'rahul@example.com',
    feedback: 'Interested in weekend batch, requested fee discount',
    status: 'interested',
    assignedTo: 'usr_amit',
    assignedUserName: 'Amit Verma',
    isAddedToday: true,
    isPendingToday: true,
    callsCount: 6,
    revenue: 15000,
    dealValue: 25000,
    demoDetails: {
      date: '2026-11-05',
      time: '03:00 PM',
      webinarTopic: 'Data Science Masterclass',
      googleMeetLink: 'https://meet.google.com/crm-demo-live',
      scheduledAt: '2026-11-05T09:00:00Z',
      attended: null,
    },
    paymentDetails: {
      amountPaid: 15000,
      totalCourseFee: 25000,
      isRegistrationOnly: true,
      remainingAmount: 10000,
      remainingDueDate: '2026-11-15',
      receiptNumber: 'REC-2026-001',
    },
    createdAt: '2026-11-05T08:00:00Z',
  },
  {
    id: 'lead_2',
    name: 'Sunita Rao',
    location: 'Bengaluru',
    phone: '+91 98111 22334',
    email: 'sunita@example.com',
    feedback: 'Did not answer call',
    status: 'npu',
    assignedTo: 'usr_priya',
    assignedUserName: 'Priya Sen',
    isAddedToday: true,
    isPendingToday: false,
    callsCount: 2,
    revenue: 0,
    dealValue: 30000,
    createdAt: '2026-11-05T07:30:00Z',
  },
  {
    id: 'lead_3',
    name: 'Vikram Mehta',
    location: 'Mumbai',
    phone: '+91 98222 33445',
    email: 'vikram@example.com',
    feedback: 'Full payment received, confirmed admission',
    status: 'admission_joined',
    assignedTo: 'usr_amit',
    assignedUserName: 'Amit Verma',
    isAddedToday: false,
    isPendingToday: false,
    callsCount: 8,
    revenue: 35000,
    dealValue: 35000,
    paymentDetails: {
      amountPaid: 35000,
      totalCourseFee: 35000,
      isRegistrationOnly: false,
      remainingAmount: 0,
      remainingDueDate: '',
      receiptNumber: 'REC-2026-002',
    },
    createdAt: '2026-11-04T10:00:00Z',
  },
];

test('calculateAchievement computes percentage accurately', () => {
  assert.equal(calculateAchievement(25, 50), 50.0);
  assert.equal(calculateAchievement(42, 50), 84.0);
  assert.equal(calculateAchievement(0, 50), 0.0);
});

test('generateDemoMessage contains Rahul, Google Meet link, and date/time', () => {
  const msg = generateDemoMessage('Rahul', '2026-11-05', '03:00 PM', 'https://meet.google.com/crm-demo-live');
  assert.ok(msg.includes('Hi Rahul'));
  assert.ok(msg.includes('2026-11-05 at 03:00 PM'));
  assert.ok(msg.includes('https://meet.google.com/crm-demo-live'));
  assert.ok(!msg.includes('—')); // No em-dash
});

test('filterLeadsForUser enforces super admin view-all vs regular user view-own', () => {
  const superAdminLeads = filterLeadsForUser(mockLeads, mockSuperAdmin);
  assert.equal(superAdminLeads.length, 3);

  const amitLeads = filterLeadsForUser(mockLeads, mockUser1);
  assert.equal(amitLeads.length, 2);

  const priyaLeads = filterLeadsForUser(mockLeads, mockUser2ReadOnly);
  assert.equal(priyaLeads.length, 1);
  assert.equal(priyaLeads[0].name, 'Sunita Rao');
});

test('canUserEditLead respects role and super-admin permission settings', () => {
  assert.equal(canUserEditLead(mockSuperAdmin, mockLeads[0]), true);
  assert.equal(canUserEditLead(mockUser1, mockLeads[0]), true);
  assert.equal(canUserEditLead(mockUser1, mockLeads[1]), false);
  assert.equal(canUserEditLead(mockUser2ReadOnly, mockLeads[1]), false);
});

test('calculateLeadMetrics summarizes calls, today, pending, scheduled, and revenue', () => {
  const metrics = calculateLeadMetrics(mockLeads, 50);
  assert.equal(metrics.totalCalls, 16);
  assert.equal(metrics.leadsAddedTodayCount, 2);
  assert.equal(metrics.pendingLeadsTodayCount, 1);
  assert.equal(metrics.scheduledLeadsCount, 1);
  assert.equal(metrics.totalRevenue, 50000);
});
