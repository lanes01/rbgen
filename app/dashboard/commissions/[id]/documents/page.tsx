import { createClient } from '@/lib/supabase/server'
import { uploadDocument, deleteDocument } from '../actions'

const FILE_TYPES = ['certificate', 'census', 'photograph', 'letter', 'military', 'immigration', 'other']

export default async function DocumentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: documents }, { data: individuals }] = await Promise.all([
    supabase
      .from('documents')
      .select('*')
      .eq('commission_id', id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('individuals')
      .select('id, first_name, last_name')
      .eq('commission_id', id)
      .is('deleted_at', null)
      .order('generation'),
  ])

  const withUrls = await Promise.all(
    (documents ?? []).map(async (doc) => {
      const { data } = await supabase.storage
        .from('commission-documents')
        .createSignedUrl(doc.file_url, 3600)
      return { ...doc, signedUrl: data?.signedUrl ?? null }
    })
  )

  const upload = uploadDocument.bind(null, id)
  const remove = deleteDocument.bind(null, id)

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-rbgen-parchment font-medium mb-3">Upload Document</h2>
        <form action={upload} className="space-y-3" encType="multipart/form-data">
          <div>
            <label className="block text-sm text-rbgen-parchment/70 mb-1">File</label>
            <input
              type="file"
              name="file"
              required
              className="w-full text-rbgen-parchment/70 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-rbgen-parchment/70 mb-1">Type</label>
              <select
                name="file_type"
                required
                className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
              >
                {FILE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-rbgen-parchment/70 mb-1">Approx. year</label>
              <input
                type="number"
                name="year_approx"
                className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-rbgen-parchment/70 mb-1">Related individual</label>
            <select
              name="individual_id"
              className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
            >
              <option value="">— None —</option>
              {individuals?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-rbgen-parchment/70 mb-1">Description</label>
            <textarea
              name="description"
              rows={2}
              className="w-full bg-rbgen-dark border border-rbgen-gold/30 rounded px-3 py-2 text-rbgen-parchment"
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-rbgen-parchment/70">
              <input type="checkbox" name="is_final_report" />
              Final report
            </label>
            <label className="flex items-center gap-2 text-sm text-rbgen-parchment/70">
              <input type="checkbox" name="is_family_tree_export" />
              Tree export
            </label>
          </div>

          <button
            type="submit"
            className="bg-rbgen-gold hover:bg-rbgen-gold-bright text-rbgen-dark font-semibold px-5 py-2 rounded transition-colors"
          >
            Upload
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-rbgen-parchment font-medium mb-3">Documents ({withUrls.length})</h2>
        {withUrls.length === 0 ? (
          <p className="text-rbgen-parchment/50 text-sm">No documents uploaded yet.</p>
        ) : (
          <div className="space-y-2">
            {withUrls.map((doc) => (
              <div
                key={doc.id}
                className="border border-rbgen-gold/20 rounded-lg p-3 bg-rbgen-gold/[0.03] flex items-center justify-between"
              >
                <div className="min-w-0">
                  <a
                    href={doc.signedUrl ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-rbgen-gold-bright hover:underline truncate block"
                  >
                    {doc.file_name}
                  </a>
                  <p className="text-rbgen-parchment/50 text-xs capitalize">
                    {doc.file_type}
                    {doc.is_final_report && ' · final report'}
                    {doc.is_family_tree_export && ' · tree export'}
                  </p>
                </div>
                <form action={remove.bind(null, doc.id)}>
                  <button type="submit" className="text-xs text-red-400/70 hover:text-red-400 flex-shrink-0">
                    Remove
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
