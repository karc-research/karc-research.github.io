import { useLang } from '../../contexts/LangContext'

const significanceBadge = {
  pathogenic: 'bg-red-100 text-red-700',
  likely_pathogenic: 'bg-orange-100 text-orange-700',
  vus: 'bg-yellow-100 text-yellow-700',
  benign: 'bg-green-100 text-green-700',
}

const significanceLabel = {
  pathogenic: 'Pathogenic',
  likely_pathogenic: 'Likely Pathogenic',
  vus: 'VUS',
  benign: 'Benign',
}

export default function VariantTable({ variants, canEdit, onEdit, onDelete }) {
  const { t } = useLang()

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('variants.gene')}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('variants.variant')}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('variants.type')}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('variants.significance')}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('variants.families')}</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('variants.inheritance')}</th>
            {canEdit && (
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">{t('variants.actions')}</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {variants.map((v) => (
            <tr key={v.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-primary-600">{v.gene}</td>
              <td className="px-4 py-3 text-sm text-slate-700 font-mono">{v.variant}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{v.type}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${significanceBadge[v.significance] || 'bg-gray-100 text-gray-700'}`}>
                  {significanceLabel[v.significance] || v.significance}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-600">{v.families}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{v.inheritance || '-'}</td>
              {canEdit && (
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(v)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      {t('variants.edit')}
                    </button>
                    <button
                      onClick={() => onDelete(v)}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      {t('variants.delete')}
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
