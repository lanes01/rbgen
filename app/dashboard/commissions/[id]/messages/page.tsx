import { createClient } from '@/lib/supabase/server'
import { sendMessage } from '../actions'

export default async function MessagesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: messages } = await supabase
    .from('messages')
    .select('*, profiles:sender_id(full_name, role)')
    .eq('commission_id', id)
    .order('created_at', { ascending: true })

  const send = sendMessage.bind(null, id)

  return (
    <div className="max-w-2xl">
      <div className="space-y-3 mb-6 max-h-[28rem] overflow-y-auto">
        {!messages || messages.length === 0 ? (
          <p className="text-rbgen-parchment/50 text-sm">No messages yet.</p>
        ) : (
          messages.map((m) => {
            const sender = m.profiles as unknown as { full_name: string; role: string } | null
            const isMe = m.sender_id === user?.id
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-sm rounded-lg px-3 py-2 ${
                    isMe ? 'bg-rbgen-gold/20' : 'bg-rbgen-gold/[0.05] border border-rbgen-gold/20'
                  }`}
                >
                  <p className="text-xs text-rbgen-parchment/40 mb-0.5">{sender?.full_name ?? 'Unknown'}</p>
                  <p className="text-rbgen-parchment text-sm whitespace-pre-wrap">{m.body}</p>
                  <p className="text-xs text-rbgen-parchment/30 mt-1">
                    {new Date(m.created_at).toLocaleString('en-GB')}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>

      <form action={send} className="flex gap-2">
        <textarea
          name="body"
          required
          rows={2}
          placeholder="Type a message..."
          className="flex-1 bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment resize-none"
        />
        <button
          type="submit"
          className="bg-rbgen-gold hover:bg-rbgen-gold-bright text-rbgen-dark font-semibold px-5 py-2 rounded transition-colors self-end"
        >
          Send
        </button>
      </form>
    </div>
  )
}
