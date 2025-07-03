/*
  # 日記エントリーの重複排除と一意制約の追加

  1. 変更内容
    - 重複している日記エントリーを削除
    - (user_id, date, event)の組み合わせに一意制約を追加
    - 同期エラーの防止

  2. 目的
    - データの重複を防止
    - 同期時の重複エントリー作成を防止
    - データベースの整合性確保
*/

-- 重複排除＋一意制約を追加するマイグレーション
BEGIN;

-- 1. (user_id, date, event) が重複している行を一つだけ残す
DELETE FROM diary_entries d
USING (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, date, event
           ORDER BY created_at   -- 最も古い行を残す
         ) AS rn
  FROM diary_entries
) t
WHERE d.id = t.id
  AND t.rn > 1;   -- 2行目以降を削除

-- 2. 今後の重複を防ぐ一意制約
ALTER TABLE diary_entries
  ADD CONSTRAINT diary_unique_user_date_event
  UNIQUE (user_id, date, event);

COMMIT;