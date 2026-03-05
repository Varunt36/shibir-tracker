-- =============================================
-- Shibir Management System - Supabase Schema
-- =============================================

-- 1. Youth Table
CREATE TABLE youth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Shibirs Table
CREATE TABLE shibirs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Shibir Attendance Table
CREATE TABLE shibir_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shibir_id UUID NOT NULL REFERENCES shibirs(id) ON DELETE CASCADE,
  youth_id UUID NOT NULL REFERENCES youth(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'unsure' CHECK (status IN ('coming', 'not_coming', 'unsure')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (shibir_id, youth_id)
);

-- 4. Shibir Payments Table
CREATE TABLE shibir_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shibir_id UUID NOT NULL REFERENCES shibirs(id) ON DELETE CASCADE,
  youth_id UUID NOT NULL REFERENCES youth(id) ON DELETE CASCADE,
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (shibir_id, youth_id)
);

-- =============================================
-- Indexes
-- =============================================

CREATE INDEX idx_shibir_attendance_shibir_id ON shibir_attendance(shibir_id);
CREATE INDEX idx_shibir_attendance_youth_id ON shibir_attendance(youth_id);
CREATE INDEX idx_shibir_payments_shibir_id ON shibir_payments(shibir_id);
CREATE INDEX idx_shibir_payments_youth_id ON shibir_payments(youth_id);
CREATE INDEX idx_shibirs_start_date ON shibirs(start_date);
CREATE INDEX idx_youth_name ON youth(name);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE youth ENABLE ROW LEVEL SECURITY;
ALTER TABLE shibirs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shibir_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE shibir_payments ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated" ON youth
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON shibirs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON shibir_attendance
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated" ON shibir_payments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
