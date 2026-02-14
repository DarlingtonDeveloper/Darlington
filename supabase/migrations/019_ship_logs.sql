-- Ship Logs: daily build-in-public entries
create table ship_logs (
  id uuid default gen_random_uuid() primary key,
  date date unique not null,
  narrative text not null,
  projects jsonb not null default '[]',
  stats jsonb not null default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Public read access (no auth needed for ship log page)
alter table ship_logs enable row level security;

create policy "Ship logs are publicly readable"
  on ship_logs for select
  using (true);

-- Service role can insert/update (for Kai's cron)
create policy "Service role can manage ship logs"
  on ship_logs for all
  using (auth.role() = 'service_role');

-- Index for date lookups
create index idx_ship_logs_date on ship_logs (date desc);
