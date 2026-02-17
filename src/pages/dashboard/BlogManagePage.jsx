import { useState, useEffect } from 'react'
import { supabase, logActivity } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useLang } from '../../contexts/LangContext'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const emptyForm = { title: '', subtitle: '', content: '', excerpt: '', published: false }

export default function BlogManagePage() {
  const { role } = useAuth()
  const { t, lang } = useLang()
  const canEdit = role === 'admin' || role === 'coordinator'

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    if (!supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('blog_posts')
      .select('*, author:profiles(full_name)')
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  function openAddModal() {
    setEditingItem(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEditModal(item) {
    setEditingItem(item)
    setForm({
      title: item.title,
      subtitle: item.subtitle || '',
      content: item.content,
      excerpt: item.excerpt || '',
      published: item.published,
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!supabase) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (editingItem) {
      await supabase.from('blog_posts').update({
        title: form.title,
        subtitle: form.subtitle || null,
        content: form.content,
        excerpt: form.excerpt || null,
        published: form.published,
        published_at: form.published ? (editingItem.published ? editingItem.published_at : new Date().toISOString()) : editingItem.published_at,
        updated_at: new Date().toISOString(),
      }).eq('id', editingItem.id)
      await logActivity('blog_updated', form.title)
    } else {
      await supabase.from('blog_posts').insert({
        title: form.title,
        subtitle: form.subtitle || null,
        content: form.content,
        excerpt: form.excerpt || null,
        published: form.published,
        published_at: new Date().toISOString(),
        author_id: user?.id,
      })
      await logActivity('blog_added', form.title)
    }

    setSaving(false)
    setShowModal(false)
    fetchPosts()
  }

  async function handleDelete(item) {
    if (!confirm(lang === 'ko' ? '이 포스트를 삭제하시겠습니까?' : 'Delete this post?')) return
    await supabase.from('blog_posts').delete().eq('id', item.id)
    await logActivity('blog_deleted', item.title)
    fetchPosts()
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('blog.manage')}</h1>
            <p className="mt-1 text-sm text-slate-500">{t('blog.subtitle')}</p>
          </div>
          {canEdit && (
            <Button onClick={openAddModal}>
              {t('blog.newPost')}
            </Button>
          )}
        </div>

        {posts.length === 0 ? (
          <p className="text-sm text-slate-500">{t('blog.noPosts')}</p>
        ) : (
          <div className="space-y-4">
            {posts.map((item) => (
              <Card key={item.id} className="py-0">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{item.title}</h3>
                        <Badge variant={item.published ? 'default' : 'secondary'}>
                          {item.published
                            ? (lang === 'ko' ? '공개' : 'Published')
                            : (lang === 'ko' ? '비공개' : 'Draft')}
                        </Badge>
                      </div>
                      {item.subtitle && (
                        <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
                      )}
                      {item.excerpt && (
                        <p className="mt-2 text-sm text-slate-600 line-clamp-2">{item.excerpt}</p>
                      )}
                      <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                        {item.author?.full_name && <span>{item.author.full_name}</span>}
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex shrink-0 gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(item)} className="text-primary-600">
                          {t('blog.editPost')}
                        </Button>
                        {role === 'admin' && (
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item)} className="text-red-600">
                            {lang === 'ko' ? '삭제' : 'Delete'}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? t('blog.editPost') : t('blog.newPost')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{lang === 'ko' ? '제목' : 'Title'} *</Label>
                <Input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{lang === 'ko' ? '부제' : 'Subtitle'}</Label>
                <Input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{lang === 'ko' ? '요약' : 'Excerpt'}</Label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
              </div>
              <div className="space-y-2">
                <Label>{lang === 'ko' ? '본문' : 'Content'} *</Label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={12}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                  placeholder={lang === 'ko' ? '**굵게** 표시 가능' : 'Use **bold** for emphasis'}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="rounded border-gray-300"
                />
                {lang === 'ko' ? '공개' : 'Publish'}
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                {lang === 'ko' ? '취소' : 'Cancel'}
              </Button>
              <Button onClick={handleSave} disabled={!form.title || !form.content || saving}>
                {saving ? (lang === 'ko' ? '저장 중...' : 'Saving...') : (lang === 'ko' ? '저장' : 'Save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
