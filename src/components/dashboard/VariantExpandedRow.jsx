import { useState, useEffect, useRef } from 'react'
import { supabase, logActivity } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useLang } from '../../contexts/LangContext'
import { Button } from '@/components/ui/button'
import { Send, Trash2, ExternalLink } from 'lucide-react'

function timeAgo(dateStr, lang) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  const intervals = [
    { en: 'year', ko: '년', seconds: 31536000 },
    { en: 'month', ko: '개월', seconds: 2592000 },
    { en: 'day', ko: '일', seconds: 86400 },
    { en: 'hour', ko: '시간', seconds: 3600 },
    { en: 'minute', ko: '분', seconds: 60 },
  ]
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      if (lang === 'ko') return `${count}${interval.ko} 전`
      return `${count} ${interval.en}${count > 1 ? 's' : ''} ago`
    }
  }
  return lang === 'ko' ? '방금 전' : 'just now'
}

function formatGenomicPos(v) {
  if (!v.chromosome && !v.position) return null
  const chr = v.chromosome ? `chr${v.chromosome.replace(/^chr/i, '')}` : '?'
  return v.position ? `${chr}:${Number(v.position).toLocaleString()}` : chr
}

function getUcscUrl(v) {
  if (!v.chromosome || !v.position) return null
  const chr = `chr${v.chromosome.replace(/^chr/i, '')}`
  const pos = Number(v.position)
  const start = Math.max(0, pos - 25)
  const end = pos + 25
  return `https://genome-asia.ucsc.edu/cgi-bin/hgTracks?db=hg38&position=${chr}%3A${start}-${end}`
}

export default function VariantExpandedRow({ variant, colSpan, onRefresh }) {
  const { user } = useAuth()
  const { t, lang } = useLang()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [variant.id])

  async function fetchComments() {
    if (!supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('variant_comments')
      .select('*, user:profiles(full_name)')
      .eq('variant_id', variant.id)
      .order('created_at', { ascending: true })
    setComments(data || [])
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!body.trim() || !supabase) return
    setSubmitting(true)
    const text = body.trim()
    await supabase.from('variant_comments').insert({
      variant_id: variant.id,
      user_id: user.id,
      body: text,
    })
    const preview = text.length > 60 ? text.slice(0, 60) + '...' : text
    await logActivity('variant_comment', `${variant.gene} ${variant.variant} — "${preview}"`)
    setBody('')
    setSubmitting(false)
    fetchComments()
    onRefresh?.()
  }

  async function handleDeleteComment(commentId) {
    const msg = lang === 'ko' ? '이 코멘트를 삭제하시겠습니까?' : 'Delete this comment?'
    if (!confirm(msg)) return
    await supabase.from('variant_comments').delete().eq('id', commentId)
    fetchComments()
    onRefresh?.()
  }

  const ucscUrl = getUcscUrl(variant)

  // Variant ID: chr:pos:ref:alt
  function formatVariantId(v) {
    if (!v.chromosome || !v.position) return null
    const chr = `chr${v.chromosome.replace(/^chr/i, '')}`
    const parts = [chr, v.position]
    if (v.ref_allele) parts.push(v.ref_allele)
    if (v.alt_allele) parts.push(v.alt_allele)
    return parts.join(':')
  }

  const variantId = formatVariantId(variant)

  const details = [
    { label: 'HGVS', value: variant.variant, mono: true },
    { label: t('variants.proteinChange'), value: variant.protein_change, mono: true },
    { label: t('variants.transcript'), value: variant.transcript, mono: true },
    { label: t('variants.inheritance'), value: variant.inheritance },
    { label: t('variants.status'), value: variant.status ? t(`variants.status.${variant.status}`) : null },
  ].filter((d) => d.value && d.value !== '-')

  return (
    <td colSpan={colSpan} className="px-6 py-4 bg-slate-50/70">
      {/* Detail fields */}
      <div className="flex flex-wrap gap-x-6 gap-y-1 mb-4">
        {variantId && (
          <div className="text-sm">
            <span className="text-slate-400">Variant ID: </span>
            {ucscUrl ? (
              <a
                href={ucscUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-primary-600 hover:text-primary-800 hover:underline inline-flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {variantId}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="text-slate-700 font-mono">{variantId}</span>
            )}
          </div>
        )}
        {details.map((d) => (
          <div key={d.label} className="text-sm">
            <span className="text-slate-400">{d.label}: </span>
            <span className={`text-slate-700 ${d.mono ? 'font-mono' : ''}`}>{d.value}</span>
          </div>
        ))}
      </div>

      {/* Notes */}
      {variant.notes && (
        <div className="text-sm mb-4">
          <span className="text-slate-400">{t('variants.notes')}: </span>
          <span className="text-slate-600">{variant.notes}</span>
        </div>
      )}

      {/* Comments */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          {lang === 'ko' ? `코멘트 (${comments.length})` : `Comments (${comments.length})`}
        </p>

        {loading ? (
          <div className="flex justify-center py-4">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-2 mb-3">
            {comments.length === 0 && (
              <p className="text-sm text-slate-400">{t('comments.noComments')}</p>
            )}
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2 rounded-md bg-white border border-gray-100 px-3 py-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">{c.user?.full_name || '—'}</span>
                    <span className="text-xs text-slate-400">{timeAgo(c.created_at, lang)}</span>
                  </div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap mt-0.5">{c.body}</p>
                </div>
                {c.user_id === user?.id && (
                  <button
                    onClick={() => handleDeleteComment(c.id)}
                    className="shrink-0 p-1 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Comment input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t('comments.placeholder')}
            className="flex-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e)
            }}
          />
          <Button type="submit" size="sm" disabled={!body.trim() || submitting}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </td>
  )
}
