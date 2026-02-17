import { useState, useEffect, useRef } from 'react'
import { supabase, logActivity } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useLang } from '../../contexts/LangContext'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Send } from 'lucide-react'

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

export default function VariantCommentsDialog({ variant, open, onOpenChange, onCommentAdded }) {
  const { user } = useAuth()
  const { t, lang } = useLang()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (open && variant) fetchComments()
  }, [open, variant?.id])

  async function fetchComments() {
    if (!supabase || !variant) return
    setLoading(true)
    const { data } = await supabase
      .from('variant_comments')
      .select('*, user:profiles(full_name)')
      .eq('variant_id', variant.id)
      .order('created_at', { ascending: true })
    setComments(data || [])
    setLoading(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!body.trim() || !supabase || !variant) return
    setSubmitting(true)
    await supabase.from('variant_comments').insert({
      variant_id: variant.id,
      user_id: user.id,
      body: body.trim(),
    })
    await logActivity('variant_comment', `${variant.gene} ${variant.variant}`)
    setBody('')
    setSubmitting(false)
    fetchComments()
    onCommentAdded?.()
  }

  if (!variant) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="font-bold text-primary-600">{variant.gene}</span>
            <span className="font-mono text-sm text-slate-600">{variant.variant}</span>
          </DialogTitle>
          {variant.protein_change && (
            <p className="text-xs text-slate-500 font-mono">{variant.protein_change}</p>
          )}
        </DialogHeader>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-3 py-2">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-sm text-slate-400 py-8">
              {t('comments.noComments')}
            </p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="rounded-lg bg-gray-50 px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-800">
                    {c.user?.full_name || '—'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {timeAgo(c.created_at, lang)}
                  </span>
                </div>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{c.body}</p>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 pt-2 border-t">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={t('comments.placeholder')}
            rows={2}
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e)
            }}
          />
          <Button type="submit" size="sm" disabled={!body.trim() || submitting} className="self-end">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
