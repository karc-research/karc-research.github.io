import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../contexts/LangContext'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const roleBadge = {
  admin: 'bg-red-100 text-red-700',
  researcher: 'bg-blue-100 text-blue-700',
  coordinator: 'bg-purple-100 text-purple-700',
  viewer: 'bg-gray-100 text-gray-600',
}

const roleOptions = ['admin', 'researcher', 'coordinator', 'viewer']

export default function ResearchersPage() {
  const { t, lang } = useLang()
  const [researchers, setResearchers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchResearchers()
  }, [roleFilter, search])

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  async function fetchResearchers() {
    if (!supabase) { setLoading(false); return }
    let query = supabase
      .from('profiles')
      .select('id, full_name, role, institution, expertise')
      .eq('approved', true)
      .order('full_name')

    if (roleFilter) {
      query = query.eq('role', roleFilter)
    }
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,institution.ilike.%${search}%,expertise.ilike.%${search}%`)
    }

    const { data } = await query
    setResearchers(data || [])
    setLoading(false)
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

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={lang === 'ko' ? '이름, 소속, 전문 분야 검색...' : 'Search name, institution, expertise...'}
            className="w-auto min-w-[240px]"
          />
          <div className="flex gap-1">
            <Button
              variant={roleFilter === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setRoleFilter('')}
            >
              {lang === 'ko' ? '전체' : 'All'}
            </Button>
            {roleOptions.map((r) => (
              <Button
                key={r}
                variant={roleFilter === r ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter(roleFilter === r ? '' : r)}
              >
                {r}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : researchers.length === 0 ? (
          <p className="text-sm text-slate-500">{t('researchers.noResearchers')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {researchers.map((researcher) => (
              <Card key={researcher.id} className="py-0">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold text-sm">
                      {(researcher.full_name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {researcher.full_name || '-'}
                      </h3>
                      <Badge variant="secondary" className={roleBadge[researcher.role] || roleBadge.viewer}>
                        {researcher.role}
                      </Badge>
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <p className="mt-4 text-sm text-slate-400">
          {lang === 'ko'
            ? `${researchers.length}명의 연구자`
            : `${researchers.length} researcher${researchers.length !== 1 ? 's' : ''}`}
        </p>
      </div>
    </div>
  )
}
