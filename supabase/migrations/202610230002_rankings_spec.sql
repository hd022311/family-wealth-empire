-- Forward-compatible ranking schema; no live ranking or score submission endpoint.
create table public.leaderboard_definitions (
 id text primary key check(id in ('net-worth','legacy','generations','business','risk','returns')),
 title text not null, metric_version text not null, specification jsonb not null,
 enabled boolean not null default false
);
create table public.ranking_seasons (
 id uuid primary key, title text not null, starts_at timestamptz not null, ends_at timestamptz not null,
 market text not null check(market in ('real','virtual')), difficulty text not null check(difficulty in ('standard','hard')),
 scenario_hash text not null, rules_version text not null, initial_state_hash text not null,
 seed_commitment text not null, price_path_hash text not null,
 standard_months integer not null check(standard_months>0),
 status text not null default 'planned' check(status in ('planned','active','settled')),
 check(ends_at>starts_at),
 unique(starts_at,market,difficulty,scenario_hash,rules_version,standard_months)
);
create table public.family_public_profiles (
 id uuid primary key, owner_id uuid not null references auth.users(id) on delete cascade,
 nickname text not null check(length(nickname) between 1 and 30),
 family_name text not null check(length(family_name) between 1 and 60),
 public_consent boolean not null default false
);
create table public.score_verifications (
 id uuid primary key, family_id uuid not null references public.family_public_profiles(id) on delete cascade,
 season_id uuid not null references public.ranking_seasons(id),
 board_id text not null references public.leaderboard_definitions(id),
 verified_score numeric not null check(verified_score::text not in ('NaN','Infinity','-Infinity')),
 standard_month integer not null check(standard_month>0),
 command_log_hash text not null, verifier_version text not null, verified_at timestamptz not null,
 unique(id,season_id,board_id,family_id)
);
create table public.ranking_snapshots (
 id uuid primary key, season_id uuid not null, board_id text not null, family_id uuid not null,
 verification_id uuid not null,
 as_of timestamptz not null, rank bigint not null check(rank>0), previous_rank bigint check(previous_rank>0),
 participant_count bigint not null check(participant_count>0), percentile numeric not null check(percentile between 0 and 100),
 foreign key(verification_id,season_id,board_id,family_id) references public.score_verifications(id,season_id,board_id,family_id),
 check(rank<=participant_count), unique(season_id,board_id,as_of,family_id)
);
create index ranking_snapshot_page on public.ranking_snapshots(season_id,board_id,as_of desc,rank);
create table public.player_achievements (
 id uuid primary key, family_id uuid not null references public.family_public_profiles(id) on delete cascade,
 achievement_key text not null, title text not null, awarded_at timestamptz not null,
 verification_id uuid not null references public.score_verifications(id),
 public_consent boolean not null default false,
 unique(family_id,achievement_key)
);
alter table public.leaderboard_definitions enable row level security;
alter table public.ranking_seasons enable row level security;
alter table public.family_public_profiles enable row level security;
alter table public.score_verifications enable row level security;
alter table public.ranking_snapshots enable row level security;
alter table public.player_achievements enable row level security;
revoke all on public.leaderboard_definitions, public.ranking_seasons, public.family_public_profiles, public.score_verifications, public.ranking_snapshots, public.player_achievements from anon,authenticated;
grant select on public.leaderboard_definitions,public.ranking_seasons to anon,authenticated;
create policy definitions_read on public.leaderboard_definitions for select to anon,authenticated using (true);
create policy seasons_read on public.ranking_seasons for select to anon,authenticated using (true);
grant select on public.family_public_profiles to authenticated;
create policy own_public_profile on public.family_public_profiles for select to authenticated using(owner_id=auth.uid());
-- Definer views intentionally expose only consent-filtered, non-identifying fields.
create view public.public_family_cards with (security_barrier=true) as
 select id,nickname,family_name from public.family_public_profiles where public_consent;
create view public.public_rankings with (security_barrier=true) as
 select s.season_id,s.board_id,s.as_of,s.rank,s.previous_rank,s.participant_count,s.percentile,
 p.id as family_id,p.nickname,p.family_name,v.verified_score
 from public.ranking_snapshots s join public.score_verifications v on v.id=s.verification_id
 join public.family_public_profiles p on p.id=s.family_id where p.public_consent;
create view public.public_achievements with (security_barrier=true) as
 select a.family_id,a.achievement_key,a.title,a.awarded_at from public.player_achievements a
 join public.family_public_profiles p on p.id=a.family_id where a.public_consent and p.public_consent;
grant select on public.public_family_cards,public.public_rankings,public.public_achievements to anon,authenticated;
-- Personal placement is visible only to the authenticated owner even without public consent.
create view public.my_rankings with (security_barrier=true) as
 select s.season_id,s.board_id,s.as_of,s.rank,s.previous_rank,s.participant_count,s.percentile,v.verified_score,p.id as family_id
 from public.ranking_snapshots s join public.score_verifications v on v.id=s.verification_id
 join public.family_public_profiles p on p.id=s.family_id where p.owner_id=auth.uid();
grant select on public.my_rankings to authenticated;
create function public.set_family_visibility(p_family uuid,p_consent boolean)
returns boolean language plpgsql security definer set search_path='' as $$
begin
 update public.family_public_profiles set public_consent=p_consent where id=p_family and owner_id=auth.uid();
 return found;
end $$;
revoke all on function public.set_family_visibility(uuid,boolean) from public;
grant execute on function public.set_family_visibility(uuid,boolean) to authenticated;
-- No user INSERT/UPDATE policies or RPC for scores, snapshots, achievements or verifications.
-- Only a trusted server may compute scores from validated commands and issue receipts.
-- Offline sandbox snapshots must NEVER be promoted into score_verifications.
