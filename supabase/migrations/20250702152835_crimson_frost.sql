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