import { useLang } from '../../contexts/LangContext'
import { Link } from 'react-router-dom'
import iconKoreaDna from '../../assets/icons/icon-korea-dna.png'

const datasets = [
  {
    name: 'WGS (Illumina)',
    fullName_en: 'Short-read Whole Genome Sequencing',
    fullName_ko: '단일리드 전장유전체 시퀀싱',
    families: '1,145',
    participants: '3,835',
    platform: 'Illumina HiSeq X / NovaSeq X',
    depth: '~30X',
    pipeline: 'DRAGEN (GRCh38)',
    status: 'Completed',
  },
  {
    name: 'WGS (PacBio)',
    fullName_en: 'Long-read Whole Genome Sequencing',
    fullName_ko: '롱리드 전장유전체 시퀀싱',
    families: '122',
    participants: '368',
    platform: 'PacBio Revio HiFi',
    depth: '~30X',
    pipeline: '-',
    status: 'In progress',
  },
  {
    name: 'WES',
    fullName_en: 'Whole Exome Sequencing',
    fullName_ko: '전장엑솜 시퀀싱',
    families: '61',
    participants: '250',
    platform: 'Illumina HiSeq X',
    depth: '~150X',
    pipeline: 'GATK (GRCh38)',
    status: 'Completed',
  },
]

const statusStyle = {
  Completed: 'bg-green-100 text-green-700',
  'In progress': 'bg-yellow-100 text-yellow-700',
}

export default function DataPage() {
  const { t, lang } = useLang()

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16">
        <div className="mx-auto max-w-6xl px-4 flex items-start gap-6">
          <img src={iconKoreaDna} alt="" className="hidden sm:block h-20 w-20 object-contain flex-shrink-0 mt-1" />
          <div>
            <h1 className="text-4xl font-bold text-slate-900">{t('data.title')}</h1>
            <p className="mt-4 max-w-3xl text-xl text-slate-600 leading-relaxed">
              {t('data.intro')}
            </p>
          </div>
        </div>
      </section>

      {/* Summary Stats */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-3 gap-6">
            {datasets.map((ds) => (
              <div key={ds.name} className="rounded-lg bg-primary-50 p-6 text-center">
                <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider">{ds.name}</p>
                <p className="mt-2 text-3xl font-bold text-primary-700">{ds.participants}</p>
                <p className="mt-1 text-base text-slate-600">
                  {lang === 'ko' ? '참여자' : 'Participants'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dataset Table */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">{t('data.datasets')}</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300 text-left">
                  <th className="py-3 pr-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    {lang === 'ko' ? '데이터셋' : 'Dataset'}
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    {lang === 'ko' ? '플랫폼' : 'Platform'}
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-700 uppercase tracking-wider text-right">
                    {lang === 'ko' ? '깊이' : 'Depth'}
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-700 uppercase tracking-wider text-right">
                    {lang === 'ko' ? '가족' : 'Families'}
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-700 uppercase tracking-wider text-right">
                    {lang === 'ko' ? '참여자' : 'Participants'}
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    {lang === 'ko' ? '파이프라인' : 'Pipeline'}
                  </th>
                  <th className="py-3 pl-4 text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    {lang === 'ko' ? '상태' : 'Status'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((ds) => (
                  <tr key={ds.name} className="border-b border-gray-200 hover:bg-white transition-colors">
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-slate-900">{ds.name}</p>
                      <p className="text-sm text-slate-500">
                        {lang === 'ko' ? ds.fullName_ko : ds.fullName_en}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-base text-slate-700">{ds.platform}</td>
                    <td className="py-4 px-4 text-base text-slate-700 text-right font-medium">{ds.depth}</td>
                    <td className="py-4 px-4 text-base text-slate-700 text-right font-medium">{ds.families}</td>
                    <td className="py-4 px-4 text-base text-slate-700 text-right font-medium">{ds.participants}</td>
                    <td className="py-4 px-4 text-base text-slate-700">{ds.pipeline}</td>
                    <td className="py-4 pl-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusStyle[ds.status]}`}>
                        {ds.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Data Sharing - placeholder */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">{t('data.sharing')}</h2>
          <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <p className="text-lg text-slate-500">
              {lang === 'ko'
                ? '데이터 공유 및 접근 방법에 대한 안내가 곧 추가될 예정입니다.'
                : 'Information on data sharing and access policies will be available soon.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
