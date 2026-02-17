-- updated_at 자동 갱신 함수 (없으면 생성)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- blog_posts 테이블 생성
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  content text NOT NULL,
  excerpt text,
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  published boolean DEFAULT false,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 공개된 포스트는 누구나 읽기 가능
CREATE POLICY "Anyone can read published posts"
  ON blog_posts FOR SELECT
  USING (published = true);

-- Admin/coordinator는 모든 포스트 읽기
CREATE POLICY "Admin can read all posts"
  ON blog_posts FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coordinator'))
  );

-- Admin/coordinator만 작성
CREATE POLICY "Admin can insert posts"
  ON blog_posts FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coordinator'))
  );

-- Admin/coordinator만 수정
CREATE POLICY "Admin can update posts"
  ON blog_posts FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coordinator'))
  );

-- Admin만 삭제
CREATE POLICY "Admin can delete posts"
  ON blog_posts FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE TRIGGER set_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);

-- 테스트 포스트
INSERT INTO blog_posts (title, subtitle, content, excerpt, published, published_at) VALUES
(
  '자폐는 하나가 아닙니다',
  '유전체 연구가 보여주는 자폐의 다양성',
  '자폐 스펙트럼이라는 말이 있습니다. 스펙트럼이라는 표현은 자폐가 단일한 상태가 아니라, 사람마다 매우 다른 양상으로 나타난다는 뜻입니다. 어떤 사람은 언어 발달에 어려움을 겪고, 어떤 사람은 반복적인 행동 패턴이 두드러지며, 또 어떤 사람은 감각 과민이 일상에 큰 영향을 줍니다.

그런데 이 다양성은 어디에서 올까요?

K-ARC의 유전체 연구는 바로 이 질문에서 시작됩니다. 가족 기반 전장유전체 분석(WGS)을 통해 자폐와 관련된 유전 변이를 찾고, 그 변이가 각 개인에게 어떤 영향을 미치는지 이해하려 합니다.

**같은 진단, 다른 유전자**

자폐 진단을 받은 사람들 사이에서도 관여하는 유전자는 서로 다를 수 있습니다. 실제로 지금까지 자폐와 연관된 것으로 보고된 유전자는 수백 개에 이릅니다. 이는 자폐가 단일 유전자 질환이 아니라, 여러 유전적 경로가 복합적으로 작용하는 상태임을 시사합니다.

K-ARC는 한국인 가족 코호트에서 이러한 유전적 다양성을 체계적으로 분석하고 있습니다. 특히 동아시아 인구에서의 유전 변이 빈도는 유럽 기반 연구와 다를 수 있어, 한국인 대상 연구의 중요성이 큽니다.

**연구가 가족에게 의미하는 것**

유전체 연구의 결과가 곧바로 치료법으로 이어지는 것은 아닙니다. 하지만 자녀의 특성이 어디에서 비롯되는지 이해하는 것은, 많은 가족에게 의미 있는 일입니다. "왜 우리 아이만 다를까"라는 물음에 유전학이 하나의 실마리를 제공할 수 있습니다.

K-ARC는 연구 참여 가족에게 유전체 분석 결과를 되돌려주는 방안도 함께 고민하고 있습니다. 연구가 논문으로만 끝나는 것이 아니라, 가족의 이해를 돕는 데까지 이어지길 바랍니다.

**앞으로의 방향**

K-ARC는 현재까지 1,328가족, 4,453명의 참여자 데이터를 축적했습니다. 이 데이터를 바탕으로 자폐의 유전적 구조를 한국인 관점에서 더 깊이 이해하는 것이 목표입니다. 앞으로도 가족 중심의 연구를 이어가며, 한 사람 한 사람의 다양성을 존중하는 과학을 만들어 가겠습니다.',
  'K-ARC의 유전체 연구는 자폐가 단일한 상태가 아니라 다양한 유전적 경로가 복합적으로 작용하는 스펙트럼임을 보여줍니다.',
  true,
  now()
);
