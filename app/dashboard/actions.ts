'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function createCommission(formData: FormData) {
  const supabase = await createClient()

  const clientId = formData.get('client_id') as string
  const packageType = formData.get('package_type') as string
  const generationsRequested = formData.get('generations_requested') as string
  const surnames = (formData.get('surnames') as string)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const knownLocations = formData.get('known_locations') as string
  const briefText = formData.get('brief_text') as string

  const { data, error } = await supabase
    .from('commissions')
    .insert({
      client_id: clientId,
      package_type: packageType,
      generations_requested: generationsRequested ? Number(generationsRequested) : null,
      surnames: surnames.length ? surnames : null,
      known_locations: knownLocations || null,
      brief_text: briefText || null,
    })
    .select('id')
    .single()

  if (error) {
    redirect(`/dashboard/commissions/new?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/dashboard/commissions')
  redirect(`/dashboard/commissions/${data.id}`)
}
