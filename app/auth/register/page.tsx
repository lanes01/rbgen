import Link from 'next/link'
import { register } from '../actions'

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-rbgen-dark px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-rbgen-gold-bright">Root &amp; Branch Genealogy</h1>
          <p className="text-rbgen-parchment/60 text-sm mt-1 tracking-wide">RBGen Commission Portal</p>
        </div>

        <div className="bg-rbgen-dark border border-rbgen-gold/30 rounded-lg p-8 shadow-2xl">
          <h2 className="font-serif text-xl text-rbgen-parchment mb-6">Create your account</h2>

          {searchParams.error && (
            <p className="mb-4 text-sm text-rbgen-parchment bg-rbgen-rust/30 border border-rbgen-rust rounded px-3 py-2">
              {searchParams.error}
            </p>
          )}

          <form action={register} className="space-y-4">
            <div>
              <label className="block text-sm text-rbgen-parchment/80 mb-1">Full name</label>
              <input
                type="text"
                name="full_name"
                required
                className="w-full bg-rbgen-dark border border-rbgen-gold/40 rounded px-3 py-2 text-rbgen-parchment focus:outline-none focus:border-rbgen-gold-bright"
              />
            </div>
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
                minLength={6}
                className="w-full bg-rbgen-dark border border-rbgen-gold/40 rounded px-3 py-2 text-rbgen-parchment focus:outline-none focus:border-rbgen-gold-bright"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-rbgen-gold hover:bg-rbgen-gold-bright text-rbgen-dark font-semibold py-2 rounded transition-colors"
            >
              Create account
            </button>
          </form>

          <p className="text-center text-sm text-rbgen-parchment/60 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-rbgen-gold-bright hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
