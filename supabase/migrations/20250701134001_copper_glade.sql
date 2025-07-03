-- 所有者列の不変制約
create or replace function prevent_owner_change()
returns trigger as $$
begin
  if new.user_id <> old.user_id then
    raise exception 'immutable user_id';
  end if;
  if new.username <> old.username then
    raise exception 'immutable username';
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_owner_diary on diary_entries;
create trigger trg_owner_diary
  before update on diary_entries
  for each row execute function prevent_owner_change();