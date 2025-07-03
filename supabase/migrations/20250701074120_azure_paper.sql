/*
  # 管理者パネル表示問題の修正

  1. 変更内容
    - 日記エントリーのインデックスを最適化
    - NULL値を適切なデフォルト値に修正
    - 日記エントリーのユーザー情報を保持するためのトリガー関数を追加
    - RLSポリシーを更新

  2. 目的
    - 管理者パネルの日記タブと検索タブで日記が表示されない問題を解決
    - データの整合性を確保
    - 検索パフォーマンスの向上
*/

-- 1. 日記エントリーのインデックスを最適化
CREATE INDEX IF NOT EXISTS idx_diary_entries_emotion_date_user ON diary_entries(emotion, date, user_id);
CREATE INDEX IF NOT EXISTS idx_diary_entries_counselor_memo_search ON diary_entries(counselor_memo);
CREATE INDEX IF NOT EXISTS idx_diary_entries_event_search ON diary_entries(event);
CREATE INDEX IF NOT EXISTS idx_diary_entries_realization_search ON diary_entries(realization);

-- 2. 日記エントリーのNULL値を修正
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

-- 3. 日記エントリーのユーザー情報を保持するためのトリガー関数
CREATE OR REPLACE FUNCTION preserve_diary_user_info() RETURNS TRIGGER AS $$
BEGIN
    -- user_idが変更されないようにする
    IF TG_OP = 'UPDATE' THEN
        NEW.user_id := OLD.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. トリガーを作成
DROP TRIGGER IF EXISTS preserve_diary_user_info_trigger ON diary_entries;
CREATE TRIGGER preserve_diary_user_info_trigger
BEFORE UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION preserve_diary_user_info();

-- 5. 緊急度の値を検証するトリガー関数
CREATE OR REPLACE FUNCTION validate_urgency_level() RETURNS TRIGGER AS $$
BEGIN
    -- urgency_levelが無効な値の場合は空文字列に設定
    IF NEW.urgency_level IS NOT NULL AND NEW.urgency_level != '' AND NEW.urgency_level NOT IN ('high', 'medium', 'low') THEN
        NEW.urgency_level := '';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. トリガーを作成
DROP TRIGGER IF EXISTS validate_urgency_level_trigger ON diary_entries;
CREATE TRIGGER validate_urgency_level_trigger
BEFORE INSERT OR UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION validate_urgency_level();

-- 7. RLSポリシーの設定
DO $$ 
BEGIN
  -- 既存のポリシーを確認して削除
  BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "admin_panel_display_fix" ON diary_entries';
    EXECUTE 'DROP POLICY IF EXISTS "admin_panel_display_fix_final" ON diary_entries';
  EXCEPTION
    WHEN OTHERS THEN
      -- エラーを無視して続行
      NULL;
  END;
END $$;

-- 新しいポリシーを作成
CREATE POLICY "admin_panel_display_fix_v2" ON diary_entries
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 8. コメント
COMMENT ON FUNCTION preserve_diary_user_info() IS '日記エントリーのユーザー情報が変更されないようにするトリガー関数';
COMMENT ON FUNCTION validate_urgency_level() IS '緊急度の値を検証し、無効な値を空文字列に変換するトリガー関数';
COMMENT ON POLICY "admin_panel_display_fix_v2" ON diary_entries IS '認証済みユーザーが全ての日記エントリーにアクセスできるようにするポリシー';