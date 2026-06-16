import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/auth/actions'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  return (
    <div className="min-h-screen bg-rbgen-dark">
      <header className="border-b border-rbgen-gold/20 px-6 py-4 flex items-center justify-between">
        <div>
          <Link href="/portal" className="font-serif text-xl text-rbgen-gold-bright">
            Root &amp; Branch Genealogy
          </Link>
          <p className="text-xs text-rbgen-parchment/50">Your Commission</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-rbgen-parchment/70">{profile?.full_name}</span>
          <form action={logout}>
            <button className="text-sm text-rbgen-gold hover:text-rbgen-gold-bright transition-colors">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="p-6 max-w-3xl mx-auto">{children}</main>
    </div>
  )
}
