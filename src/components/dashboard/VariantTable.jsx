import { useState, Fragment } from 'react'
import { useLang } from '../../contexts/LangContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Pencil, Trash2, ArrowUp, ArrowDown, ArrowUpDown, ChevronDown, MessageSquare } from 'lucide-react'
import VariantExpandedRow from './VariantExpandedRow'

function SortableHead({ field, label, sortField, sortDir, onSort }) {
  const isActive = sortField === field
  return (
    <TableHead
      className="px-4 py-3 cursor-pointer select-none hover:bg-gray-100 transition-colors"
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive ? (
          sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 text-slate-300" />
        )}
      </span>
    </TableHead>
  )
}

export default function VariantTable({
  variants, canEdit, isAdmin, onEdit, onDelete,
  sortField, sortDir, onSort,
  selectedIds, onSelectChange,
  onRefresh,
}) {
  const { t } = useLang()
  const [expandedId, setExpandedId] = useState(null)

  const allSelected = variants.length > 0 && variants.every((v) => selectedIds.has(v.id))
  const someSelected = variants.some((v) => selectedIds.has(v.id))

  function handleSelectAll() {
    if (allSelected) {
      onSelectChange(new Set())
    } else {
      onSelectChange(new Set(variants.map((v) => v.id)))
    }
  }

  function handleSelectOne(e, id) {
    e.stopPropagation()
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    onSelectChange(next)
  }

  function formatVariantId(v) {
    if (!v.chromosome || !v.position) return null
    const chr = `chr${v.chromosome.replace(/^chr/i, '')}`
    const parts = [chr, v.position]
    if (v.ref_allele) parts.push(v.ref_allele)
    if (v.alt_allele) parts.push(v.alt_allele)
    return parts.join(':')
  }

  const columns = [
    { field: 'gene', label: t('variants.gene') },
    { field: 'position', label: 'Variant ID' },
    { field: 'consequence', label: t('variants.consequence') },
    { field: 'rank', label: t('variants.rank') },
    { field: 'comment_count', label: t('variants.comments') },
    { field: 'created_at', label: t('variants.date') },
  ]

  // colSpan for expanded row
  const colSpan = columns.length + (canEdit ? 2 : 0) + 1 // +1 for expand col, +2 for checkbox+actions

  return (
    <div className="rounded-lg border border-gray-200 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            {canEdit && (
              <TableHead className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected }}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </TableHead>
            )}
            {columns.map((col) => (
              <SortableHead
                key={col.field}
                field={col.field}
                label={col.label}
                sortField={sortField}
                sortDir={sortDir}
                onSort={onSort}
              />
            ))}
            <TableHead className="px-4 py-3 w-12"></TableHead>
            {canEdit && (
              <TableHead className="px-4 py-3 w-20"></TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((v) => {
            const isExpanded = expandedId === v.id
            const count = v.comment_count || 0
            return (
              <Fragment key={v.id}>
                <TableRow
                  className={`cursor-pointer transition-colors ${selectedIds.has(v.id) ? 'bg-primary-50/50' : isExpanded ? 'bg-slate-50' : 'hover:bg-gray-50'}`}
                  onClick={() => setExpandedId(isExpanded ? null : v.id)}
                >
                  {canEdit && (
                    <TableCell className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(v.id)}
                        onChange={(e) => handleSelectOne(e, v.id)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                  )}
                  <TableCell className="px-4 py-3 font-medium text-primary-600 whitespace-nowrap">{v.gene}</TableCell>
                  <TableCell className="px-4 py-3 text-slate-700 font-mono text-xs whitespace-nowrap">{formatVariantId(v) || v.variant}</TableCell>
                  <TableCell className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{v.consequence ? v.consequence.replace(/_/g, ' ') : '-'}</TableCell>
                  <TableCell className="px-4 py-3 text-slate-600 whitespace-nowrap">{v.rank || '-'}</TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    {count > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {count}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-300">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    <div>{v.created_by_profile?.full_name || '-'}</div>
                    <div className="text-slate-400">{v.created_at ? new Date(v.created_at).toLocaleDateString() : ''}</div>
                  </TableCell>
                  <TableCell className="px-4 py-3 whitespace-nowrap">
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </TableCell>
                  {canEdit && (
                    <TableCell className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon-xs" onClick={() => onEdit(v)} className="text-slate-500 hover:text-primary-600">
                          <Pencil />
                        </Button>
                        {isAdmin && (
                          <Button variant="ghost" size="icon-xs" onClick={() => onDelete(v)} className="text-slate-500 hover:text-red-600">
                            <Trash2 />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
                {isExpanded && (
                  <TableRow>
                    <VariantExpandedRow
                      variant={v}
                      colSpan={colSpan}
                      onRefresh={onRefresh}
                    />
                  </TableRow>
                )}
              </Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

