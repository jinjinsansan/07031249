/*
  # 日記削除同期機能の追加

  1. 変更内容
    - 日記削除ログテーブルの作成
    - 削除トリガーの追加
    - 古いログの自動クリーンアップ機能

  2. 目的
    - 日記削除操作の追跡
    - 同期エラーの検出と修復
    - データ整合性の確保
*/

-- 1. 削除ログテーブルの作成
CREATE TABLE IF NOT EXISTS diary_delete_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    diary_id UUID NOT NULL,
    user_id UUID,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_by TEXT,
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'completed', 'failed')),
    error_message TEXT
);

-- 2. 削除ログテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_diary_delete_logs_diary_id ON diary_delete_logs(diary_id);
CREATE INDEX IF NOT EXISTS idx_diary_delete_logs_user_id ON diary_delete_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_diary_delete_logs_sync_status ON diary_delete_logs(sync_status);

-- 3. 削除トリガー関数
CREATE OR REPLACE FUNCTION log_diary_deletion() RETURNS TRIGGER AS $$
BEGIN
    -- 削除された日記の情報をログに記録
    INSERT INTO diary_delete_logs (diary_id, user_id, deleted_by)
    VALUES (OLD.id, OLD.user_id, current_user);
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 4. 削除トリガーの作成
DROP TRIGGER IF EXISTS diary_deletion_trigger ON diary_entries;
CREATE TRIGGER diary_deletion_trigger
BEFORE DELETE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION log_diary_deletion();

-- 5. 削除ログの自動クリーンアップ関数
CREATE OR REPLACE FUNCTION cleanup_old_delete_logs() RETURNS TRIGGER AS $$
BEGIN
    -- 30日以上経過した削除ログを削除
    DELETE FROM diary_delete_logs
    WHERE deleted_at < NOW() - INTERVAL '30 days';
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 6. 削除ログクリーンアップトリガーの作成
DROP TRIGGER IF EXISTS diary_delete_logs_cleanup_trigger ON diary_delete_logs;
CREATE TRIGGER diary_delete_logs_cleanup_trigger
AFTER INSERT ON diary_delete_logs
FOR EACH STATEMENT
EXECUTE FUNCTION cleanup_old_delete_logs();

-- 7. RLSポリシーの設定
ALTER TABLE diary_delete_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diary_delete_logs_all_access" ON diary_delete_logs
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- 8. コメント
COMMENT ON TABLE diary_delete_logs IS '日記削除操作のログを記録するテーブル';
COMMENT ON FUNCTION log_diary_deletion() IS '日記削除時に自動的にログを記録するトリガー関数';
COMMENT ON FUNCTION cleanup_old_delete_logs() IS '古い削除ログを自動的にクリーンアップするトリガー関数';