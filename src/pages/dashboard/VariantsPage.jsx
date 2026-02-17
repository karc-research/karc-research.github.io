import { useState, useEffect, useRef } from 'react'
import { supabase, logActivity } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { useLang } from '../../contexts/LangContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Download } from 'lucide-react'
import * as XLSX from 'xlsx'
import VariantTable from '../../components/dashboard/VariantTable'

const PAGE_SIZE = 20

const inheritanceOptions = ['de_novo', 'inherited', 'unknown']
const statusOptions = ['available', 'requested', 'in_progress', 'completed']
const consequenceOptions = [
  'missense_variant',
  'stop_gained',
  'frameshift_variant',
  'splice_donor_variant',
  'splice_acceptor_variant',
  'inframe_deletion',
  'inframe_insertion',
  'start_lost',
  'stop_lost',
  'synonymous_variant',
]

const emptyForm = {
  gene: '',
  variant: '',
  consequence: '',
  protein_change: '',
  chromosome: '',
  position: '',
  ref_allele: '',
  alt_allele: '',
  transcript: '',
  sample_id: '',
  rank: '',
  inheritance: 'unknown',
  status: 'available',
  notes: '',
}

export default function VariantsPage() {
  const { role } = useAuth()
  const { t, lang } = useLang()
  const fileInputRef = useRef(null)

  const canEdit = role === 'admin' || role === 'researcher'
  const isAdmin = role === 'admin'
  const canUpload = role === 'admin' || role === 'coordinator'

  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(0)

  // Filters
  const [search, setSearch] = useState('')
  const [rankFilter, setRankFilter] = useState('')
  const [rankOptions, setRankOptions] = useState([])

  // Sort
  const [sortField, setSortField] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editingVariant, setEditingVariant] = useState(null)
  const [form, setForm] = useState(emptyForm)

  // Selection
  const [selectedIds, setSelectedIds] = useState(new Set())

  // Upload result
  const [uploadResult, setUploadResult] = useState(null)

  useEffect(() => {
    fetchVariants()
  }, [page, search, rankFilter, sortField, sortDir])

  useEffect(() => {
    fetchRankOptions()
  }, [])

  async function fetchRankOptions() {
    if (!supabase) return
    const { data } = await supabase
      .from('variants')
      .select('rank')
      .not('rank', 'is', null)
      .limit(500)
    const unique = [...new Set((data || []).map((r) => r.rank).filter(Boolean))].sort()
    setRankOptions(unique)
  }

  async function fetchVariants() {
    if (!supabase) { setLoading(false); return }
    setLoading(true)

    let query = supabase
      .from('variants')
      .select('*, created_by_profile:profiles(full_name)', { count: 'exact' })
      .order(sortField, { ascending: sortDir === 'asc' })

    if (search) {
      query = query.or(`gene.ilike.%${search}%,variant.ilike.%${search}%,sample_id.ilike.%${search}%,protein_change.ilike.%${search}%`)
    }
    if (rankFilter) {
      query = query.eq('rank', rankFilter)
    }

    const from = page * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    query = query.range(from, to)

    const { data, count } = await query
    setVariants(data || [])
    setTotalCount(count || 0)
    setSelectedIds(new Set())
    setLoading(false)
  }

  function handleSort(field) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setPage(0)
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
      consequence: v.consequence || '',
      protein_change: v.protein_change || '',
      chromosome: v.chromosome || '',
      position: v.position || '',
      ref_allele: v.ref_allele || '',
      alt_allele: v.alt_allele || '',
      transcript: v.transcript || '',
      sample_id: v.sample_id || '',
      rank: v.rank || '',
      inheritance: v.inheritance || 'unknown',
      status: v.status || 'available',
      notes: v.notes || '',
    })
    setShowModal(true)
  }

  async function handleSave() {
    if (!supabase) return
    const payload = {
      ...form,
      position: form.position ? Number(form.position) : null,
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
    setSelectedIds(new Set())
    fetchVariants()
  }

  async function handleBulkDelete() {
    const count = selectedIds.size
    const msg = lang === 'ko'
      ? `선택한 ${count}개 변이를 삭제하시겠습니까?`
      : `Delete ${count} selected variant${count > 1 ? 's' : ''}?`
    if (!confirm(msg)) return
    const ids = [...selectedIds]
    await supabase.from('variants').delete().in('id', ids)
    await logActivity('variants_bulk_deleted', `${count} variants`)
    setSelectedIds(new Set())
    fetchVariants()
  }

  function handleDownloadTemplate() {
    const templateData = [
      {
        gene: 'SHANK3',
        variant: 'c.1234A>G',
        consequence: 'missense_variant',
        protein_change: 'p.Arg412Gly',
        chromosome: '22',
        position: 51135990,
        ref_allele: 'A',
        alt_allele: 'G',
        transcript: 'ENST00000262795',
        sample_id: 'KARC-001',
        rank: '1',
        inheritance: 'de_novo',
        notes: 'Example entry',
      },
    ]
    const ws = XLSX.utils.json_to_sheet(templateData)
    const colWidths = Object.keys(templateData[0]).map((key) => ({ wch: Math.max(key.length, 18) }))
    ws['!cols'] = colWidths
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Variants')
    XLSX.writeFile(wb, 'karc_variants_template.xlsx')
  }

  async function handleExcelUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadResult(null)

    const data = await file.arrayBuffer()
    const wb = XLSX.read(data)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const jsonRows = XLSX.utils.sheet_to_json(ws)

    if (jsonRows.length === 0) {
      setUploadResult({ success: 0, fail: 0, error: 'Empty file' })
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const requiredCols = ['gene', 'variant']
    const headers = Object.keys(jsonRows[0]).map((h) => h.toLowerCase().trim())
    const missing = requiredCols.filter((c) => !headers.includes(c))
    if (missing.length > 0) {
      setUploadResult({ success: 0, fail: 0, error: `Missing columns: ${missing.join(', ')}` })
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    const rows = jsonRows.map((row) => {
      const r = {}
      Object.entries(row).forEach(([key, val]) => { r[key.toLowerCase().trim()] = val })
      return {
        gene: String(r.gene || ''),
        variant: String(r.variant || ''),
        consequence: r.consequence ? String(r.consequence) : null,
        protein_change: r.protein_change ? String(r.protein_change) : null,
        chromosome: r.chromosome ? String(r.chromosome) : null,
        position: r.position ? Number(r.position) : null,
        ref_allele: r.ref_allele ? String(r.ref_allele) : null,
        alt_allele: r.alt_allele ? String(r.alt_allele) : null,
        transcript: r.transcript ? String(r.transcript) : null,
        sample_id: r.sample_id ? String(r.sample_id) : null,
        rank: r.rank != null ? String(r.rank) : null,
        inheritance: r.inheritance ? String(r.inheritance) : null,
        notes: r.notes ? String(r.notes) : null,
        created_by: user?.id,
      }
    })

    const { error } = await supabase.from('variants').insert(rows)
    if (error) {
      setUploadResult({ success: 0, fail: rows.length, error: error.message })
    } else {
      setUploadResult({ success: rows.length, fail: 0 })
      await logActivity('variants_excel_uploaded', `${rows.length} variants from ${file.name}`)
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
          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <Button onClick={openAddModal}>
                {t('variants.addVariant')}
              </Button>
            )}
            {canUpload && (
              <>
                <label className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>
                      {t('variants.uploadExcel')}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleExcelUpload}
                        className="hidden"
                      />
                    </span>
                  </Button>
                </label>
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4" />
                  {t('variants.downloadTemplate')}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Upload result */}
        {uploadResult && (
          <div className={`mb-4 rounded-md p-3 text-sm ${uploadResult.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {uploadResult.error
              ? `${t('variants.uploadFail')}: ${uploadResult.error}`
              : `${t('variants.uploadSuccess')}: ${uploadResult.success} ${t('variants.rows')}`}
            <button onClick={() => setUploadResult(null)} className="ml-2 font-medium underline">
              &times;
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('variants.search')}
            className="w-auto"
          />
          <select
            value={rankFilter}
            onChange={(e) => { setRankFilter(e.target.value); setPage(0) }}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
          >
            <option value="">{t('variants.allRanks')}</option>
            {rankOptions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div className="mb-4 flex items-center gap-3 rounded-md bg-primary-50 border border-primary-200 px-4 py-2">
            <span className="text-sm font-medium text-primary-700">
              {lang === 'ko'
                ? `${selectedIds.size}개 선택됨`
                : `${selectedIds.size} selected`}
            </span>
            {isAdmin && (
              <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                {t('variants.delete')}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
              {t('variants.cancel')}
            </Button>
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
        ) : (
          <VariantTable
            variants={variants}
            canEdit={canEdit}
            isAdmin={isAdmin}
            onEdit={openEditModal}
            onDelete={handleDelete}
            sortField={sortField}
            sortDir={sortDir}
            onSort={handleSort}
            selectedIds={selectedIds}
            onSelectChange={setSelectedIds}
            onRefresh={fetchVariants}
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              {t('variants.previous')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
            >
              {t('variants.next')}
            </Button>
          </div>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVariant ? t('variants.edit') : t('variants.addVariant')}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('variants.gene')} *</Label>
                <Input type="text" value={form.gene} onChange={(e) => setForm({ ...form, gene: e.target.value })} placeholder="SHANK3" />
              </div>
              <div className="space-y-2">
                <Label>{t('variants.variant')} *</Label>
                <Input type="text" value={form.variant} onChange={(e) => setForm({ ...form, variant: e.target.value })} placeholder="c.1234A>G" />
              </div>
              <div className="space-y-2">
                <Label>{t('variants.consequence')}</Label>
                <select value={form.consequence} onChange={(e) => setForm({ ...form, consequence: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none">
                  <option value="">—</option>
                  {consequenceOptions.map((o) => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t('variants.proteinChange')}</Label>
                <Input type="text" value={form.protein_change} onChange={(e) => setForm({ ...form, protein_change: e.target.value })} placeholder="p.Arg412Gly" />
              </div>
              <div className="space-y-2">
                <Label>{t('variants.chromosome')}</Label>
                <Input type="text" value={form.chromosome} onChange={(e) => setForm({ ...form, chromosome: e.target.value })} placeholder="22" />
              </div>
              <div className="space-y-2">
                <Label>{t('variants.position')}</Label>
                <Input type="number" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="51135990" />
              </div>
              <div className="space-y-2">
                <Label>Ref / Alt</Label>
                <div className="flex gap-2">
                  <Input type="text" value={form.ref_allele} onChange={(e) => setForm({ ...form, ref_allele: e.target.value })} placeholder="Ref" />
                  <Input type="text" value={form.alt_allele} onChange={(e) => setForm({ ...form, alt_allele: e.target.value })} placeholder="Alt" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('variants.transcript')}</Label>
                <Input type="text" value={form.transcript} onChange={(e) => setForm({ ...form, transcript: e.target.value })} placeholder="ENST00000262795" />
              </div>
              <div className="space-y-2">
                <Label>{t('variants.sampleId')}</Label>
                <Input type="text" value={form.sample_id} onChange={(e) => setForm({ ...form, sample_id: e.target.value })} placeholder="KARC-001" />
              </div>
              <div className="space-y-2">
                <Label>{t('variants.rank')}</Label>
                <Input type="text" value={form.rank} onChange={(e) => setForm({ ...form, rank: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{t('variants.inheritance')}</Label>
                <select value={form.inheritance} onChange={(e) => setForm({ ...form, inheritance: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none">
                  {inheritanceOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t('variants.status')}</Label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none">
                  {statusOptions.map((o) => <option key={o} value={o}>{t(`variants.status.${o}`)}</option>)}
                </select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>{t('variants.notes')}</Label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none" />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                {t('variants.cancel')}
              </Button>
              <Button onClick={handleSave} disabled={!form.gene || !form.variant}>
                {t('variants.save')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
