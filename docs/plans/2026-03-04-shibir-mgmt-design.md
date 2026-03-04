# Shibir Management App — Design Doc
Date: 2026-03-04

## Overview
A responsive admin web app for managing youth participation in Shibir/Event registrations. Single-admin, internal tool. No public-facing pages.

**Tech Stack:** React + Vite, MUI, Supabase (Auth + Database)

---

## Database Schema

```sql
-- Youth
create table youth (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  created_at timestamptz default now()
);

-- Shibirs
create table shibirs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  start_date date,
  end_date date,
  fee numeric not null,
  created_at timestamptz default now()
);

-- Attendance (one row per youth per shibir)
create table shibir_attendance (
  id uuid primary key default gen_random_uuid(),
  shibir_id uuid references shibirs(id) on delete cascade,
  youth_id uuid references youth(id) on delete cascade,
  status text check (status in ('coming', 'not_coming', 'unsure')) default 'unsure',
  unique(shibir_id, youth_id)
);

-- Payments (one row per youth per shibir)
create table shibir_payments (
  id uuid primary key default gen_random_uuid(),
  shibir_id uuid references shibirs(id) on delete cascade,
  youth_id uuid references youth(id) on delete cascade,
  amount_paid numeric default 0,
  notes text,
  unique(shibir_id, youth_id)
);
```

**Finance is calculated dynamically (never stored):**
- `total_expected` = count of "coming" youth × shibir fee
- `total_paid` = SUM(amount_paid)
- `remaining` per youth = fee − amount_paid
- `total_pending` = total_expected − total_paid

---

## App Structure

```
src/
  api/
    youth.js          ← getYouth, addYouth, updateYouth, deleteYouth
    shibirs.js        ← getShibirs, createShibir
    attendance.js     ← getAttendance, updateAttendanceStatus
    payments.js       ← getPayments, updatePayment
    dashboard.js      ← getDashboardStats
  pages/
    Login.jsx
    Dashboard.jsx
    Youth.jsx
    Shibirs.jsx
    ShibirDetail.jsx
  components/
    Layout.jsx
    YouthTable.jsx
    AttendanceTable.jsx
    FinanceTable.jsx
  lib/
    supabase.js
  App.jsx
  main.jsx
.env
```

---

## Routing

| Route | Page | Description |
|---|---|---|
| `/login` | Login.jsx | Supabase email/password auth |
| `/` | Dashboard.jsx | 3 summary cards |
| `/youth` | Youth.jsx | Youth table + CRUD + CSV |
| `/shibirs` | Shibirs.jsx | Shibir list + create |
| `/shibirs/:id` | ShibirDetail.jsx | Attendance + Finance tabs |

**Auth:** Supabase session auto-managed. Protected routes redirect to `/login` if no session. All logged-in users have full access (no roles).

---

## UX Behaviours

### Youth Page
- MUI DataGrid with search/filter bar
- Add/edit via dialog modal
- Delete with confirmation dialog
- CSV import: parse and bulk insert
- CSV export: download current filtered list

### Shibirs Page
- List/card view of all shibirs (title, dates, fee)
- "Create Shibir" button → form dialog

### Shibir Detail — Attendance Tab
- Table of all youth with status dropdown per row
- Status options: `coming` / `not coming` / `unsure`
- Auto-save on selection change (no save button)
- Default status: `unsure`

### Shibir Detail — Finance Tab
- Table: youth name | fee | amount paid | remaining | status badge
- Click row to edit `amount_paid` inline
- Summary footer: total expected | total collected | total pending
- CSV export for finance summary

### Dashboard
- Card 1: Total youth in system
- Card 2: Next upcoming shibir (name + date)
- Card 3: Finance summary across all shibirs (collected vs pending)

---

## Environment
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Decisions Made
- **Option A (flat page routing)** chosen over global state or Redux — simplest for single-admin internal tool
- All Supabase calls isolated in `src/api/` — pages never call Supabase directly
- Payment status calculated dynamically — not stored as a field
- Single payment entry per youth per shibir (not instalment-based)
