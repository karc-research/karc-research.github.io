import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../contexts/LangContext'
import { Card, CardContent } from '@/components/ui/card'

export default function StatsOverview() {
  const { t } = useLang()
  const [counts, setCounts] = useState({
    variants: 0,
    researchers: 0,
    reports: 0,
    announcements: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCounts()
  }, [])

  async function fetchCounts() {
    if (!supabase) {
      setLoading(false)
      return
    }

    const [variantsRes, researchersRes, reportsRes, announcementsRes] = await Promise.all([
      supabase.from('variants').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('approved', true),
      supabase.from('reports').select('*', { count: 'exact', head: true }),
      supabase.from('announcements').select('*', { count: 'exact', head: true }),
    ])

    setCounts({
      variants: variantsRes.count || 0,
      researchers: researchersRes.count || 0,
      reports: reportsRes.count || 0,
      announcements: announcementsRes.count || 0,
    })
    setLoading(false)
  }

  const stats = [
    { label: t('stats.variants'), value: counts.variants.toLocaleString() },
    { label: t('stats.researchers'), value: counts.researchers.toLocaleString() },
    { label: t('stats.reports'), value: counts.reports.toLocaleString() },
    { label: t('nav.announcements'), value: counts.announcements.toLocaleString() },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="py-0">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">
              {loading ? '—' : stat.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
