import { createClient } from '@/lib/supabase/server'
import { setAgreedPrice } from '../actions'

function formatMoney(amount: number | null) {
  if (amount === null) return '—'
  return `£${amount.toFixed(2)}`
}

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: commission } = await supabase
    .from('commissions')
    .select('agreed_price, deposit_amount, deposit_paid, deposit_paid_at, balance_due_date, balance_paid, balance_paid_at')
    .eq('id', id)
    .single()

  if (!commission) return null

  const setPrice = setAgreedPrice.bind(null, id)

  return (
    <div className="max-w-xl space-y-8">
      <form action={setPrice} className="space-y-3">
        <label className="block text-sm text-rbgen-parchment/70 mb-1">Agreed price (£)</label>
        <div className="flex gap-2">
          <input
            type="number"
            name="agreed_price"
            step="0.01"
            min="0"
            defaultValue={commission.agreed_price ?? ''}
            className="flex-1 bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
          />
          <button
            type="submit"
            className="bg-rbgen-gold hover:bg-rbgen-gold-bright text-rbgen-dark font-semibold px-5 py-2 rounded transition-colors"
          >
            Save
          </button>
        </div>
        <p className="text-xs text-rbgen-parchment/40">
          Deposit (50%) is calculated automatically.
        </p>
      </form>

      <div className="border border-rbgen-gold/20 rounded-lg p-4 bg-rbgen-gold/[0.03] space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-rbgen-parchment/60">Deposit amount</span>
          <span className="text-rbgen-parchment">{formatMoney(commission.deposit_amount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-rbgen-parchment/60">Deposit paid</span>
          <span className={commission.deposit_paid ? 'text-green-400' : 'text-rbgen-parchment/50'}>
            {commission.deposit_paid
              ? `Yes — ${new Date(commission.deposit_paid_at!).toLocaleDateString('en-GB')}`
              : 'Not yet'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-rbgen-parchment/60">Balance due date</span>
          <span className="text-rbgen-parchment">
            {commission.balance_due_date
              ? new Date(commission.balance_due_date).toLocaleDateString('en-GB')
              : '— set automatically once status is "delivered"'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-rbgen-parchment/60">Balance paid</span>
          <span className={commission.balance_paid ? 'text-green-400' : 'text-rbgen-parchment/50'}>
            {commission.balance_paid
              ? `Yes — ${new Date(commission.balance_paid_at!).toLocaleDateString('en-GB')}`
              : 'Not yet'}
          </span>
        </div>
      </div>

      <div className="border border-dashed border-rbgen-gold/30 rounded-lg p-4 text-sm text-rbgen-parchment/50">
        Stripe payment link generation will be wired up once Stripe API keys are added to the
        environment — that&apos;s a later build step, not part of Stage 2.
      </div>
    </div>
  )
}
