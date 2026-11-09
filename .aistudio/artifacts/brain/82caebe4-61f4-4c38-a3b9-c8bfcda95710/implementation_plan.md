# DealDeck CRM — Master Architectural & Redesign Implementation Plan

A comprehensive, production-grade overhaul of DealDeck CRM for an education and training enterprise. Transforms the application into a polished, high-contrast multi-page CRM with a default **Midnight Navy** aesthetic inspired by the reference design, **Inter** as the single font family throughout, an ergonomic collapsible sidebar, dedicated functional pages, independent student profile drawers, interactive Targets & Goals configuration, and a persistent 5-theme Appearance selector.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The revised master plan incorporates all requirements from the master redesign prompt:
> - **Visual Identity**: **Midnight Navy** is the default theme (`#0B1224` background, `#141E35` card surface, `#819BFF` soft periwinkle primary accent, `#F8FAFC` primary text, `#283653` borders).
> - **Typography**: **Inter is the single font family across the entire CRM**. All legacy mixed fonts (Bricolage Grotesque, Space Grotesk, Onest) are eliminated in favor of strict weights and sizes with tabular figures (`tabular-nums`) for numbers.
> - **Multi-Page Layout**: Dedicated independent page routes for **Dashboard**, **Leads Management**, **Lead Pipeline**, **Demos & Webinars**, **Follow-ups & Activities**, **Admissions Tracker**, **Fee Transactions**, **Pending Dues**, **Reports & Analytics**, **Counselor Performance**, and **Targets & Goals**.
> - **10-Column Lead Table**: Distinct, unmerged columns (Student Name, Location, Phone Number, Email Address, Lead Status, Feedback & Notes, Demo/Meeting Schedule, Fee Paid, Assigned Counselor, Actions).
> - **Slide-In Student Profile Drawer**: Full historical timeline (notes, calls, webinars, transactions) accessible without cluttering the table.
> - **Appearance Selector**: Compact 5-theme popover (Midnight Navy, Charcoal Amber, Slate Executive, Obsidian, Clean Light) with live preview and persistent localStorage state.
> - **Language**: 100% professional English; zero Hinglish or informal terminology.

---

## 1. Overview & Core Concept

DealDeck CRM is a commercial-grade sales, counseling, and admissions operating system for educational institutes and corporate training academies. It bridges marketing inquiries, outbound counseling calls, live webinar demonstrations, enrollment token collections, installment fee recovery, counselor KPIs, and executive target pacing.

### Core Users & Roles
1. **Super Admin / Operations Director**: Full company-wide pipeline visibility, lead assignment/reassignment, global target configuration (monthly admissions and revenue sliders), counselor permission controls, and financial transaction auditing.
2. **Admissions Counselors**: Focused view of assigned leads, daily call targets, overdue follow-up reminders, webinar demo scheduling, and fee collection logging.

---

## 2. User Experience & Visual Design

### A. Design Tokens & Visual Hierarchy (Midnight Navy Default)
The application adopts centralized CSS custom property tokens mapped cleanly in Tailwind CSS:

- **Main Background**: `#0B1224` (Deep Midnight Canvas)
- **Sidebar Background**: `#0A1020` (Dark Slate Rail)
- **Card / Table Surface**: `#141E35` (Elevated Panel)
- **Input & Control Surface**: `#0C162B` (Inset Form Fill)
- **Border Lines**: `#283653` (Restrained Steel Divider)
- **Primary Text**: `#F8FAFC` (High-Contrast Clean White)
- **Secondary Text**: `#CBD5E1` (Soft Slate)
- **Supporting / Muted Text**: `#A3B1C6` (Legible Secondary)
- **Primary Accent**: `#819BFF` (Soft Periwinkle Blue)
- **Success / Admitted**: `#10B981` (Emerald Green)
- **Warning / Due**: `#F59E0B` (Warm Amber)
- **Error / Lost**: `#F87171` (Rose Red)

