import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useLang } from '../../contexts/LangContext'
import { Card, CardContent } from '@/components/ui/card'
import StatsOverview from '../../components/dashboard/StatsOverview'

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

const actionLabels = {
  variant_added: { en: 'New variant added', ko: '새 변이 추가' },
  variant_updated: { en: 'Variant updated', ko: '변이 수정' },
  variant_deleted: { en: 'Variant deleted', ko: '변이 삭제' },
  variants_csv_uploaded: { en: 'Variants CSV uploaded', ko: '변이 CSV 업로드' },
  variants_excel_uploaded: { en: 'Variants Excel uploaded', ko: '변이 Excel 업로드' },
  variants_bulk_deleted: { en: 'Variants bulk deleted', ko: '변이 일괄 삭제' },
  variant_comment: { en: 'Comment on variant', ko: '변이에 코멘트' },
  report_added: { en: 'Report added', ko: '리포트 추가' },
  report_updated: { en: 'Report updated', ko: '리포트 수정' },
  profile_updated: { en: 'Profile updated', ko: '프로필 수정' },
}

export default function DashboardHome() {
  const { user, profile } = useAuth()
  const { t, lang } = useLang()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActivity()
  }, [])

  async function fetchActivity() {
    if (!supabase) {
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from('activity_log')
      .select('*, user:profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(10)
    setActivities(data || [])
    setLoading(false)
  }

  return (
    <div className="py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">{t('dashboard.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t('dashboard.welcome')}, {profile?.full_name || user?.email || 'Researcher'}
          </p>
        </div>

        <StatsOverview />

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            {t('dashboard.recentActivity')}
          </h2>
          <Card className="mt-4 py-0 gap-0">
            <CardContent className="p-0 divide-y divide-gray-100">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
                </div>
              ) : activities.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-slate-500">
                  {t('dashboard.noActivity')}
                </div>
              ) : (
                activities.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {actionLabels[item.action]?.[lang] || item.action}
                      </p>
                      <p className="text-sm text-slate-500">
                        {item.detail}
                        {item.user?.full_name && (
                          <span className="ml-2 text-xs text-slate-400">
                            — {item.user.full_name}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap ml-4">
                      {timeAgo(item.created_at, lang)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
