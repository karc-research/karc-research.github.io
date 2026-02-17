import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../contexts/LangContext'

export default function ResearchersPage() {
  const { t } = useLang()
  const [researchers, setResearchers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResearchers()
  }, [])

  async function fetchResearchers() {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, role, institution, expertise')
      .eq('approved', true)
      .order('full_name')
    setResearchers(data || [])
    setLoading(false)
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{t('researchers.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {t('researchers.desc')}
          </p>
        </div>

        {researchers.length === 0 ? (
          <p className="text-sm text-slate-500">{t('researchers.noResearchers')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {researchers.map((researcher) => (
              <div
                key={researcher.id}
                className="rounded-lg border border-gray-200 bg-white p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold text-sm">
                    {(researcher.full_name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {researcher.full_name || '-'}
                    </h3>
                    <p className="text-xs text-primary-600">{researcher.role}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="text-sm text-slate-600">
                    {researcher.institution || '-'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {researcher.expertise || '-'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
