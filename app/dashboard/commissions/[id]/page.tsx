import { createClient } from '@/lib/supabase/server'
import { updateOverview } from './actions'

const STATUSES = ['enquiry', 'quoted', 'deposit_pending', 'active', 'report_writing', 'delivered', 'closed']

export default async function OverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: commission } = await supabase
    .from('commissions')
    .select('*')
    .eq('id', id)
    .single()

  if (!commission) return null

  const update = updateOverview.bind(null, id)

  return (
    <form action={update} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm text-rbgen-parchment/70 mb-1">Status</label>
        <select
          name="status"
          defaultValue={commission.status}
          className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-rbgen-parchment/70 mb-1">Generations requested</label>
        <input
          type="number"
          name="generations_requested"
          defaultValue={commission.generations_requested ?? ''}
          className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
        />
      </div>

      <div>
        <label className="block text-sm text-rbgen-parchment/70 mb-1">Surnames (comma separated)</label>
        <input
          type="text"
          name="surnames"
          defaultValue={(commission.surnames ?? []).join(', ')}
          className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
        />
      </div>

      <div>
        <label className="block text-sm text-rbgen-parchment/70 mb-1">Known locations</label>
        <input
          type="text"
          name="known_locations"
          defaultValue={commission.known_locations ?? ''}
          className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
        />
      </div>

      <div>
        <label className="block text-sm text-rbgen-parchment/70 mb-1">Estimated completion</label>
        <input
          type="date"
          name="estimated_completion"
          defaultValue={commission.estimated_completion ?? ''}
          className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
        />
      </div>

      <div>
        <label className="block text-sm text-rbgen-parchment/70 mb-1">Brief / notes</label>
        <textarea
          name="brief_text"
          rows={5}
          defaultValue={commission.brief_text ?? ''}
          className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
        />
      </div>

      <button
        type="submit"
        className="bg-rbgen-gold hover:bg-rbgen-gold-bright text-rbgen-dark font-semibold px-5 py-2 rounded transition-colors"
      >
        Save Changes
      </button>
    </form>
  )
}
