import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function CommissionsPage() {
  const supabase = await createClient()
  const { data: commissions } = await supabase
    .from('commissions')
    .select('id, package_type, status, agreed_price, created_at, profiles:client_id(full_name)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl text-rbgen-parchment">Commissions</h1>
        <Link
          href="/dashboard/commissions/new"
          className="bg-rbgen-gold hover:bg-rbgen-gold-bright text-rbgen-dark font-semibold px-4 py-2 rounded text-sm transition-colors"
        >
          New Commission
        </Link>
      </div>

      {!commissions || commissions.length === 0 ? (
        <div className="border border-dashed border-rbgen-gold/30 rounded-lg p-12 text-center">
          <p className="text-rbgen-parchment/60">No commissions yet.</p>
          <p className="text-rbgen-parchment/40 text-sm mt-1">
            New enquiries will appear here once the public intake form is live, or create one manually above.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {commissions.map((c) => (
            <Link
              href={`/dashboard/commissions/${c.id}`}
              key={c.id}
              className="flex border border-rbgen-gold/20 rounded-lg p-4 items-center justify-between bg-rbgen-gold/[0.03] hover:border-rbgen-gold/50 transition-colors"
            >
              <div>
                <p className="text-rbgen-parchment font-medium">
                  {(c.profiles as unknown as { full_name: string } | null)?.full_name ?? 'Unknown client'}
                </p>
                <p className="text-rbgen-parchment/50 text-sm">{c.package_type}</p>
              </div>
              <span className="text-xs uppercase tracking-wide bg-rbgen-gold/10 text-rbgen-gold-bright px-3 py-1 rounded-full">
                {c.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
