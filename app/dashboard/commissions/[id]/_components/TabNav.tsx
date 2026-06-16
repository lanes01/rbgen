'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { label: 'Overview', segment: '' },
  { label: 'Research Log', segment: 'research-log' },
  { label: 'Individuals', segment: 'individuals' },
  { label: 'Documents', segment: 'documents' },
  { label: 'Messages', segment: 'messages' },
  { label: 'Payment', segment: 'payment' },
]

export default function TabNav({ commissionId }: { commissionId: string }) {
  const pathname = usePathname()
  const base = `/dashboard/commissions/${commissionId}`

  return (
    <nav className="flex gap-1 border-b border-rbgen-gold/20 mb-6 overflow-x-auto">
      {TABS.map((tab) => {
        const href = tab.segment ? `${base}/${tab.segment}` : base
        const isActive = pathname === href
        return (
          <Link
            key={tab.label}
            href={href}
            className={`px-4 py-2 text-sm whitespace-nowrap border-b-2 transition-colors ${
              isActive
                ? 'border-rbgen-gold text-rbgen-gold-bright'
                : 'border-transparent text-rbgen-parchment/50 hover:text-rbgen-parchment'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
