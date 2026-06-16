import { createClient } from '@/lib/supabase/server'
import { addResearchLogEntry } from '../actions'

const SOURCE_TYPES = [
  'civil_registration',
  'census',
  'parish',
  'military',
  'probate',
  'immigration',
  'newspaper',
  'overseas',
  'other',
]

const RESULTS = ['found', 'not_found', 'partial']

export default async function ResearchLogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: entries }, { data: individuals }] = await Promise.all([
    supabase
      .from('research_log')
      .select('*, individuals(first_name, last_name)')
      .eq('commission_id', id)
      .order('logged_at', { ascending: false }),
    supabase
      .from('individuals')
      .select('id, first_name, last_name')
      .eq('commission_id', id)
      .is('deleted_at', null)
      .order('generation'),
  ])

  const addEntry = addResearchLogEntry.bind(null, id)

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-rbgen-parchment font-medium mb-3">Add Entry</h2>
        <form action={addEntry} className="space-y-3">
          <div>
            <label className="block text-sm text-rbgen-parchment/70 mb-1">Source name</label>
            <input
              type="text"
              name="source_name"
              required
              className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-rbgen-parchment/70 mb-1">Source type</label>
              <select
                name="source_type"
                required
                className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
              >
                {SOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-rbgen-parchment/70 mb-1">Result</label>
              <select
                name="result"
                required
                className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
              >
                {RESULTS.map((r) => (
                  <option key={r} value={r}>
                    {r.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-rbgen-parchment/70 mb-1">Related individual</label>
            <select
              name="individual_id"
              className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
            >
              <option value="">— None —</option>
              {individuals?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-rbgen-parchment/70 mb-1">Search terms</label>
            <input
              type="text"
              name="search_terms"
              className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
            />
          </div>

          <div>
            <label className="block text-sm text-rbgen-parchment/70 mb-1">Notes</label>
            <textarea
              name="notes"
              rows={3}
              className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-rbgen-parchment/70">
            <input type="checkbox" name="is_disputed" />
            Conflicting / disputed evidence
          </label>

          <button
            type="submit"
            className="bg-rbgen-gold hover:bg-rbgen-gold-bright text-rbgen-dark font-semibold px-5 py-2 rounded transition-colors"
          >
            Add Entry
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-rbgen-parchment font-medium mb-3">Timeline</h2>
        {!entries || entries.length === 0 ? (
          <p className="text-rbgen-parchment/50 text-sm">No research log entries yet.</p>
        ) : (
          <div className="space-y-3 border-l border-rbgen-gold/20 pl-4">
            {entries.map((e) => {
              const ind = e.individuals as unknown as { first_name: string; last_name: string } | null
              return (
                <div key={e.id} className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-rbgen-gold" />
                  <p className="text-xs text-rbgen-parchment/40">
                    {new Date(e.logged_at).toLocaleDateString('en-GB')}
                  </p>
                  <p className="text-rbgen-parchment font-medium">
                    {e.source_name}{' '}
                    <span className="text-xs uppercase text-rbgen-gold-bright/80">
                      {e.source_type.replace('_', ' ')}
                    </span>
                    {e.is_disputed && (
                      <span className="ml-2 text-xs uppercase text-red-400">disputed</span>
                    )}
                  </p>
                  {ind && (
                    <p className="text-rbgen-parchment/50 text-sm">
                      Re: {ind.first_name} {ind.last_name}
                    </p>
                  )}
                  <p className="text-sm text-rbgen-parchment/70">
                    Result: <span className="capitalize">{e.result.replace('_', ' ')}</span>
                  </p>
                  {e.notes && <p className="text-sm text-rbgen-parchment/60 mt-1">{e.notes}</p>}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
