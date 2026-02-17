import { useState, useEffect, useRef } from 'react'
import { supabase, logActivity } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useLang } from '../../contexts/LangContext'
import VariantTable from '../../components/dashboard/VariantTable'

const PAGE_SIZE = 20

const typeOptions = ['missense', 'nonsense', 'frameshift', 'splice', 'indel']
const significanceOptions = ['pathogenic', 'likely_pathogenic', 'vus', 'benign']
const inheritanceOptions = ['de_novo', 'inherited', 'unknown']

const emptyForm = {
  gene: '',
  variant: '',
  type: 'missense',
  significance: 'vus',
  families: 0,
  chromosome: '',
  position: '',
  ref_allele: '',
  alt_allele: '',
  transcript: '',
  inheritance: 'unknown',
  notes: '',
}

export default function VariantsPage() {
  const { role } = useAuth()
  const { t, lang } = useLang()
  const fileInputRef = useRef(null)

  const canEdit = role === 'admin' || role === 'researcher'

  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)

  // Filters
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sigFilter, setSigFilter] = useState('')

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editingVariant, setEditingVariant] = useState(null)
  const [form, setForm] = useState(emptyForm)

  // CSV
  const [csvResult, setCsvResult] = useState(null)

  useEffect(() => {
    fetchVariants()
  }, [page, search, typeFilter, sigFilter])

  async function fetchVariants() {
    if (!supabase) { setLoading(false); return }
    setLoading(true)

    let query = supabase
      .from('variants')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`gene.ilike.%${search}%,variant.ilike.%${search}%`)
    }
    if (typeFilter) {
      query = query.eq('type', typeFilter)
    }
    if (sigFilter) {
      query = query.eq('significance', sigFilter)
    }

    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    query = query.range(from, to)

    const { data, count } = await query
    setVariants(data || [])
    setTotalCount(count || 0)
    setLoading(false)
  }

  // Search debounce
  const [searchInput, setSearchInput] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  function openAddModal() {
    setEditingVariant(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  function openEditModal(v) {
    setEditingVariant(v)
    setForm({
      gene: v.gene,
      variant: v.variant,
      type: v.type,
      significance: v.significance,
      families: v.families || 0,
      chromosome: v.chromosome || '',
      position: v.position || '',
      ref_allele: v.ref_allele || '',
      alt_allele: v.alt_allele || '',
      transcript: v.transcript || '',
      inheritance: v.inheritance || 'unknown',
      notes: v.notes || '',
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!supabase) return
    const payload = {
      ...form,
      position: form.position ? Number(form.position) : null,
      families: Number(form.families) || 0,
      updated_at: new Date().toISOString(),
    }

    if (editingVariant) {
      await supabase.from('variants').update(payload).eq('id', editingVariant.id)
      await logActivity('variant_updated', `${form.gene} ${form.variant}`)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      payload.created_by = user?.id
      await supabase.from('variants').insert(payload)
      await logActivity('variant_added', `${form.gene} ${form.variant}`)
    }

    setShowModal(false)
    fetchVariants()
  }

  async function handleDelete(v) {
    if (!confirm(t('variants.confirmDelete'))) return
    await supabase.from('variants').delete().eq('id', v.id)
    await logActivity('variant_deleted', `${v.gene} ${v.variant}`)
    fetchVariants()
  }

  async function handleCsvUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setCsvResult(null)

    const text = await file.text()
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length < 2) return

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    const requiredCols = ['gene', 'variant', 'type', 'significance']
    const missing = requiredCols.filter((c) => !headers.includes(c))
    if (missing.length > 0) {
      setCsvResult({ success: 0, fail: 0, error: `Missing columns: ${missing.join(', ')}` })
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    const rows = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim())
      const row = {}
      headers.forEach((h, idx) => { row[h] = values[idx] || '' })
      rows.push({
        gene: row.gene,
        variant: row.variant,
        type: row.type,
        significance: row.significance,
        families: Number(row.families) || 0,
        chromosome: row.chromosome || null,
        position: row.position ? Number(row.position) : null,
        ref_allele: row.ref_allele || null,
        alt_allele: row.alt_allele || null,
        transcript: row.transcript || null,
        inheritance: row.inheritance || null,
        notes: row.notes || null,
        created_by: user?.id,
      })
    }

    const { error } = await supabase.from('variants').insert(rows)
    if (error) {
      setCsvResult({ success: 0, fail: rows.length, error: error.message })
    } else {
      setCsvResult({ success: rows.length, fail: 0 })
      await logActivity('variants_csv_uploaded', `${rows.length} variants from ${file.name}`)
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
    fetchVariants()
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const showFrom = page * PAGE_SIZE + 1
  const showTo = Math.min((page + 1) * PAGE_SIZE, totalCount)

  return (
    <div className="py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('variants.title')}</h1>
            <p className="mt-1 text-sm text-slate-500">{t('variants.desc')}</p>
          </div>
          {canEdit && (
            <div className="flex gap-2">
              <button
                onClick={openAddModal}
                className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition-colors"
              >
                {t('variants.addVariant')}
              </button>
              <label className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-gray-50 transition-colors">
                {t('variants.uploadCsv')}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* CSV result */}
        {csvResult && (
          <div className={`mb-4 rounded-md p-3 text-sm ${csvResult.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {csvResult.error
              ? `${t('variants.uploadFail')}: ${csvResult.error}`
              : `${t('variants.uploadSuccess')}: ${csvResult.success} ${t('variants.rows')}`}
            <button onClick={() => setCsvResult(null)} className="ml-2 font-medium underline">
              &times;
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('variants.search')}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          />
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0) }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          >
            <option value="">{t('variants.allTypes')}</option>
            {typeOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <select
            value={sigFilter}
            onChange={(e) => { setSigFilter(e.target.value); setPage(0) }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          >
            <option value="">{t('variants.allSignificance')}</option>
            {significanceOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : (
          <VariantTable
            variants={variants}
            canEdit={canEdit}
            onEdit={openEditModal}
            onDelete={handleDelete}
          />
        )}

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <p>
            {totalCount > 0
              ? lang === 'ko'
                ? `${showFrom}–${showTo} / ${totalCount.toLocaleString()}개 변이`
                : `Showing ${showFrom}–${showTo} of ${totalCount.toLocaleString()} variants`
              : lang === 'ko' ? '변이 없음' : 'No variants'}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:opacity-40"
            >
              {t('variants.previous')}
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
              className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-50 disabled:opacity-40"
            >
              {t('variants.next')}
            </button>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                {editingVariant ? t('variants.edit') : t('variants.addVariant')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">{t('variants.gene')} *</label>
                  <input type="text" value={form.gene} onChange={(e) => setForm({ ...form, gene: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">{t('variants.variant')} *</label>
                  <input type="text" value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">{t('variants.type')} *</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none">
                    {typeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">{t('variants.significance')} *</label>
                  <select value={form.significance} onChange={(e) => setForm({ ...form, significance: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none">
                    {significanceOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">{t('variants.families')}</label>
                  <input type="number" value={form.families} onChange={(e) => setForm({ ...form, families: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">{t('variants.chromosome')}</label>
                  <input type="text" value={form.chromosome} onChange={(e) => setForm({ ...form, chromosome: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">{t('variants.position')}</label>
                  <input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">{t('variants.inheritance')}</label>
                  <select value={form.inheritance} onChange={(e) => setForm({ ...form, inheritance: e.target.value })}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none">
                    {inheritanceOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700">{t('variants.notes')}</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setShowModal(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-gray-50">
                  {t('variants.cancel')}
                </button>
                <button onClick={handleSave}
                  disabled={!form.gene || !form.variant}
                  className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50">
                  {t('variants.save')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
