-- User profiles (manual location override)
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  manual_latitude double precision,
  manual_longitude double precision,
  manual_location_label text,
  use_manual_location boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "users can manage their own profile"
  on public.user_profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile on sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.user_profiles (id) values (new.id);
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Symptom logs
create table if not exists public.symptom_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  logged_at timestamptz not null default now(),
  score smallint not null check (score >= 0 and score <= 5),
  latitude double precision not null,
  longitude double precision not null,
  location_label text
);

alter table public.symptom_logs enable row level security;

create policy "users can manage their own symptom logs"
  on public.symptom_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index symptom_logs_user_logged_at on public.symptom_logs (user_id, logged_at desc);
