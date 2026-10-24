-- Snapshot archive for personal sandbox play. NOT an authoritative economy ledger.
create table public.family_saves (
 id uuid primary key,
 owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
 name text not null check (length(name) between 1 and 60),
 revision bigint not null default 1 check (revision > 0),
 snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object' and snapshot->>'version' = '1' and octet_length(snapshot::text) < 1048576),
 updated_at timestamptz not null default now(),
 economy_trust text not null default 'unverified_sandbox' check (economy_trust = 'unverified_sandbox')
);
create index family_saves_owner on public.family_saves(owner_id);
alter table public.family_saves enable row level security;
create policy own_saves_read on public.family_saves for select to authenticated using (owner_id = auth.uid());
-- All writes must use compare-and-swap RPC, never raw client table updates.
revoke all on public.family_saves from anon, authenticated;
grant select on public.family_saves to authenticated;
create function public.save_family(p_id uuid, p_name text, p_snapshot jsonb, p_expected_revision bigint)
returns setof public.family_saves language plpgsql security definer set search_path = '' as $$
declare caller uuid := auth.uid();
begin
 if caller is null then raise exception 'authentication required' using errcode = '42501'; end if;
 if p_expected_revision = 0 then
   return query insert into public.family_saves(id, owner_id, name, snapshot) values (p_id, caller, p_name, p_snapshot) on conflict (id) do nothing returning *;
 else
   return query update public.family_saves set name=p_name, snapshot=p_snapshot, revision=revision+1, updated_at=now()
   where id=p_id and owner_id=caller and revision=p_expected_revision returning *;
 end if;
end $$;
revoke all on function public.save_family(uuid,text,jsonb,bigint) from public;
grant execute on function public.save_family(uuid,text,jsonb,bigint) to authenticated;
comment on table public.family_saves is 'Untrusted personal sandbox snapshots. Do not use for rankings, payments or multiplayer. Server-authoritative command ledger is a later milestone.';
