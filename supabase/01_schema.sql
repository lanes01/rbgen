-- RBGen database schema — Stage 1
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query → paste → Run)

-- ── profiles ─────────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null default 'client' check (role in ('researcher', 'client')),
  full_name   text,
  email       text,
  country     text,
  created_at  timestamptz not null default now()
);

-- ── commissions ──────────────────────────────────────────────────────────────
create table public.commissions (
  id                        uuid primary key default gen_random_uuid(),
  client_id                 uuid not null references public.profiles(id) on delete cascade,
  package_type              text not null check (package_type in ('3gen', '6gen', 'extended', 'custom')),
  generations_requested     integer,
  surnames                  text[],
  known_locations           text,
  status                    text not null default 'enquiry'
                              check (status in ('enquiry', 'quoted', 'deposit_pending', 'active', 'report_writing', 'delivered', 'closed')),
  agreed_price              numeric(10,2),
  deposit_amount            numeric(10,2),
  deposit_paid              boolean not null default false,
  deposit_paid_at           timestamptz,
  balance_due_date          date,
  balance_paid              boolean not null default false,
  balance_paid_at           timestamptz,
  stripe_deposit_intent_id  text,
  stripe_balance_intent_id  text,
  brief_text                text,
  estimated_completion      date,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- ── individuals ──────────────────────────────────────────────────────────────
create table public.individuals (
  id            uuid primary key default gen_random_uuid(),
  commission_id uuid not null references public.commissions(id) on delete cascade,
  first_name    text not null,
  last_name     text not null,
  birth_year    integer,
  death_year    integer,
  birth_place   text,
  death_place   text,
  gender        text not null default 'unknown' check (gender in ('male', 'female', 'unknown')),
  generation    integer not null,
  notes         text,
  is_living     boolean not null default false,
  photo_url     text,
  created_at    timestamptz not null default now()
);

-- ── relationships ────────────────────────────────────────────────────────────
create table public.relationships (
  id                uuid primary key default gen_random_uuid(),
  commission_id     uuid not null references public.commissions(id) on delete cascade,
  individual_id_1   uuid not null references public.individuals(id) on delete cascade,
  individual_id_2   uuid not null references public.individuals(id) on delete cascade,
  relationship_type text not null check (relationship_type in ('parent', 'child', 'spouse', 'sibling'))
);

-- ── research_log ─────────────────────────────────────────────────────────────
create table public.research_log (
  id            uuid primary key default gen_random_uuid(),
  commission_id uuid not null references public.commissions(id) on delete cascade,
  logged_at     timestamptz not null default now(),
  source_name   text not null,
  source_type   text not null
                  check (source_type in ('civil_registration', 'census', 'parish', 'military', 'probate', 'immigration', 'newspaper', 'overseas', 'other')),
  search_terms  text,
  result        text not null check (result in ('found', 'not_found', 'partial')),
  notes         text,
  individual_id uuid references public.individuals(id) on delete set null
);

-- ── documents ────────────────────────────────────────────────────────────────
create table public.documents (
  id                    uuid primary key default gen_random_uuid(),
  commission_id         uuid not null references public.commissions(id) on delete cascade,
  individual_id         uuid references public.individuals(id) on delete set null,
  uploaded_by           uuid not null references public.profiles(id),
  file_name             text not null,
  file_url              text not null,
  file_type             text not null
                          check (file_type in ('certificate', 'census', 'photograph', 'letter', 'military', 'immigration', 'other')),
  description           text,
  year_approx           integer,
  is_final_report       boolean not null default false,
  is_family_tree_export boolean not null default false,
  created_at            timestamptz not null default now()
);

-- ── messages ─────────────────────────────────────────────────────────────────
create table public.messages (
  id            uuid primary key default gen_random_uuid(),
  commission_id uuid not null references public.commissions(id) on delete cascade,
  sender_id     uuid not null references public.profiles(id),
  body          text not null,
  read_at       timestamptz,
  created_at    timestamptz not null default now()
);

-- ── invoices ─────────────────────────────────────────────────────────────────
create table public.invoices (
  id                        uuid primary key default gen_random_uuid(),
  commission_id             uuid not null references public.commissions(id) on delete cascade,
  invoice_type              text not null check (invoice_type in ('deposit', 'balance')),
  amount                    numeric(10,2) not null,
  issued_at                 timestamptz not null default now(),
  paid_at                   timestamptz,
  stripe_payment_intent_id  text
);

-- ── Auto-create a profile row whenever a new auth user signs up ──────────────
-- New users default to role 'client'. Marcia's row is switched to 'researcher'
-- manually after her account is created via Supabase Auth invite.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, email)
  values (new.id, 'client', coalesce(new.raw_user_meta_data->>'full_name', ''), new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Auto-calculate deposit_amount as 50% of agreed_price ──────────────────────
create or replace function public.calculate_deposit()
returns trigger
language plpgsql
as $$
begin
  if new.agreed_price is not null then
    new.deposit_amount := round(new.agreed_price * 0.5, 2);
  end if;
  return new;
end;
$$;

create trigger set_deposit_amount
  before insert or update of agreed_price on public.commissions
  for each row execute procedure public.calculate_deposit();

-- ── Auto-set balance_due_date to 14 days after status becomes 'delivered' ────
create or replace function public.set_balance_due_date()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'delivered' and (old.status is distinct from 'delivered') then
    new.balance_due_date := (now() + interval '14 days')::date;
  end if;
  return new;
end;
$$;

create trigger set_balance_due
  before update of status on public.commissions
  for each row execute procedure public.set_balance_due_date();

-- ── Keep commissions.updated_at current ───────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger commissions_updated_at
  before update on public.commissions
  for each row execute procedure public.set_updated_at();
