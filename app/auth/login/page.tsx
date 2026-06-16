import Link from 'next/link'
import { login } from '../actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; registered?: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-rbgen-dark px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-rbgen-gold-bright">Root &amp; Branch Genealogy</h1>
          <p className="text-rbgen-parchment/60 text-sm mt-1 tracking-wide">RBGen Commission Portal</p>
        </div>

        <div className="bg-rbgen-dark border border-rbgen-gold/30 rounded-lg p-8 shadow-2xl">
          <h2 className="font-serif text-xl text-rbgen-parchment mb-6">Sign in</h2>

          {searchParams.registered && (
            <p className="mb-4 text-sm text-rbgen-gold-bright bg-rbgen-gold/10 border border-rbgen-gold/30 rounded px-3 py-2">
              Account created — check your email to confirm, then sign in below.
            </p>
          )}
          {searchParams.error && (
            <p className="mb-4 text-sm text-rbgen-parchment bg-rbgen-rust/30 border border-rbgen-rust rounded px-3 py-2">
              {searchParams.error}
            </p>
          )}

          <form action={login} className="space-y-4">
            <div>
              <label className="block text-sm text-rbgen-parchment/80 mb-1">Email</label>
              <input
                type="email"
                name="email"
                required
                className="w-full bg-rbgen-dark border border-rbgen-gold/40 rounded px-3 py-2 text-rbgen-parchment focus:outline-none focus:border-rbgen-gold-bright"
              />
            </div>
            <div>
              <label className="block text-sm text-rbgen-parchment/80 mb-1">Password</label>
              <input
                type="password"
                name="password"
                required
                className="w-full bg-rbgen-dark border border-rbgen-gold/40 rounded px-3 py-2 text-rbgen-parchment focus:outline-none focus:border-rbgen-gold-bright"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-rbgen-gold hover:bg-rbgen-gold-bright text-rbgen-dark font-semibold py-2 rounded transition-colors"
            >
              Sign in
            </button>
          </form>

          <p className="text-center text-sm text-rbgen-parchment/60 mt-6">
            New client?{' '}
            <Link href="/auth/register" className="text-rbgen-gold-bright hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