### B. Typography System (Inter Only)
Strict typographic scale enforced across all pages:
- **Page Headings**: $24\text{px}$, Font Weight 700
- **Section Headings**: $17\text{px}$, Font Weight 600
- **Card Headings**: $14\text{px}$, Font Weight 600
- **Candidate Names**: $14\text{px}$, Font Weight 600
- **Table Data & Content**: $13\text{px}$, Font Weight 400–500
- **Table Headers**: $12\text{px}$, Font Weight 600, uppercase with letter-spacing
- **Supporting Information**: $12\text{px}$, Font Weight 400
- **KPI Metrics**: $26\text{px}–30\text{px}$, Font Weight 700 with `font-variant-numeric: tabular-nums`
- **Buttons & Actions**: $13\text{px}$, Font Weight 600
- **Sidebar Navigation**: $13\text{px}$, Font Weight 500

### C. Collapsible Slim Sidebar ($210\text{px}–220\text{px}$)
- **Structure**: Grouped into **MENU**, **ADMISSIONS & FINANCIAL**, **ANALYTICS**, and **SYSTEM**.
- **Collapsible Rail**: Smooth animated toggle between expanded ($215\text{px}$) and compact icon-only mode ($64\text{px}$) with hover tooltips to maximize table viewport width.
- **Header & Profile**: Branded DealDeck emblem, user profile card, and compact logout trigger.

### D. Dedicated Functional Pages & Views

#### 1. Dashboard (Management Overview)
- **Admission Performance**: Monthly target vs. achieved count, remaining count, completion %, and animated progress bar.
- **Revenue Performance**: Monthly revenue target vs. collected fees, gap, completion %, and progress bar.
- **Daily Performance**: Required daily admission pace (based on calendar days remaining) vs. actual daily admissions; required daily revenue pace vs. actual.
- **Admission Activity**: Last admission date, days elapsed, recent enrollments feed, and projected monthly achievement.
- **Operational Summary**: Pending follow-ups today, overdue follow-ups, upcoming demos, and 1-click quick actions.

#### 2. Leads Management (10-Column Precision Table)
Every student occupies exactly one row with strictly separated columns:
1. `Student Name` (Bold $14\text{px}$ white text, click to open profile drawer)
2. `Location` (City/State with icon)
3. `Phone Number` (Clickable `tel:` link with one-click copy)
4. `Email Address` (Clickable `mailto:` link)
5. `Lead Status` (New, Interested, Call Later, Demo Scheduled, NPU, Not Interested, Admission Joined)
6. `Feedback & Notes` (Latest note snippet with count badge)
7. `Demo / Meeting Schedule` (Date, time, and quick link)
8. `Fee Paid` (Amount collected vs. total course fee, due date)
9. `Assigned Counselor` (Quick reassign dropdown)
10. `Actions` (Edit, View Profile, Log Call, More Options menu)

- **Controls**: Live search (name, phone, email), multi-criteria filters (status, counselor, course, source, date), column visibility toggle, sorting, pagination, and CSV export.

#### 3. Lead Profile Slide-In Drawer
Clicking any lead opens a full-height right-side drawer containing:
- Candidate personal details, location, phone, email, course interest, and lead source.
- Current status badge and 1-click counselor reassignment.
- Chronological conversation timeline (most recent discussion highlighted, past discussions listed step-by-step).
- Form to log new phone call, WhatsApp, counseling, or objection remarks.
- Demo history, fee payment history, and admission certificate details.

#### 4. Lead Pipeline (Visual Journey Kanban)
- Columns: `New Lead` → `Interested` → `Demo Scheduled` → `Follow-up` → `Admission Joined` (plus `Call Later`, `NPU`, `Not Interested`).
- Stage counts, total pipeline value, conversion percentage between stages, and 1-click stage advancement.

#### 5. Admissions Tracker
- Dedicated enrollment ledger: Student Name, Admission Date, Course Enrolled, Assigned Counselor, Total Fee, Paid Amount, Remaining Balance, Payment Status (Full/Partial), Enrollment Status.
- Date filters, monthly enrollment trends, and 1-click navigation to student profile.

