-- K-ARC Dashboard Data Integration Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. variants 테이블
-- ============================================
CREATE TABLE variants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  gene text NOT NULL,
  variant text NOT NULL,
  type text NOT NULL,
  significance text NOT NULL,
  families integer DEFAULT 0,
  chromosome text,
  position bigint,
  ref_allele text,
  alt_allele text,
  transcript text,
  inheritance text,
  notes text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can read variants"
  ON variants FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.approved = true)
  );

CREATE POLICY "Admin and researcher can insert variants"
  ON variants FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'researcher'))
  );

CREATE POLICY "Admin and researcher can update variants"
  ON variants FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'researcher'))
  );

CREATE POLICY "Admin can delete variants"
  ON variants FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ============================================
-- 2. reports 테이블
-- ============================================
CREATE TABLE reports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'draft',
  summary text,
  file_url text,
  file_name text,
  author_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can read reports"
  ON reports FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.approved = true)
  );

CREATE POLICY "Admin and researcher can manage reports"
  ON reports FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'researcher'))
  );

CREATE POLICY "Admin and researcher can update reports"
  ON reports FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'researcher'))
  );

CREATE POLICY "Admin can delete reports"
  ON reports FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ============================================
-- 3. activity_log 테이블
-- ============================================
CREATE TABLE activity_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  detail text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can read activity"
  ON activity_log FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.approved = true)
  );

CREATE POLICY "Authenticated can insert activity"
  ON activity_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- 4. profiles 테이블에 expertise 컬럼 추가
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expertise text;

-- ============================================
-- 5. Supabase Storage 버킷 (Reports 파일용)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Approved users can read report files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'reports' AND
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.approved = true)
  );

CREATE POLICY "Admin/researcher can upload report files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'reports' AND
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'researcher'))
  );
