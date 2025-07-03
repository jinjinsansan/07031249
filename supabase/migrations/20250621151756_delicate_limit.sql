/*
  # 初期データベーススキーマ作成

  1. 新しいテーブル
    - `users` - ユーザー情報
      - `id` (uuid, primary key)
      - `line_username` (text, unique)
      - `created_at` (timestamp)
    - `diary_entries` - 日記エントリー
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `date` (date)
      - `emotion` (text)
      - `event` (text)
      - `realization` (text)
      - `self_esteem_score` (integer)
      - `worthlessness_score` (integer)
      - `created_at` (timestamp)
    - `chat_rooms` - チャットルーム
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `status` (text)
      - `created_at` (timestamp)
    - `messages` - メッセージ
      - `id` (uuid, primary key)
      - `chat_room_id` (uuid, foreign key)
      - `sender_id` (uuid, foreign key)
      - `content` (text)
      - `is_counselor` (boolean)
      - `created_at` (timestamp)
    - `counselors` - カウンセラー
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `is_active` (boolean)
      - `created_at` (timestamp)

  2. セキュリティ
    - すべてのテーブルでRLSを有効化
    - ユーザーは自分のデータのみアクセス可能
    - カウンセラーは担当するチャットルームのみアクセス可能
*/

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  line_username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 日記エントリーテーブル
CREATE TABLE IF NOT EXISTS diary_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  emotion text NOT NULL,
  event text NOT NULL,
  realization text NOT NULL,
  self_esteem_score integer NOT NULL DEFAULT 50,
  worthlessness_score integer NOT NULL DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

-- カウンセラーテーブル
CREATE TABLE IF NOT EXISTS counselors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- チャットルームテーブル
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  counselor_id uuid REFERENCES counselors(id),
  status text DEFAULT 'active' CHECK (status IN ('active', 'closed', 'waiting')),
  created_at timestamptz DEFAULT now()
);

-- メッセージテーブル
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES users(id),
  counselor_id uuid REFERENCES counselors(id),
  content text NOT NULL,
  is_counselor boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT messages_sender_check CHECK (
    (sender_id IS NOT NULL AND counselor_id IS NULL AND is_counselor = false) OR
    (sender_id IS NULL AND counselor_id IS NOT NULL AND is_counselor = true)
  )
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_id ON diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_date ON diary_entries(date);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user_id ON chat_rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_room_id ON messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- RLS有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselors ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLSポリシー設定

-- ユーザーは自分の情報のみアクセス可能
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = line_username);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = line_username);

-- 日記エントリー: ユーザーは自分の日記のみアクセス可能
CREATE POLICY "Users can manage own diary entries"
  ON diary_entries
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE line_username = auth.uid()::text));

-- チャットルーム: ユーザーは自分のチャットルームのみアクセス可能
CREATE POLICY "Users can access own chat rooms"
  ON chat_rooms
  FOR ALL
  TO authenticated
  USING (user_id IN (SELECT id FROM users WHERE line_username = auth.uid()::text));

-- メッセージ: ユーザーは自分のチャットルームのメッセージのみアクセス可能
CREATE POLICY "Users can access messages in own chat rooms"
  ON messages
  FOR ALL
  TO authenticated
  USING (
    chat_room_id IN (
      SELECT id FROM chat_rooms 
      WHERE user_id IN (SELECT id FROM users WHERE line_username = auth.uid()::text)
    )
  );

-- カウンセラー用ポリシー（管理者権限）
CREATE POLICY "Counselors can access all data"
  ON counselors
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Counselors can access assigned chat rooms"
  ON chat_rooms
  FOR ALL
  TO authenticated
  USING (
    counselor_id IN (
      SELECT id FROM counselors 
      WHERE email = auth.email() AND is_active = true
    )
  );

CREATE POLICY "Counselors can access messages in assigned rooms"
  ON messages
  FOR ALL
  TO authenticated
  USING (
    chat_room_id IN (
      SELECT id FROM chat_rooms 
      WHERE counselor_id IN (
        SELECT id FROM counselors 
        WHERE email = auth.email() AND is_active = true
      )
    )
  );