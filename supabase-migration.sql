-- K-ARC Dashboard Data Integration Migration
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. variants 테이블
-- ============================================
CREATE TABLE variants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  gene text NOT NULL,
  variant text NOT NULL,
  rank text,
  pathway text,
  sample_id text,
  chromosome text,
  position bigint,
  ref_allele text,
  alt_allele text,
  transcript text,
  inheritance text,
  status text NOT NULL DEFAULT 'available',
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

-- ============================================
-- 6. announcements 테이블
-- ============================================
CREATE TABLE announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  pinned boolean NOT NULL DEFAULT false,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved users can read announcements"
  ON announcements FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.approved = true)
  );

CREATE POLICY "Admin and researcher can insert announcements"
  ON announcements FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'researcher'))
  );

CREATE POLICY "Admin and researcher can update announcements"
  ON announcements FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'researcher'))
  );

CREATE POLICY "Admin can delete announcements"
  ON announcements FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ============================================
-- 7. updated_at 자동 갱신 트리거
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 8. 성능 인덱스
-- ============================================
CREATE INDEX IF NOT EXISTS idx_variants_gene ON variants(gene);
CREATE INDEX IF NOT EXISTS idx_variants_rank ON variants(rank);
CREATE INDEX IF NOT EXISTS idx_variants_pathway ON variants(pathway);
CREATE INDEX IF NOT EXISTS idx_variants_status ON variants(status);
CREATE INDEX IF NOT EXISTS idx_variants_sample_id ON variants(sample_id);
CREATE INDEX IF NOT EXISTS idx_variants_created_at ON variants(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_author ON reports(author_id);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned_created ON announcements(pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_author ON announcements(author_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at);

-- ============================================
-- 9. variants 스키마 변경 (기존 테이블 마이그레이션용)
-- 이미 variants 테이블이 있는 경우 아래를 실행
-- ============================================
-- ALTER TABLE variants RENAME COLUMN type TO rank;
-- ALTER TABLE variants RENAME COLUMN significance TO pathway;
-- ALTER TABLE variants DROP COLUMN IF EXISTS families;
-- ALTER TABLE variants ADD COLUMN IF NOT EXISTS sample_id text;
-- ALTER TABLE variants ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'available';
-- ALTER TABLE variants ALTER COLUMN rank DROP NOT NULL;
-- ALTER TABLE variants ALTER COLUMN pathway DROP NOT NULL;
