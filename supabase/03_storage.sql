-- RBGen storage buckets — Stage 1
-- Run this in the Supabase SQL Editor AFTER 01_schema.sql and 02_rls.sql
-- File naming convention in every bucket: {commission_id}/{individual_id_or_type}/{filename}

insert into storage.buckets (id, name, public)
values
  ('commission-documents', 'commission-documents', false),
  ('commission-photos',    'commission-photos',    false),
  ('report-exports',       'report-exports',       false);

-- ── commission-documents — researcher full access, client view + upload ──────
create policy "Researcher full access to commission-documents"
  on storage.objects for all
  using (bucket_id = 'commission-documents' and public.is_researcher())
  with check (bucket_id = 'commission-documents' and public.is_researcher());

create policy "Clients view own commission-documents"
  on storage.objects for select
  using (
    bucket_id = 'commission-documents'
    and exists (
      select 1 from public.commissions c
      where c.id::text = (storage.foldername(name))[1] and c.client_id = auth.uid()
    )
  );

create policy "Clients upload to own commission-documents"
  on storage.objects for insert
  with check (
    bucket_id = 'commission-documents'
    and exists (
      select 1 from public.commissions c
      where c.id::text = (storage.foldername(name))[1] and c.client_id = auth.uid()
    )
  );

-- ── commission-photos — researcher full access, client view only ─────────────
create policy "Researcher full access to commission-photos"
  on storage.objects for all
  using (bucket_id = 'commission-photos' and public.is_researcher())
  with check (bucket_id = 'commission-photos' and public.is_researcher());

create policy "Clients view own commission-photos"
  on storage.objects for select
  using (
    bucket_id = 'commission-photos'
    and exists (
      select 1 from public.commissions c
      where c.id::text = (storage.foldername(name))[1] and c.client_id = auth.uid()
    )
  );

-- ── report-exports — researcher full access, client view only ────────────────
create policy "Researcher full access to report-exports"
  on storage.objects for all
  using (bucket_id = 'report-exports' and public.is_researcher())
  with check (bucket_id = 'report-exports' and public.is_researcher());

create policy "Clients view own report-exports"
  on storage.objects for select
  using (
    bucket_id = 'report-exports'
    and exists (
      select 1 from public.commissions c
      where c.id::text = (storage.foldername(name))[1] and c.client_id = auth.uid()
    )
  );
