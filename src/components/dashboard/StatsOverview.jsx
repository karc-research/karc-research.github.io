import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../contexts/LangContext'

export default function StatsOverview() {
  const { t } = useLang()
  const [counts, setCounts] = useState({
    variants: 0,
    researchers: 0,
    reports: 0,
    families: 0,
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

    const [variantsRes, researchersRes, reportsRes, familiesRes] = await Promise.all([
      supabase.from('variants').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('approved', true),
      supabase.from('reports').select('*', { count: 'exact', head: true }),
      supabase.from('variants').select('families'),
    ])

    const totalFamilies = (familiesRes.data || []).reduce(
      (sum, v) => sum + (v.families || 0),
      0
    )

    setCounts({
      variants: variantsRes.count || 0,
      researchers: researchersRes.count || 0,
      reports: reportsRes.count || 0,
      families: totalFamilies,
    })
    setLoading(false)
  }

  const stats = [
    { label: t('stats.variants'), value: counts.variants.toLocaleString() },
    { label: t('stats.researchers'), value: counts.researchers.toLocaleString() },
    { label: t('stats.reports'), value: counts.reports.toLocaleString() },
    { label: t('stats.families'), value: counts.families.toLocaleString() },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-gray-200 bg-white p-6"
        >
          <p className="text-sm font-medium text-slate-500">{stat.label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">
            {loading ? '—' : stat.value}
          </p>
        </div>
      ))}
    </div>
  )
}
