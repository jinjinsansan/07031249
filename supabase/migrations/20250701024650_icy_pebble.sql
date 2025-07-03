/*
  # カウンセラーコメント同期問題の修正

  1. 変更内容
    - カウンセラーコメント関連のフィールドを確実に存在させる
    - カウンセラーコメントの同期エラーを修正するためのトリガー関数を追加
    - 既存のRLSポリシーを更新

  2. 目的
    - カウンセラーコメントがSupabaseに正しく保存されるようにする
    - 同期エラーの解決
    - データの整合性確保
*/

-- 1. カウンセラーコメント関連のフィールドを確実に存在させる
DO $$ 
BEGIN
  -- counselor_memoカラムの追加
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'counselor_memo'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN counselor_memo text;
  END IF;
  
  -- is_visible_to_userカラムの追加
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'is_visible_to_user'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN is_visible_to_user boolean DEFAULT false;
  END IF;
  
  -- counselor_nameカラムの追加
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'diary_entries' AND column_name = 'counselor_name'
  ) THEN
    ALTER TABLE diary_entries ADD COLUMN counselor_name text;
  END IF;
END $$;

-- 2. カウンセラーコメントの同期エラーを修正するためのトリガー関数
CREATE OR REPLACE FUNCTION handle_counselor_memo_update() RETURNS TRIGGER AS $$
BEGIN
    -- カウンセラーメモが更新された場合の処理
    IF NEW.counselor_memo IS DISTINCT FROM OLD.counselor_memo THEN
        RAISE LOG 'Counselor memo updated for diary entry %: % -> %', 
                 NEW.id, 
                 COALESCE(LEFT(OLD.counselor_memo, 20), 'NULL'), 
                 COALESCE(LEFT(NEW.counselor_memo, 20), 'NULL');
    END IF;
    
    -- 表示設定が更新された場合の処理
    IF NEW.is_visible_to_user IS DISTINCT FROM OLD.is_visible_to_user THEN
        RAISE LOG 'Visibility updated for diary entry %: % -> %', 
                 NEW.id, 
                 COALESCE(OLD.is_visible_to_user, false), 
                 COALESCE(NEW.is_visible_to_user, false);
    END IF;
    
    -- カウンセラー名が更新された場合の処理
    IF NEW.counselor_name IS DISTINCT FROM OLD.counselor_name THEN
        RAISE LOG 'Counselor name updated for diary entry %: % -> %', 
                 NEW.id, 
                 COALESCE(OLD.counselor_name, 'NULL'), 
                 COALESCE(NEW.counselor_name, 'NULL');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. トリガーを作成
DROP TRIGGER IF EXISTS counselor_memo_update_trigger ON diary_entries;
CREATE TRIGGER counselor_memo_update_trigger
AFTER UPDATE ON diary_entries
FOR EACH ROW
EXECUTE FUNCTION handle_counselor_memo_update();

-- 4. RLSポリシーの設定
DO $$ 
BEGIN
  -- diary_entries_all_accessポリシーが存在するか確認
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'diary_entries' AND policyname = 'diary_entries_all_access_v4'
  ) THEN
    -- ポリシーが存在しない場合のみ作成
    EXECUTE 'CREATE POLICY "diary_entries_all_access_v4" ON diary_entries
      FOR ALL 
      TO authenticated
      USING (true)
      WITH CHECK (true)';
  END IF;
END $$;

-- 5. コメント
COMMENT ON FUNCTION handle_counselor_memo_update() IS 'カウンセラーメモの更新をログに記録するトリガー関数';