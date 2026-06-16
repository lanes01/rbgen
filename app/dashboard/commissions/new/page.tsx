import { createClient } from '@/lib/supabase/server'
import { createCommission } from '@/app/dashboard/actions'

export default async function NewCommissionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const supabase = await createClient()
  const { data: clients } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('role', 'client')
    .order('full_name')

  return (
    <div className="max-w-xl">
      <h1 className="font-serif text-2xl text-rbgen-parchment mb-6">New Commission</h1>

      {error && (
        <div className="mb-4 rounded border border-red-800 bg-red-950/40 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {!clients || clients.length === 0 ? (
        <div className="border border-dashed border-rbgen-gold/30 rounded-lg p-8 text-center">
          <p className="text-rbgen-parchment/60">No client accounts exist yet.</p>
          <p className="text-rbgen-parchment/40 text-sm mt-1">
            A client needs to register an account at /auth/register before you can create a
            commission for them.
          </p>
        </div>
      ) : (
        <form action={createCommission} className="space-y-4">
          <div>
            <label className="block text-sm text-rbgen-parchment/70 mb-1">Client</label>
            <select
              name="client_id"
              required
              className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name || c.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-rbgen-parchment/70 mb-1">Package</label>
            <select
              name="package_type"
              required
              className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
            >
              <option value="3gen">3 Generation</option>
              <option value="6gen">6 Generation</option>
              <option value="extended">Extended</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-rbgen-parchment/70 mb-1">
              Generations requested
            </label>
            <input
              type="number"
              name="generations_requested"
              min="1"
              className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
            />
          </div>

          <div>
            <label className="block text-sm text-rbgen-parchment/70 mb-1">
              Surnames (comma separated)
            </label>
            <input
              type="text"
              name="surnames"
              placeholder="Smith, Jones"
              className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
            />
          </div>

          <div>
            <label className="block text-sm text-rbgen-parchment/70 mb-1">Known locations</label>
            <input
              type="text"
              name="known_locations"
              className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
            />
          </div>

          <div>
            <label className="block text-sm text-rbgen-parchment/70 mb-1">Brief / notes</label>
            <textarea
              name="brief_text"
              rows={4}
              className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
            />
          </div>

          <button
            type="submit"
            className="bg-rbgen-gold hover:bg-rbgen-gold-bright text-rbgen-dark font-semibold px-5 py-2 rounded transition-colors"
          >
            Create Commission
          </button>
        </form>
      )}
    </div>
  )
}