#### 6. Follow-ups & Activities
- Today's scheduled calls, overdue follow-ups (amber highlight), upcoming follow-ups, completed activities log.
- Demo and webinar interactive calendar.
- Action handlers to mark complete, reschedule, log call notes, or create follow-ups.

#### 7. Financial Management (Two Dedicated Pages)
- **Fee Transactions**: Student Name, Transaction Date, Amount Received, Payment Mode (UPI, Bank Transfer, Card), Transaction Reference / UTR, Assigned Counselor, Receipt view modal.
- **Pending Dues**: Student Name, Course Fee, Amount Paid, Outstanding Balance, Due Date, Payment Reminder trigger, Collection Status.

#### 8. Targets & Goals (Dedicated Configuration Page)
- Initial defaults: Monthly Admissions: 20 | Monthly Revenue: ₹3,00,000.
- Interactive dual sliders + direct numeric inputs for Admissions ($1–100$) and Revenue ($₹50,000–₹10,00,000$, step $₹5,000$).
- Target periods: Monthly, Quarterly, Yearly.
- Save Changes and Cancel with confirmation.
- Audit history logging: modification date and modified by information.
- Live automatic synchronization: updates required daily pace, gaps, and progress bars throughout the CRM.

#### 9. Analytics & Counselor Performance (Two Dedicated Pages)
- **Reports & Analytics**: Lead conversion funnel with stage drop-off rates, lead source performance, monthly enrollment and revenue trends, course-wise breakdowns.
- **Counselor Performance**: Counselor leaderboard tracking assigned leads, outbound calls logged, contact rate, demos booked, admissions achieved, revenue generated, conversion %, and target completion.

