import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-rbgen-dark px-4">
      <div className="text-center max-w-lg">
        <h1 className="font-serif text-4xl text-rbgen-gold-bright mb-2">Root &amp; Branch Genealogy</h1>
        <p className="text-rbgen-parchment/60 mb-10">Professional family history research</p>
        <Link
          href="/auth/login"
          className="inline-block bg-rbgen-gold hover:bg-rbgen-gold-bright text-rbgen-dark font-semibold px-6 py-3 rounded transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}
