import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TabNav from './_components/TabNav'

export default async function CommissionLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: commission } = await supabase
    .from('commissions')
    .select('id, status, package_type, profiles:client_id(full_name, email)')
    .eq('id', id)
    .is('deleted_at', null)
    .single()

  if (!commission) notFound()

  const client = commission.profiles as unknown as { full_name: string; email: string } | null

  return (
    <div>
      <Link href="/dashboard/commissions" className="text-sm text-rbgen-gold hover:text-rbgen-gold-bright">
        ← All commissions
      </Link>

      <div className="flex items-center justify-between mt-2 mb-4">
        <div>
          <h1 className="font-serif text-2xl text-rbgen-parchment">{client?.full_name ?? 'Unknown client'}</h1>
          <p className="text-rbgen-parchment/50 text-sm">{client?.email} · {commission.package_type}</p>
        </div>
        <span className="text-xs uppercase tracking-wide bg-rbgen-gold/10 text-rbgen-gold-bright px-3 py-1 rounded-full">
          {commission.status}
        </span>
      </div>

      <TabNav commissionId={id} />

      {children}
    </div>
  )
}