#### 10. Appearance Selector (Compact 5-Theme Drawer)
Accessible via top-right profile header or sidebar footer:
1. **Midnight Navy** (Default Claude-style)
2. **Charcoal Amber** (Deep charcoal with warm amber accents)
3. **Slate Executive** (Steel slate grey with muted blue accents)
4. **Obsidian** (Near-black OLED with emerald accents)
5. **Clean Light** (Crisp white and soft ice grey with royal blue accents)
- Real-time preview with Apply Theme and Cancel actions, persistently stored in `localStorage`.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Rationale |
| :--- | :--- | :--- |
| **Typography Policy** | Pure **Inter** only across 100% of the CRM | Solves inconsistent weights and unreadable mixed display fonts; ensures enterprise SaaS clarity. |
| **Default Aesthetic** | **Midnight Navy** (`#0B1224`, `#141E35`, `#819BFF`) | Matches the user's uploaded reference screenshot with high contrast and zero eye fatigue. |
| **Table Layout** | Strict 10-column schema with horizontal overflow | Never merges student attributes into single cramped cells; preserves data integrity. |
| **Lead Profiles** | Non-disruptive slide-in drawer (`SlideInDrawer`) | Allows reviewing extensive conversation histories without leaving the active table view or losing filters. |
| **Target Architecture** | Central state + `localStorage` persistence | Automatically computes daily paces using actual days remaining in the month and updates all pages instantly. |
| **Terminology** | 100% standard business English | Completely replaces informal or mixed phrases with professional CRM terminology. |

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DealDeck CRM Architecture                       │
├─────────────────┬──────────────────────────────────────────────────────┤
│ Collapsible     │ Top Navigation:                                      │
│ Sidebar         │ • Breadcrumbs / Active Page Title                    │
│ (215px / 64px)  │ • Search Trigger & Notification Drawer               │
│                 │ • Appearance Selector (5 Themes) & User Session Pill │
│ • MENU          ├──────────────────────────────────────────────────────┤
│   - Dashboard   │ Multi-Page View Container:                           │
│   - Leads (10c) │  [1] Dashboard (KPI Pacing, Goals, Follow-up Alert)  │
│   - Pipeline    │  [2] Leads Management (10-col Table + Search/Filter) │
│   - Demos       │  [3] Lead Pipeline (Stage Kanban)                    │
│   - Follow-ups  │  [4] Admissions Tracker (Enrollment Ledger)          │
│ • FINANCIAL     │  [5] Follow-ups & Activities (Actionable Queue)      │
│   - Fees        │  [6] Fee Transactions & Pending Dues                 │
│   - Pending     │  [7] Targets & Goals (Interactive Sliders & Audit)   │
│ • ANALYTICS     │  [8] Reports & Counselor Performance                 │
│   - Reports     ├──────────────────────────────────────────────────────┤
│   - Counselors  │ Persistent State & Data Layer (localStorage sync):   │
│ • SYSTEM        │ • Leads & Notes Timeline • TargetConfig & Audit      │
│   - Targets     │ • Admissions & Fee Transactions • Active Theme       │
│   - Settings    │ • Role-based Access Control (Super Admin / Counselor)│
└─────────────────┴──────────────────────────────────────────────────────┘
```

### Data Synchronization Flow
1. **Lead Status Change** $\rightarrow$ If marked `Admission Joined`, prompts fee enrollment modal, automatically records transaction in **Fee Transactions**, updates **Admissions Tracker**, and recalculates **Dashboard** metrics.
2. **Targets Updated** in **Targets & Goals** $\rightarrow$ Instantly updates `TargetConfig`, computes daily pace ($(\text{Target} - \text{Achieved}) / \text{Days Remaining}$), and updates progress gauges on Dashboard and Sidebar.
3. **Theme Changed** in **Appearance** $\rightarrow$ Immediately writes CSS variables to document root and persists choice in `localStorage`.

---

## Execution Steps

1. **Global Design System & Inter Typography**: Configure centralized theme variables in `src/index.css` (Midnight Navy default + 4 variants) and ensure `Inter` is universally applied.
2. **Data Models & State Harmonization**: Update `src/types/crm.ts` and `src/data/mockData.ts` to support all 10 table attributes, pipeline stages, activity queues, and persistent target history.
3. **Collapsible Slim Sidebar**: Refactor `src/components/Sidebar.tsx` into a $215\text{px}$ rail with collapse toggle, grouped navigation, and clean active indicators.
4. **Dashboard View Refactoring**: Build pure management overview in `src/components/views/DashboardView.tsx` with pacing KPIs, completion gauges, and operational queues.
5. **Leads Management & 10-Column Table**: Overhaul `src/components/LeadTable.tsx` with 10 separate columns, rich filtering, sorting, and pagination.
6. **Lead Profile Drawer**: Build `src/components/LeadProfileDrawer.tsx` with full chronological conversation history, contact details, and note logger.
7. **Pipeline Kanban View**: Build `src/components/views/LeadPipelineView.tsx` with stage progression and conversion metrics.
8. **Admissions & Financial Pages**: Ensure `AdmissionsTrackerView.tsx`, `FeeTransactionsView.tsx`, and `PendingDueDatesView.tsx` are fully functional and synchronized.
9. **Follow-ups & Activities View**: Create `src/components/views/FollowupsActivitiesView.tsx` with overdue detection, scheduled calls, and demo calendar.
10. **Targets & Goals Configuration Page**: Build `src/components/views/TargetsGoalsView.tsx` with interactive sliders, direct numeric inputs, period selector, and audit trail.
11. **Reports & Counselor Performance Views**: Refactor `ConversionAnalyticsView.tsx` and create dedicated `CounselorPerformanceView.tsx`.
12. **Appearance Selector Popover**: Create `src/components/AppearanceModal.tsx` supporting the 5 specified themes with instant preview and persistent storage.
13. **Verification**: Run `compile_applet` and `lint_applet` and perform Playwright visual validation across desktop resolutions ($1366\times 768$ and $1920\times 1080$).
