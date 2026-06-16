-- RBGen Stage 1.5 schema enhancements
-- Run this in the Supabase SQL Editor AFTER 01_schema.sql, 02_rls.sql, 03_storage.sql
-- Adds: events table, citations table, soft deletes, sensitive flag,
-- proof_argument, disputed-evidence flag, lightweight audit (created_by).

-- ── events ───────────────────────────────────────────────────────────────────
-- Marriage, baptism, emigration, occupation, military service etc. — anything
-- beyond birth/death that belongs to an individual.
create table public.events (
  id                     uuid primary key default gen_random_uuid(),
  commission_id          uuid not null references public.commissions(id) on delete cascade,
  individual_id          uuid not null references public.individuals(id) on delete cascade,
  related_individual_id  uuid references public.individuals(id) on delete set null,
  event_type             text not null
                            check (event_type in ('marriage','baptism','emigration','immigration','occupation','military_service','other')),
  event_date             text,
  event_place            text,
  notes                  text,
  created_by             uuid references public.profiles(id),
  created_at             timestamptz not null default now()
);

-- ── citations ────────────────────────────────────────────────────────────────
-- Formal source citations, attachable to a research_log entry and/or an individual.
create table public.citations (
  id              uuid primary key default gen_random_uuid(),
  commission_id   uuid not null references public.commissions(id) on delete cascade,
  research_log_id uuid references public.research_log(id) on delete cascade,
  individual_id   uuid references public.individuals(id) on delete cascade,
  citation_text   text not null,
  source_url      text,
  created_by      uuid references public.profiles(id),
  created_at      timestamptz not null default now()
);

-- ── soft deletes ─────────────────────────────────────────────────────────────
alter table public.individuals add column deleted_at timestamptz;
alter table public.documents   add column deleted_at timestamptz;
alter table public.commissions add column deleted_at timestamptz;

-- ── sensitive data flag (adoption, illegitimacy, medical, criminal, etc.) ────
alter table public.individuals add column is_sensitive boolean not null default false;

-- ── narrative reasoning / proof argument per individual ──────────────────────
alter table public.individuals add column proof_argument text;

-- ── conflicting / disputed evidence flag on a research log entry ─────────────
alter table public.research_log add column is_disputed boolean not null default false;

-- ── lightweight audit trail ───────────────────────────────────────────────────
alter table public.individuals  add column created_by uuid references public.profiles(id);
alter table public.research_log add column created_by uuid references public.profiles(id);

-- ── RLS: events ──────────────────────────────────────────────────────────────
alter table public.events enable row level security;

create policy "Researcher full access to events"
  on public.events for all
  using (public.is_researcher())
  with check (public.is_researcher());

create policy "Clients view events in their commission"
  on public.events for select
  using (
    exists (
      select 1 from public.commissions c
      where c.id = events.commission_id and c.client_id = auth.uid()
    )
  );

-- ── RLS: citations ───────────────────────────────────────────────────────────
alter table public.citations enable row level security;

create policy "Researcher full access to citations"
  on public.citations for all
  using (public.is_researcher())
  with check (public.is_researcher());

create policy "Clients view citations in their commission"
  on public.citations for select
  using (
    exists (
      select 1 from public.commissions c
      where c.id = citations.commission_id and c.client_id = auth.uid()
    )
  );

-- ── Update client-facing SELECT policies to hide soft-deleted rows ───────────
-- Researcher policies already grant full access regardless of deleted_at,
-- so the researcher can still see and restore soft-deleted records.

drop policy if exists "Clients view individuals in their commission" on public.individuals;
create policy "Clients view individuals in their commission"
  on public.individuals for select
  using (
    deleted_at is null
    and exists (
      select 1 from public.commissions c
      where c.id = individuals.commission_id and c.client_id = auth.uid()
    )
  );

drop policy if exists "Clients view relevant documents" on public.documents;
create policy "Clients view relevant documents"
  on public.documents for select
  using (
    deleted_at is null
    and exists (
      select 1 from public.commissions c
      where c.id = documents.commission_id and c.client_id = auth.uid()
    )
    and (
      uploaded_by = auth.uid()
      or is_final_report = true
      or is_family_tree_export = true
    )
  );

drop policy if exists "Clients view own commissions" on public.commissions;
create policy "Clients view own commissions"
  on public.commissions for select
  using (deleted_at is null and client_id = auth.uid());
