-- かんじょうにっき 完全版スキーマ（修正版）
-- 既存のデータを保護しながら必要なテーブルとポリシーを作成

-- 1. 基本テーブルの作成
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    line_username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 日記エントリーテーブルの作成（すべてのカラムを含む）
CREATE TABLE IF NOT EXISTS diary_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    emotion TEXT NOT NULL,
    event TEXT NOT NULL,
    realization TEXT NOT NULL,
    self_esteem_score INTEGER DEFAULT 50,
    worthlessness_score INTEGER DEFAULT 50,
    counselor_memo TEXT,
    assigned_counselor TEXT,
    urgency_level TEXT CHECK (urgency_level IN ('high', 'medium', 'low') OR urgency_level IS NULL),
    is_visible_to_user BOOLEAN DEFAULT false,
    counselor_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. カウンセラーテーブルの作成
CREATE TABLE IF NOT EXISTS counselors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. チャットルームテーブルの作成
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    counselor_id UUID REFERENCES counselors(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'waiting')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. メッセージテーブルの作成
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    counselor_id UUID REFERENCES counselors(id),
    content TEXT NOT NULL,
    is_counselor BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 同意履歴テーブルの作成
CREATE TABLE IF NOT EXISTS consent_histories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    line_username TEXT NOT NULL,
    consent_given BOOLEAN NOT NULL,
    consent_date TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_diary_entries_user_id ON diary_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_date ON diary_entries(date);
CREATE INDEX IF NOT EXISTS idx_diary_entries_emotion ON diary_entries(emotion);
CREATE INDEX IF NOT EXISTS idx_diary_entries_assigned_counselor ON diary_entries(assigned_counselor);
CREATE INDEX IF NOT EXISTS idx_diary_entries_urgency_level ON diary_entries(urgency_level);
CREATE INDEX IF NOT EXISTS idx_diary_entries_is_visible_to_user ON diary_entries(is_visible_to_user);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_user_id ON chat_rooms(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_room_id ON messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_consent_histories_username ON consent_histories(line_username);

-- 8. Row Level Security (RLS) を有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE counselors ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_histories ENABLE ROW LEVEL SECURITY;

-- 9. RLSポリシーの作成（すべてのテーブルに対して全アクセスを許可）
CREATE POLICY "users_all_access" ON users FOR ALL USING (true);
CREATE POLICY "diary_entries_all_access" ON diary_entries FOR ALL USING (true);
CREATE POLICY "counselors_all_access" ON counselors FOR ALL USING (true);
CREATE POLICY "chat_rooms_all_access" ON chat_rooms FOR ALL USING (true);
CREATE POLICY "messages_all_access" ON messages FOR ALL USING (true);
CREATE POLICY "consent_histories_all_access" ON consent_histories FOR ALL USING (true);

-- 10. カウンセラーの初期データ挿入
INSERT INTO counselors (name, email) VALUES
    ('心理カウンセラー仁', 'jin@namisapo.com'),
    ('心理カウンセラーAOI', 'aoi@namisapo.com'),
    ('心理カウンセラーあさみ', 'asami@namisapo.com'),
    ('心理カウンセラーSHU', 'shu@namisapo.com'),
    ('心理カウンセラーゆーちゃ', 'yucha@namisapo.com'),
    ('心理カウンセラーSammy', 'sammy@namisapo.com')
ON CONFLICT (email) DO NOTHING;

-- 11. テスト用ユーザーの作成
INSERT INTO users (line_username) 
VALUES ('test_user') 
ON CONFLICT (line_username) DO NOTHING;

-- 12. コメント
COMMENT ON TABLE users IS 'ユーザー情報';
COMMENT ON TABLE diary_entries IS '日記エントリー';
COMMENT ON TABLE counselors IS 'カウンセラー情報';
COMMENT ON TABLE chat_rooms IS 'チャットルーム';
COMMENT ON TABLE messages IS 'メッセージ';
COMMENT ON TABLE consent_histories IS '同意履歴';

COMMENT ON COLUMN diary_entries.counselor_memo IS 'カウンセラーのメモ';
COMMENT ON COLUMN diary_entries.assigned_counselor IS '担当カウンセラーの名前';
COMMENT ON COLUMN diary_entries.urgency_level IS '緊急度（high, medium, low）';
COMMENT ON COLUMN diary_entries.is_visible_to_user IS 'カウンセラーメモをユーザーに表示するかどうか';
COMMENT ON COLUMN diary_entries.counselor_name IS 'メモを書いたカウンセラーの名前';