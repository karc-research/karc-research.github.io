import { useLang } from '../../contexts/LangContext'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import iconData from '../../assets/icons/icon-data.png'

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

export default function DataPage() {
  const { t, lang } = useLang()

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16">
        <div className="mx-auto max-w-6xl px-4 flex items-start gap-6">
          <img src={iconData} alt="" className="hidden sm:block h-20 w-20 object-contain flex-shrink-0 mt-1" />
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
              <Card key={ds.name} className="bg-primary-50 border-none py-0">
                <CardContent className="p-6 text-center">
                  <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider">{ds.name}</p>
                  <p className="mt-2 text-3xl font-bold text-primary-700">{ds.participants}</p>
                  <p className="mt-1 text-base text-slate-600">
                    {lang === 'ko' ? '참여자' : 'Participants'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dataset Table */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">{t('data.datasets')}</h2>
          <div className="mt-6">
            <Card className="py-0 gap-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="py-3">
                      {lang === 'ko' ? '데이터셋' : 'Dataset'}
                    </TableHead>
                    <TableHead className="py-3">
                      {lang === 'ko' ? '플랫폼' : 'Platform'}
                    </TableHead>
                    <TableHead className="py-3 text-right">
                      {lang === 'ko' ? '깊이' : 'Depth'}
                    </TableHead>
                    <TableHead className="py-3 text-right">
                      {lang === 'ko' ? '가족' : 'Families'}
                    </TableHead>
                    <TableHead className="py-3 text-right">
                      {lang === 'ko' ? '참여자' : 'Participants'}
                    </TableHead>
                    <TableHead className="py-3">
                      {lang === 'ko' ? '파이프라인' : 'Pipeline'}
                    </TableHead>
                    <TableHead className="py-3">
                      {lang === 'ko' ? '상태' : 'Status'}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datasets.map((ds) => (
                    <TableRow key={ds.name}>
                      <TableCell className="py-4">
                        <p className="font-semibold text-slate-900">{ds.name}</p>
                        <p className="text-sm text-slate-500">
                          {lang === 'ko' ? ds.fullName_ko : ds.fullName_en}
                        </p>
                      </TableCell>
                      <TableCell className="py-4 text-slate-700">{ds.platform}</TableCell>
                      <TableCell className="py-4 text-slate-700 text-right font-medium">{ds.depth}</TableCell>
                      <TableCell className="py-4 text-slate-700 text-right font-medium">{ds.families}</TableCell>
                      <TableCell className="py-4 text-slate-700 text-right font-medium">{ds.participants}</TableCell>
                      <TableCell className="py-4 text-slate-700">{ds.pipeline}</TableCell>
                      <TableCell className="py-4">
                        <Badge
                          variant="secondary"
                          className={
                            ds.status === 'Completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }
                        >
                          {ds.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
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

      {/* K-GeneBook */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">
            {lang === 'ko' ? '데이터 탐색 도구' : 'Data Exploration Tool'}
          </h2>
          <Card className="mt-6 py-0">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">K-GeneBook</h3>
                  <p className="mt-2 text-base text-slate-600 leading-relaxed max-w-2xl">
                    {lang === 'ko'
                      ? 'K-ARC 컨소시엄에서 개발한 한국인 자폐 유전자 데이터베이스입니다. 한국인 자폐 코호트에서 발견된 유전자 변이 정보를 검색하고 탐색할 수 있습니다.'
                      : 'A gene database developed by the K-ARC consortium. Explore and search genetic variant information discovered in the Korean autism cohort.'}
                  </p>
                </div>
                <Button asChild size="lg" className="shrink-0">
                  <a href="https://joonan-lab.github.io/k_genebook/" target="_blank" rel="noopener noreferrer">
                    {lang === 'ko' ? 'K-GeneBook 열기' : 'Open K-GeneBook'}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
