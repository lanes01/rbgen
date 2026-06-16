import { createClient } from '@/lib/supabase/server'
import { addIndividual, deleteIndividual } from '../actions'

export default async function IndividualsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: individuals } = await supabase
    .from('individuals')
    .select('*')
    .eq('commission_id', id)
    .is('deleted_at', null)
    .order('generation')
    .order('last_name')

  const withPhotoUrls = await Promise.all(
    (individuals ?? []).map(async (ind) => {
      if (!ind.photo_url) return { ...ind, signedUrl: null }
      const { data } = await supabase.storage
        .from('commission-photos')
        .createSignedUrl(ind.photo_url, 3600)
      return { ...ind, signedUrl: data?.signedUrl ?? null }
    })
  )

  const add = addIndividual.bind(null, id)
  const remove = deleteIndividual.bind(null, id)

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-rbgen-parchment font-medium mb-3">Add Individual</h2>
        <form action={add} className="space-y-3" encType="multipart/form-data">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-rbgen-parchment/70 mb-1">First name</label>
              <input
                type="text"
                name="first_name"
                required
                className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
              />
            </div>
            <div>
              <label className="block text-sm text-rbgen-parchment/70 mb-1">Last name</label>
              <input
                type="text"
                name="last_name"
                required
                className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-rbgen-parchment/70 mb-1">Generation</label>
              <input
                type="number"
                name="generation"
                min="1"
                required
                className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
              />
            </div>
            <div>
              <label className="block text-sm text-rbgen-parchment/70 mb-1">Gender</label>
              <select
                name="gender"
                defaultValue="unknown"
                className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-rbgen-parchment/70 mb-1">Birth year</label>
              <input
                type="number"
                name="birth_year"
                className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
              />
            </div>
            <div>
              <label className="block text-sm text-rbgen-parchment/70 mb-1">Death year</label>
              <input
                type="number"
                name="death_year"
                className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-rbgen-parchment/70 mb-1">Birth place</label>
              <input
                type="text"
                name="birth_place"
                className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
              />
            </div>
            <div>
              <label className="block text-sm text-rbgen-parchment/70 mb-1">Death place</label>
              <input
                type="text"
                name="death_place"
                className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-rbgen-parchment/70 mb-1">Photo</label>
            <input
              type="file"
              name="photo"
              accept="image/*"
              className="w-full text-rbgen-parchment/70 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-rbgen-parchment/70 mb-1">Proof argument / reasoning</label>
            <textarea
              name="proof_argument"
              rows={2}
              className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
            />
          </div>

          <div>
            <label className="block text-sm text-rbgen-parchment/70 mb-1">Notes</label>
            <textarea
              name="notes"
              rows={2}
              className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-rbgen-parchment/70">
              <input type="checkbox" name="is_living" />
              Living
            </label>
            <label className="flex items-center gap-2 text-sm text-rbgen-parchment/70">
              <input type="checkbox" name="is_sensitive" />
              Sensitive record
            </label>
          </div>

          <button
            type="submit"
            className="bg-rbgen-gold hover:bg-rbgen-gold-bright text-rbgen-dark font-semibold px-5 py-2 rounded transition-colors"
          >
            Add Individual
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-rbgen-parchment font-medium mb-3">
          Individuals ({withPhotoUrls.length})
        </h2>
        {withPhotoUrls.length === 0 ? (
          <p className="text-rbgen-parchment/50 text-sm">No individuals added yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {withPhotoUrls.map((ind) => (
              <div
                key={ind.id}
                className="border border-rbgen-gold/20 rounded-lg p-3 bg-rbgen-gold/[0.03] flex gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-rbgen-gold/10 border border-rbgen-gold/30 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {ind.signedUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ind.signedUrl} alt={ind.first_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-rbgen-gold/40 text-xs">?</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-rbgen-parchment font-medium truncate">
                    {ind.first_name} {ind.last_name}
                    {ind.is_sensitive && <span className="ml-1 text-xs text-red-400">⚠</span>}
                  </p>
                  <p className="text-rbgen-parchment/50 text-xs">
                    Gen {ind.generation} · {ind.birth_year ?? '?'}–{ind.is_living ? 'living' : ind.death_year ?? '?'}
                  </p>
                  <form action={remove.bind(null, ind.id)} className="mt-1">
                    <button type="submit" className="text-xs text-red-400/70 hover:text-red-400">
                      Remove
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
