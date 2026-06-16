'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Overview ───────────────────────────────────────────────────────────────
export async function updateOverview(commissionId: string, formData: FormData) {
  const supabase = await createClient()

  const surnames = (formData.get('surnames') as string)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  await supabase
    .from('commissions')
    .update({
      status: formData.get('status') as string,
      generations_requested: formData.get('generations_requested')
        ? Number(formData.get('generations_requested'))
        : null,
      surnames: surnames.length ? surnames : null,
      known_locations: (formData.get('known_locations') as string) || null,
      brief_text: (formData.get('brief_text') as string) || null,
      estimated_completion: (formData.get('estimated_completion') as string) || null,
    })
    .eq('id', commissionId)

  revalidatePath(`/dashboard/commissions/${commissionId}`)
}

// ── Research Log ───────────────────────────────────────────────────────────
export async function addResearchLogEntry(commissionId: string, formData: FormData) {
  const supabase = await createClient()

  const individualId = formData.get('individual_id') as string

  await supabase.from('research_log').insert({
    commission_id: commissionId,
    individual_id: individualId || null,
    source_name: formData.get('source_name') as string,
    source_type: formData.get('source_type') as string,
    search_terms: (formData.get('search_terms') as string) || null,
    result: formData.get('result') as string,
    notes: (formData.get('notes') as string) || null,
    is_disputed: formData.get('is_disputed') === 'on',
  })

  revalidatePath(`/dashboard/commissions/${commissionId}/research-log`)
}

// ── Individuals ────────────────────────────────────────────────────────────
export async function addIndividual(commissionId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('individuals')
    .insert({
      commission_id: commissionId,
      first_name: formData.get('first_name') as string,
      last_name: formData.get('last_name') as string,
      birth_year: formData.get('birth_year') ? Number(formData.get('birth_year')) : null,
      death_year: formData.get('death_year') ? Number(formData.get('death_year')) : null,
      birth_place: (formData.get('birth_place') as string) || null,
      death_place: (formData.get('death_place') as string) || null,
      gender: formData.get('gender') as string,
      generation: Number(formData.get('generation')),
      notes: (formData.get('notes') as string) || null,
      is_living: formData.get('is_living') === 'on',
      is_sensitive: formData.get('is_sensitive') === 'on',
      proof_argument: (formData.get('proof_argument') as string) || null,
      created_by: user?.id,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  const photo = formData.get('photo') as File | null
  if (photo && photo.size > 0) {
    await uploadIndividualPhoto(commissionId, data.id, photo)
  }

  revalidatePath(`/dashboard/commissions/${commissionId}/individuals`)
}

export async function uploadIndividualPhoto(commissionId: string, individualId: string, photo: File) {
  const supabase = await createClient()

  const ext = photo.name.split('.').pop()
  const path = `${commissionId}/${individualId}/photo-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('commission-photos')
    .upload(path, photo, { upsert: true })

  if (uploadError) throw new Error(uploadError.message)

  await supabase.from('individuals').update({ photo_url: path }).eq('id', individualId)
}

export async function deleteIndividual(commissionId: string, individualId: string) {
  const supabase = await createClient()
  await supabase
    .from('individuals')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', individualId)

  revalidatePath(`/dashboard/commissions/${commissionId}/individuals`)
}

// ── Documents ──────────────────────────────────────────────────────────────
export async function uploadDocument(commissionId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const file = formData.get('file') as File
  if (!file || file.size === 0) throw new Error('No file selected')

  const path = `${commissionId}/${Date.now()}-${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('commission-documents')
    .upload(path, file)

  if (uploadError) throw new Error(uploadError.message)

  await supabase.from('documents').insert({
    commission_id: commissionId,
    individual_id: (formData.get('individual_id') as string) || null,
    uploaded_by: user?.id,
    file_name: file.name,
    file_url: path,
    file_type: formData.get('file_type') as string,
    description: (formData.get('description') as string) || null,
    year_approx: formData.get('year_approx') ? Number(formData.get('year_approx')) : null,
    is_final_report: formData.get('is_final_report') === 'on',
    is_family_tree_export: formData.get('is_family_tree_export') === 'on',
  })

  revalidatePath(`/dashboard/commissions/${commissionId}/documents`)
}

export async function deleteDocument(commissionId: string, documentId: string) {
  const supabase = await createClient()
  await supabase
    .from('documents')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', documentId)

  revalidatePath(`/dashboard/commissions/${commissionId}/documents`)
}

// ── Messages ───────────────────────────────────────────────────────────────
export async function sendMessage(commissionId: string, formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const body = formData.get('body') as string
  if (!body?.trim()) return

  await supabase.from('messages').insert({
    commission_id: commissionId,
    sender_id: user?.id,
    body: body.trim(),
  })

  revalidatePath(`/dashboard/commissions/${commissionId}/messages`)
}

// ── Payment ────────────────────────────────────────────────────────────────
export async function setAgreedPrice(commissionId: string, formData: FormData) {
  const supabase = await createClient()

  await supabase
    .from('commissions')
    .update({ agreed_price: Number(formData.get('agreed_price')) })
    .eq('id', commissionId)

  revalidatePath(`/dashboard/commissions/${commissionId}/payment`)
}
