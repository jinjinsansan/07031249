/*
  # 同意履歴テーブル作成

  1. 新しいテーブル
    - `consent_histories` - 同意履歴
      - `id` (uuid, primary key)
      - `line_username` (text)
      - `consent_given` (boolean)
      - `consent_date` (timestamp)
      - `ip_address` (text)
      - `user_agent` (text)
      - `created_at` (timestamp)

  2. セキュリティ
    - RLSを有効化
    - 管理者のみ読み取り可能
*/

-- 同意履歴テーブル
CREATE TABLE IF NOT EXISTS consent_histories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_username text NOT NULL,
  consent_given boolean NOT NULL,
  consent_date timestamptz NOT NULL,
  ip_address text NOT NULL,
  user_agent text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_consent_histories_line_username ON consent_histories(line_username);
CREATE INDEX IF NOT EXISTS idx_consent_histories_consent_date ON consent_histories(consent_date);

-- RLS有効化
ALTER TABLE consent_histories ENABLE ROW LEVEL SECURITY;

-- RLSポリシー設定
CREATE POLICY "Counselors can read consent histories"
  ON consent_histories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM counselors 
      WHERE email = auth.email() AND is_active = true
    )
  );

CREATE POLICY "Users can insert their own consent histories"
  ON consent_histories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);