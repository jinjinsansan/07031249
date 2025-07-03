-- 必要ならメモ列を追加（存在すればスキップ）
alter table diary_entries
  add column if not exists counselor_memo text,
  add column if not exists counselor_id uuid,
  add column if not exists counselor_updated_at timestamptz;

-- BEFORE UPDATE : user_id / username を変更させない
create or replace function prevent_owner_change()
returns trigger as $$
begin
  if new.user_id <> old.user_id then
    raise exception 'user_id is immutable';
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_prevent_owner_change on diary_entries;
create trigger trg_prevent_owner_change
  before update on diary_entries
  for each row execute function prevent_owner_change();