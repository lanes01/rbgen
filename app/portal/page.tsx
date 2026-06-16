import { createClient } from '@/lib/supabase/server'

export default async function PortalPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: commissions } = await supabase
    .from('commissions')
    .select('id, status, package_type')
    .eq('client_id', user!.id)

  return (
    <div>
      <h1 className="font-serif text-2xl text-rbgen-parchment mb-6">Your Commission</h1>

      {!commissions || commissions.length === 0 ? (
        <div className="border border-dashed border-rbgen-gold/30 rounded-lg p-12 text-center">
          <p className="text-rbgen-parchment/60">No active commission yet.</p>
          <p className="text-rbgen-parchment/40 text-sm mt-1">
            Once your enquiry is reviewed, your research progress will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {commissions.map((c) => (
            <div key={c.id} className="border border-rbgen-gold/20 rounded-lg p-4 bg-rbgen-gold/[0.03]">
              <p className="text-rbgen-parchment font-medium">{c.package_type}</p>
              <p className="text-rbgen-parchment/50 text-sm">{c.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
