/*
  # かんじょうにっき 完全版スキーマ

  1. 新しいテーブル
    - `users` - ユーザー情報
    - `diary_entries` - 日記エントリー
    - `counselors` - カウンセラー情報
    - `chat_rooms` - チャットルーム
    - `messages` - メッセージ
    - `consent_histories` - 同意履歴

  2. 追加フィールド
    - diary_entriesテーブルに以下のフィールドを追加
      - `counselor_memo` - カウンセラーのメモ
      - `assigned_counselor` - 担当カウンセラー
      - `urgency_level` - 緊急度
      - `is_visible_to_user` - ユーザーに表示するかどうか
      - `counselor_name` - メモを書いたカウンセラー名

  3. セキュリティ
    - すべてのテーブルでRLSを有効化
    - 簡易的なポリシーを設定（すべてのアクセスを許可）
*/

-- 1. 基本テーブルの作成
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    line_username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diary_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    emotion TEXT NOT NULL,
    event TEXT NOT NULL,
    realization TEXT NOT NULL,
    self_esteem_score INTEGER NOT NULL DEFAULT 50,
    worthlessness_score INTEGER NOT NULL DEFAULT 50,
    counselor_memo TEXT,
    assigned_counselor TEXT,
    urgency_level TEXT CHECK (urgency_level IN ('high', 'medium', 'low') OR urgency_level IS NULL),
    is_visible_to_user BOOLEAN DEFAULT false,
    counselor_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 管理機能用テーブルの作成
CREATE TABLE IF NOT EXISTS counselors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    counselor_id UUID REFERENCES counselors(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'waiting')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    counselor_id UUID REFERENCES counselors(id),
    content TEXT NOT NULL,
    is_counselor BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT messages_sender_check CHECK (
        (sender_id IS NOT NULL AND counselor_id IS NULL AND is_counselor = false) OR
        (sender_id IS NULL AND counselor_id IS NOT NULL AND is_counselor = true)
    )
);

-- 3. 同意履歴テーブルの作成
CREATE TABLE IF NOT EXISTS consent_histories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    line_username TEXT NOT NULL,
    consent_given BOOLEAN NOT NULL,
    consent_date TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_id ON diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_date ON diary_entries(date);
CREATE INDEX IF NOT EXISTS idx_diary_entries_emotion ON diary_entries(emotion);
CREATE INDEX IF NOT EXISTS idx_diary_entries_created_at ON diary_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_diary_entries_assigned_counselor ON diary_entries(assigned_counselor);
CREATE INDEX IF NOT EXISTS idx_diary_entries_urgency_level ON diary_entries(urgency_level);
CREATE INDEX IF NOT EXISTS idx_diary_entries_is_visible_to_user ON diary_entries(is_visible_to_user);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user_id ON chat_rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_room_id ON messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_consent_histories_username ON consent_histories(line_username);
CREATE INDEX IF NOT EXISTS idx_consent_histories_date ON consent_histories(consent_date);

-- 5. Row Level Security (RLS) を有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselors ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_histories ENABLE ROW LEVEL SECURITY;

-- 6. 既存のポリシーを安全に削除
DO $$ 
BEGIN
    -- users テーブルのポリシー削除
    DROP POLICY IF EXISTS "管理者は全ユーザーデータを閲覧可能" ON users;
    DROP POLICY IF EXISTS "ユーザーは自分のデータのみアクセス" ON users;
    DROP POLICY IF EXISTS "admin_users_access_v2" ON users;
    DROP POLICY IF EXISTS "user_own_data_access_v2" ON users;
    DROP POLICY IF EXISTS "users_policy_v3" ON users;
    
    -- diary_entries テーブルのポリシー削除
    DROP POLICY IF EXISTS "管理者は全日記データを閲覧可能" ON diary_entries;
    DROP POLICY IF EXISTS "ユーザーは自分の日記のみアクセス" ON diary_entries;
    DROP POLICY IF EXISTS "admin_diary_access_v2" ON diary_entries;
    DROP POLICY IF EXISTS "user_own_diary_access_v2" ON diary_entries;
    DROP POLICY IF EXISTS "diary_entries_policy_v3" ON diary_entries;
    
    -- その他のテーブルのポリシー削除
    DROP POLICY IF EXISTS "counselors_policy_v3" ON counselors;
    DROP POLICY IF EXISTS "chat_rooms_policy_v3" ON chat_rooms;
    DROP POLICY IF EXISTS "messages_policy_v3" ON messages;
    DROP POLICY IF EXISTS "consent_histories_policy_v3" ON consent_histories;
END $$;

-- 7. 新しいRLSポリシーの作成

-- ユーザーテーブル: 全てのユーザーが自分のデータにアクセス可能
CREATE POLICY "users_policy_v4" ON users
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- 日記テーブル: 全てのユーザーが全ての日記にアクセス可能（管理画面用）
CREATE POLICY "diary_entries_policy_v4" ON diary_entries
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- カウンセラーテーブル: 全てのユーザーがアクセス可能
CREATE POLICY "counselors_policy_v4" ON counselors
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- チャットルームテーブル: 全てのユーザーがアクセス可能
CREATE POLICY "chat_rooms_policy_v4" ON chat_rooms
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- メッセージテーブル: 全てのユーザーがアクセス可能
CREATE POLICY "messages_policy_v4" ON messages
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- 同意履歴テーブル: 全てのユーザーがアクセス可能（管理画面用）
CREATE POLICY "consent_histories_policy_v4" ON consent_histories
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- 8. カウンセラーの初期データ挿入
INSERT INTO counselors (name, email) VALUES
    ('心理カウンセラー仁', 'jin@namisapo.com'),
    ('心理カウンセラーAOI', 'aoi@namisapo.com'),
    ('心理カウンセラーあさみ', 'asami@namisapo.com'),
    ('心理カウンセラーSHU', 'shu@namisapo.com'),
    ('心理カウンセラーゆーちゃ', 'yucha@namisapo.com'),
    ('心理カウンセラーSammy', 'sammy@namisapo.com')
ON CONFLICT (email) DO NOTHING;

-- 9. テスト用ユーザーとデータの作成
INSERT INTO users (line_username) 
VALUES ('test_user_admin') 
ON CONFLICT (line_username) DO NOTHING;

-- テスト用日記エントリー
INSERT INTO diary_entries (user_id, date, emotion, event, realization, self_esteem_score, worthlessness_score)
SELECT 
    u.id,
    CURRENT_DATE,
    '無価値感',
    'テスト用の出来事です。管理画面での表示確認用のサンプルデータです。',
    'テスト用の気づきです。システムが正常に動作していることを確認できます。',
    30,
    70
FROM users u 
WHERE u.line_username = 'test_user_admin'
AND NOT EXISTS (
    SELECT 1 FROM diary_entries de 
    WHERE de.user_id = u.id 
    AND de.event LIKE 'テスト用の出来事です%'
);

-- コメント
COMMENT ON COLUMN diary_entries.counselor_memo IS 'カウンセラーのメモ';
COMMENT ON COLUMN diary_entries.assigned_counselor IS '担当カウンセラーの名前';
COMMENT ON COLUMN diary_entries.urgency_level IS '緊急度（high, medium, low）';
COMMENT ON COLUMN diary_entries.is_visible_to_user IS 'カウンセラーメモをユーザーに表示するかどうか';
COMMENT ON COLUMN diary_entries.counselor_name IS 'メモを書いたカウンセラーの名前';