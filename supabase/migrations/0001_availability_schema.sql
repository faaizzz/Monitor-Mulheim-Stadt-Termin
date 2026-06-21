-- Apply via the Supabase SQL editor (or `supabase db push`) after creating
-- the project. See CLAUDE.md / README for how this fits into the sync job.

create table public.current_status (
  slug text primary key,
  tab text not null,
  name text not null,
  status text not null check (status in ('available','no-slot','error')),
  termin_raw text,
  termin_date date,
  error_message text,
  checked_at timestamptz not null default now()
);

create table public.availability_events (
  id bigint generated always as identity primary key,
  slug text not null references public.current_status(slug),
  tab text not null,
  name text not null,
  previous_status text,
  new_status text not null check (new_status in ('available','no-slot','error')),
  termin_raw text,
  termin_date date,
  error_message text,
  transitioned_at timestamptz not null default now()
);
create index on public.availability_events (slug, transitioned_at desc);
create index on public.availability_events (transitioned_at desc);

-- Derived view: how long each "available" window lasted, per slug
create view public.availability_windows as
select
  slug, tab, name,
  transitioned_at as available_at,
  lead(transitioned_at) over (partition by slug order by transitioned_at) as ended_at,
  lead(transitioned_at) over (partition by slug order by transitioned_at) - transitioned_at as duration
from public.availability_events
where new_status = 'available';

-- Derived view: per-slug aggregate stats for the dashboard's historical view
create view public.daily_availability_summary as
select
  slug, tab, name,
  date_trunc('day', transitioned_at) as day,
  count(*) filter (where new_status = 'available') as became_available_count,
  count(*) filter (where new_status = 'error') as error_count
from public.availability_events
group by slug, tab, name, date_trunc('day', transitioned_at);

alter table public.current_status enable row level security;
alter table public.availability_events enable row level security;
create policy "public read current_status" on public.current_status for select using (true);
create policy "public read availability_events" on public.availability_events for select using (true);
-- No insert/update policy for anon/authenticated -> only the service_role key (used by the sync job) can write.

-- Enable Realtime on current_status so the dashboard's "current status" view updates live.
alter publication supabase_realtime add table public.current_status;
