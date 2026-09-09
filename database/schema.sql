create extension if not exists pgcrypto;

create type user_role as enum ('enumerator', 'supervisor', 'farmer');
create type risk_level as enum ('low', 'watch', 'alert', 'critical');
create type alert_status as enum ('created', 'acknowledged', 'investigating', 'resolved');
create type confidence_level as enum ('Low', 'Moderate', 'High');
create type verification_status as enum ('pending', 'under_review', 'verified', 'rejected');

create table counties (
  id text primary key,
  name text not null unique,
  region text not null,
  latitude numeric(8,5) not null,
  longitude numeric(8,5) not null,
  risk risk_level not null default 'low',
  rainfall_7d numeric(8,2) not null default 0 check (rainfall_7d >= 0),
  temperature_avg numeric(5,2) not null default 0,
  humidity numeric(5,2) not null default 0 check (humidity between 0 and 100),
  standing_water numeric(8,2) not null default 0 check (standing_water >= 0),
  suspected integer not null default 0 check (suspected >= 0),
  tested integer not null default 0 check (tested >= 0),
  positive integer not null default 0 check (positive >= 0 and positive <= tested),
  active_alerts integer not null default 0 check (active_alerts >= 0),
  pending_verification integer not null default 0 check (pending_verification >= 0),
  last_updated date not null default current_date
);

create table app_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  phone text,
  password_hash text not null,
  role user_role not null,
  organisation text not null,
  county_id text references counties(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table wards (
  id uuid primary key default gen_random_uuid(),
  county_id text not null references counties(id) on delete cascade,
  name text not null,
  unique (county_id, name)
);

create table warning_alerts (
  id text primary key,
  county_id text not null references counties(id) on delete restrict,
  ward_id uuid references wards(id) on delete set null,
  level risk_level not null,
  created_at timestamptz not null default now(),
  status alert_status not null default 'created',
  confidence confidence_level not null,
  indicators jsonb not null default '[]'::jsonb check (jsonb_typeof(indicators) = 'array'),
  expected_period text not null,
  recommended_actions jsonb not null default '[]'::jsonb check (jsonb_typeof(recommended_actions) = 'array'),
  assigned_team text not null,
  data_sources jsonb not null default '[]'::jsonb check (jsonb_typeof(data_sources) = 'array'),
  created_by uuid references app_users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table indicators (
  code text primary key,
  name text not null,
  baseline numeric(8,2) not null,
  endline numeric(8,2) not null,
  target numeric(8,2) not null,
  unit text not null,
  good_direction text not null check (good_direction in ('up', 'down'))
);

create table field_submissions (
  id text primary key,
  form_type text not null,
  enumerator_id uuid references app_users(id) on delete set null,
  enumerator_name text not null,
  county_id text not null references counties(id) on delete restrict,
  ward_id uuid references wards(id) on delete set null,
  status verification_status not null default 'pending',
  submitted_at timestamptz not null default now(),
  reviewed_by uuid references app_users(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object')
);

create table surveillance_reports (
  id uuid primary key default gen_random_uuid(),
  county_id text not null references counties(id) on delete restrict,
  period_start date not null,
  period_end date not null,
  suspected integer not null default 0 check (suspected >= 0),
  tested integer not null default 0 check (tested >= 0),
  positive integer not null default 0 check (positive >= 0 and positive <= tested),
  source_submission_id text references field_submissions(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (county_id, period_start, period_end),
  check (period_end >= period_start)
);

create table weather_observations (
  id uuid primary key default gen_random_uuid(),
  county_id text not null references counties(id) on delete restrict,
  ward_id uuid references wards(id) on delete set null,
  observed_at timestamptz not null,
  rainfall_mm numeric(8,2) not null default 0 check (rainfall_mm >= 0),
  temperature_c numeric(5,2),
  humidity numeric(5,2) check (humidity between 0 and 100),
  standing_water_count integer not null default 0 check (standing_water_count >= 0),
  source_submission_id text references field_submissions(id) on delete set null,
  recorded_by uuid references app_users(id) on delete set null
);

create index warning_alerts_county_status_idx on warning_alerts (county_id, status);
create index warning_alerts_created_at_idx on warning_alerts (created_at desc);
create index field_submissions_status_idx on field_submissions (status);
create index surveillance_reports_county_period_idx on surveillance_reports (county_id, period_end desc);
create index weather_observations_county_observed_idx on weather_observations (county_id, observed_at desc);

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger app_users_set_updated_at before update on app_users
for each row execute function set_updated_at();
create trigger warning_alerts_set_updated_at before update on warning_alerts
for each row execute function set_updated_at();