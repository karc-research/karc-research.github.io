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
import { Pin } from 'lucide-react'

const emptyForm = { title: '', body: '', pinned: false }

export default function AnnouncementsPage() {
  const { role } = useAuth()
  const { t, lang } = useLang()
  const canEdit = role === 'admin' || role === 'researcher'

  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  async function fetchAnnouncements() {
    if (!supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('announcements')
      .select('*, author:profiles(full_name)')
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
    setAnnouncements(data || [])
    setLoading(false)
  }

  function openAddModal() {
    setEditingItem(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEditModal(item) {
    setEditingItem(item)
    setForm({ title: item.title, body: item.body, pinned: item.pinned })
    setShowModal(true)
  }

  async function handleSave() {
    if (!supabase) return
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (editingItem) {
      await supabase.from('announcements').update({
        title: form.title,
        body: form.body,
        pinned: form.pinned,
        updated_at: new Date().toISOString(),
      }).eq('id', editingItem.id)
      await logActivity('announcement_updated', form.title)
    } else {
      await supabase.from('announcements').insert({
        title: form.title,
        body: form.body,
        pinned: form.pinned,
        author_id: user?.id,
      })
      await logActivity('announcement_added', form.title)
    }

    setSaving(false)
    setShowModal(false)
    fetchAnnouncements()
  }

  async function handleDelete(item) {
    if (!confirm(lang === 'ko' ? '이 공지를 삭제하시겠습니까?' : 'Delete this announcement?')) return
    await supabase.from('announcements').delete().eq('id', item.id)
    await logActivity('announcement_deleted', item.title)
    fetchAnnouncements()
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
            <h1 className="text-2xl font-bold text-slate-900">{t('announcements.title')}</h1>
            <p className="mt-1 text-sm text-slate-500">{t('announcements.desc')}</p>
          </div>
          {canEdit && (
            <Button onClick={openAddModal}>
              {t('announcements.add')}
            </Button>
          )}
        </div>

        {announcements.length === 0 ? (
          <p className="text-sm text-slate-500">{t('announcements.noAnnouncements')}</p>
        ) : (
          <div className="space-y-4">
            {announcements.map((item) => (
              <Card key={item.id} className="py-0">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{item.title}</h3>
                        {item.pinned && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700 gap-1">
                            <Pin className="h-3 w-3" />
                            {t('announcements.pinned')}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">{item.body}</p>
                      <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                        {item.author?.full_name && (
                          <span>{item.author.full_name}</span>
                        )}
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex shrink-0 gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(item)} className="text-primary-600">
                          {t('announcements.edit')}
                        </Button>
                        {role === 'admin' && (
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item)} className="text-red-600">
                            {t('announcements.delete')}
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
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? t('announcements.edit') : t('announcements.add')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('announcements.announcementTitle')} *</Label>
                <Input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('announcements.body')} *</Label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  rows={5}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
                  className="rounded border-gray-300"
                />
                {t('announcements.pinThis')}
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                {t('announcements.cancel')}
              </Button>
              <Button onClick={handleSave} disabled={!form.title || !form.body || saving}>
                {saving ? t('profile.saving') : t('announcements.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
