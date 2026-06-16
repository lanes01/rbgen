-- RBGen Row Level Security policies — Stage 1
-- Run this in the Supabase SQL Editor AFTER 01_schema.sql

-- ── Helper: check if current user is the researcher ──────────────────────────
-- security definer so it can read profiles without recursing through this
-- table's own RLS policies.
create or replace function public.is_researcher()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'researcher'
  );
$$;

-- ── profiles ─────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;

create policy "View own profile, researcher views all"
  on public.profiles for select
  using (id = auth.uid() or public.is_researcher());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Prevent a client from elevating their own role via a direct update.
-- Only the service role (used server-side) can change role.
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and auth.role() <> 'service_role' then
    raise exception 'Cannot change role directly';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row execute procedure public.prevent_role_change();

-- ── commissions ──────────────────────────────────────────────────────────────
alter table public.commissions enable row level security;

create policy "Researcher full access to commissions"
  on public.commissions for all
  using (public.is_researcher())
  with check (public.is_researcher());

create policy "Clients view own commissions"
  on public.commissions for select
  using (client_id = auth.uid());

create policy "Clients create own commissions"
  on public.commissions for insert
  with check (client_id = auth.uid());

-- ── individuals ──────────────────────────────────────────────────────────────
alter table public.individuals enable row level security;

create policy "Researcher full access to individuals"
  on public.individuals for all
  using (public.is_researcher())
  with check (public.is_researcher());

create policy "Clients view individuals in their commission"
  on public.individuals for select
  using (
    exists (
      select 1 from public.commissions c
      where c.id = individuals.commission_id and c.client_id = auth.uid()
    )
  );

-- ── relationships ────────────────────────────────────────────────────────────
alter table public.relationships enable row level security;

create policy "Researcher full access to relationships"
  on public.relationships for all
  using (public.is_researcher())
  with check (public.is_researcher());

create policy "Clients view relationships in their commission"
  on public.relationships for select
  using (
    exists (
      select 1 from public.commissions c
      where c.id = relationships.commission_id and c.client_id = auth.uid()
    )
  );

-- ── research_log ─────────────────────────────────────────────────────────────
alter table public.research_log enable row level security;

create policy "Researcher full access to research_log"
  on public.research_log for all
  using (public.is_researcher())
  with check (public.is_researcher());

create policy "Clients view research_log in their commission"
  on public.research_log for select
  using (
    exists (
      select 1 from public.commissions c
      where c.id = research_log.commission_id and c.client_id = auth.uid()
    )
  );

-- ── documents ────────────────────────────────────────────────────────────────
alter table public.documents enable row level security;

create policy "Researcher full access to documents"
  on public.documents for all
  using (public.is_researcher())
  with check (public.is_researcher());

create policy "Clients view relevant documents"
  on public.documents for select
  using (
    exists (
      select 1 from public.commissions c
      where c.id = documents.commission_id and c.client_id = auth.uid()
    )
    and (
      uploaded_by = auth.uid()
      or is_final_report = true
      or is_family_tree_export = true
    )
  );

create policy "Clients upload documents to their commission"
  on public.documents for insert
  with check (
    exists (
      select 1 from public.commissions c
      where c.id = documents.commission_id and c.client_id = auth.uid()
    )
  );

-- ── messages ─────────────────────────────────────────────────────────────────
alter table public.messages enable row level security;

create policy "Researcher full access to messages"
  on public.messages for all
  using (public.is_researcher())
  with check (public.is_researcher());

create policy "Clients view messages in their commission"
  on public.messages for select
  using (
    exists (
      select 1 from public.commissions c
      where c.id = messages.commission_id and c.client_id = auth.uid()
    )
  );

create policy "Clients send messages in their commission"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.commissions c
      where c.id = messages.commission_id and c.client_id = auth.uid()
    )
  );

-- ── invoices ─────────────────────────────────────────────────────────────────
alter table public.invoices enable row level security;

create policy "Researcher full access to invoices"
  on public.invoices for all
  using (public.is_researcher())
  with check (public.is_researcher());

create policy "Clients view their invoices"
  on public.invoices for select
  using (
    exists (
      select 1 from public.commissions c
      where c.id = invoices.commission_id and c.client_id = auth.uid()
    )
  );
