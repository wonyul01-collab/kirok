-- 007_inquiries.sql
-- Website contact form (https://wonyul01-collab.github.io/kirok/support/).
-- The public site posts with the publishable (anon) key via PostgREST: POST /rest/v1/inquiries, Prefer: return=minimal.
-- anon may only INSERT. No SELECT/UPDATE/DELETE for anon or authenticated; read inquiries from the dashboard (service role).
-- Not applied automatically. Apply once in the Supabase SQL editor.

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category text not null default '기타'
    check (char_length(category) between 1 and 20),
  message text not null
    check (char_length(btrim(message)) between 2 and 1000),
  contact text
    check (contact is null or char_length(contact) <= 100),
  page text
    check (page is null or char_length(page) <= 200),
  handled boolean not null default false
);

comment on table public.inquiries is 'Website contact form messages. anon: insert only.';

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_message_md5_idx on public.inquiries (md5(message), created_at desc);

alter table public.inquiries enable row level security;

-- Grants: anon gets INSERT only (and only on the columns the form sends).
revoke all on table public.inquiries from anon, authenticated;
grant insert (category, message, contact, page) on table public.inquiries to anon;

drop policy if exists inquiries_anon_insert on public.inquiries;
create policy inquiries_anon_insert on public.inquiries
  for insert to anon
  with check (handled = false);

-- Repeat guard: the same message within 60 seconds is rejected,
-- and a global cap of 30 rows per minute limits flooding.
create or replace function public.inquiries_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.message := btrim(new.message);
  new.contact := nullif(btrim(coalesce(new.contact, '')), '');
  new.handled := false;
  new.created_at := now();

  if exists (
    select 1 from public.inquiries i
    where md5(i.message) = md5(new.message)
      and i.created_at > now() - interval '60 seconds'
  ) then
    raise exception 'duplicate inquiry within 60 seconds' using errcode = 'P0001';
  end if;

  if (select count(*) from public.inquiries i where i.created_at > now() - interval '60 seconds') >= 30 then
    raise exception 'too many inquiries, try again later' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function public.inquiries_guard() from public, anon, authenticated;

drop trigger if exists inquiries_guard_trg on public.inquiries;
create trigger inquiries_guard_trg
  before insert on public.inquiries
  for each row execute function public.inquiries_guard();

-- Check after applying (as service role):
-- select id, created_at, category, left(message, 40), contact, page, handled from public.inquiries order by created_at desc limit 20;
-- Expected for anon: insert -> 201, select -> 401/permission denied or empty.
