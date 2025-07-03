-- 1. 管理者パネルの検索機能を修正するためのマイグレーション

-- 2. 日記エントリーのインデックスを最適化
CREATE INDEX IF NOT EXISTS idx_diary_entries_emotion_date_user ON diary_entries(emotion, date, user_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_counselor_memo_search ON diary_entries(counselor_memo);
CREATE INDEX IF NOT EXISTS idx_diary_entries_event_search ON diary_entries(event);
CREATE INDEX IF NOT EXISTS idx_diary_entries_realization_search ON diary_entries(realization);

-- 3. 日記エントリーのNULL値を修正
UPDATE diary_entries
SET 
  counselor_memo = COALESCE(counselor_memo, ''),
  counselor_name = COALESCE(counselor_name, ''),
  assigned_counselor = COALESCE(assigned_counselor, ''),
  urgency_level = COALESCE(urgency_level, ''),
  is_visible_to_user = COALESCE(is_visible_to_user, false),
  event = COALESCE(event, ''),
  realization = COALESCE(realization, ''),
  emotion = COALESCE(emotion, '不明');

-- 4. 日記エントリーのユーザー情報を保持するためのトリガー関数
CREATE OR REPLACE FUNCTION preserve_diary_user_info() RETURNS TRIGGER AS $$
BEGIN
    -- user_idが変更されないようにする
    IF TG_OP = 'UPDATE' THEN
        NEW.user_id := OLD.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. トリガーを作成
DROP TRIGGER IF EXISTS preserve_diary_user_info_trigger ON diary_entries;
CREATE TRIGGER preserve_diary_user_info_trigger
BEFORE UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION preserve_diary_user_info();

-- 6. コメント
COMMENT ON FUNCTION preserve_diary_user_info() IS '日記エントリーのユーザー情報が変更されないようにするトリガー関数';