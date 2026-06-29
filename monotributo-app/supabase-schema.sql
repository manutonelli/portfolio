-- Run this SQL in your Supabase SQL Editor to set up the database

-- User profiles
create table if not exists public.user_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  categoria text not null,
  fecha_inicio date not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Monthly income
create table if not exists public.ingresos_mensuales (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  anio integer not null,
  mes integer not null check (mes between 1 and 12),
  monto numeric(15,2) not null default 0,
  created_at timestamptz default now(),
  unique(user_id, anio, mes)
);

-- Monthly payments
create table if not exists public.pagos_mensuales (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  anio integer not null,
  mes integer not null check (mes between 1 and 12),
  pagado boolean not null default false,
  fecha_pago timestamptz,
  monto numeric(15,2) not null default 0,
  created_at timestamptz default now(),
  unique(user_id, anio, mes)
);

-- Row Level Security: users can only see their own data
alter table public.user_profiles enable row level security;
alter table public.ingresos_mensuales enable row level security;
alter table public.pagos_mensuales enable row level security;

create policy "Own profile" on public.user_profiles for all using (auth.uid() = user_id);
create policy "Own ingresos" on public.ingresos_mensuales for all using (auth.uid() = user_id);
create policy "Own pagos" on public.pagos_mensuales for all using (auth.uid() = user_id);
