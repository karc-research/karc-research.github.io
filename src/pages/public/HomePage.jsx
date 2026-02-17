import Hero from '../../components/public/Hero'
import ResearchCard from '../../components/public/ResearchCard'
import { useLang } from '../../contexts/LangContext'
import iconGenomics from '../../assets/icons/icon-genomics.png'
import iconClinical from '../../assets/icons/icon-clinical.png'
import iconFunctional from '../../assets/icons/icon-functional.png'
import iconCollaboration from '../../assets/icons/icon-collaboration.png'
import iconFamily from '../../assets/icons/icon-family.png'
import iconDna from '../../assets/icons/icon-dna.png'
import iconDatabase from '../../assets/icons/icon-database.png'
import logoSnu from '../../assets/logos/snu.png'
import logoKoreaUniv from '../../assets/logos/korea-univ.png'
import logoKyunghee from '../../assets/logos/kyunghee.png'
import logoIbs from '../../assets/logos/ibs.png'
import logoEwha from '../../assets/logos/ewha.png'
import logoKonkuk from '../../assets/logos/konkuk.png'
import logoKaist from '../../assets/logos/kaist.png'
import logoSkku from '../../assets/logos/skku.png'
import logoCnu from '../../assets/logos/cnu.png'
import logoSnubh from '../../assets/logos/snubh.png'
import logoKisti from '../../assets/logos/kisti.png'
import logoCha from '../../assets/logos/cha.png'
import logoDgist from '../../assets/logos/dgist.png'

const institutions = [
  { name: 'SNUBH', name_ko: '분당서울대병원', logo: logoSnubh },
  { name: 'Korea Univ.', name_ko: '고려대학교', logo: logoKoreaUniv },
  { name: 'SNU', name_ko: '서울대학교', logo: logoSnu },
  { name: 'Kyung Hee Univ.', name_ko: '경희대학교', logo: logoKyunghee },
  { name: 'IBS', name_ko: '기초과학연구원', logo: logoIbs },
  { name: 'Ewha Womans Univ.', name_ko: '이화여자대학교', logo: logoEwha },
  { name: 'KISTI', name_ko: 'KISTI', logo: logoKisti },
  { name: 'CHA Hospital', name_ko: '강남차병원', logo: logoCha },
  { name: 'Konkuk Univ.', name_ko: '건국대학교', logo: logoKonkuk },
  { name: 'KAIST', name_ko: 'KAIST', logo: logoKaist },
  { name: 'DGIST', name_ko: 'DGIST', logo: logoDgist },
  { name: 'SKKU', name_ko: '성균관대학교', logo: logoSkku },
  { name: 'CNU', name_ko: '충남대학교', logo: logoCnu },
]

const stats = [
  { key: 'families', value: '1,328' },
  { key: 'participants', value: '4,453' },
  { key: 'wgs', value: '3,835' },
  { key: 'lrwgs', value: '123' },
]

const statIcons = {
  families: iconFamily,
  participants: iconCollaboration,
  wgs: iconDna,
  lrwgs: iconDatabase,
}

export default function HomePage() {
  const { t, lang } = useLang()

  const researchAreas = [
    { iconSrc: iconGenomics, title: t('home.genomics.title'), description: t('home.genomics.desc') },
    { iconSrc: iconClinical, title: t('home.clinical.title'), description: t('home.clinical.desc') },
    { iconSrc: iconFunctional, title: t('home.functional.title'), description: t('home.functional.desc') },
    { iconSrc: iconCollaboration, title: t('home.collaboration.title'), description: t('home.collaboration.desc') },
  ]

  const recentUpdates = lang === 'ko'
    ? [
        { date: '2026.02', title: 'K-ARC 컨소시엄 플랫폼 런칭', description: '연구 데이터 공유 및 협업을 위한 통합 플랫폼을 공개합니다.' },
        { date: '2025.12', title: '생명연구자원 성과교류회 발표', description: '제4회 생명연구자원 성과교류회에서 K-ARC 연구 성과를 발표했습니다.' },
        { date: '2025.06', title: 'Genome Medicine 논문 게재', description: 'Kim et al. (2025) 가족 표현형 편차를 활용한 자폐 de novo 변이 영향 평가 연구가 게재되었습니다.' },
      ]
    : [
        { date: 'Feb 2026', title: 'K-ARC Consortium Platform Launch', description: 'Launching an integrated platform for research data sharing and collaboration.' },
        { date: 'Dec 2025', title: 'Presentation at Bioresource Conference', description: 'K-ARC research achievements presented at the 4th National Bioresource Conference.' },
        { date: 'Jun 2025', title: 'Publication in Genome Medicine', description: 'Kim et al. (2025) published on evaluating familial phenotype deviation to measure de novo mutation impact in autism.' },
      ]

  return (
    <div>
      <Hero />

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold text-slate-900">{t('home.stats.title')}</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.key} className="rounded-lg bg-primary-50 p-6 text-center">
                <img src={statIcons[s.key]} alt="" className="mx-auto h-10 w-10 object-contain mb-2" />
                <p className="text-3xl font-bold text-primary-700">{s.value}</p>
                <p className="mt-1 text-base font-medium text-slate-600">{t(`home.stats.${s.key}`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Areas */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">{t('home.researchAreas')}</h2>
            <p className="mt-2 text-lg text-slate-600">{t('home.researchAreasDesc')}</p>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {researchAreas.map((area) => (
              <ResearchCard key={area.title} {...area} />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Updates */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold text-slate-900">{t('home.updates')}</h2>
          <div className="mt-8 space-y-6">
            {recentUpdates.map((update) => (
              <div key={update.title} className="rounded-lg border border-gray-200 bg-white p-6">
                <span className="text-base font-medium text-primary-600">{update.date}</span>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{update.title}</h3>
                <p className="mt-1 text-base text-slate-600">{update.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Participating Institutions */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-slate-900">
            {lang === 'ko' ? '참여 기관' : 'Participating Institutions'}
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-8">
            {institutions.map((inst) => (
              <div key={inst.name} className="flex flex-col items-center gap-2 w-20">
                {inst.logo ? (
                  <img
                    src={inst.logo}
                    alt={lang === 'ko' ? inst.name_ko : inst.name}
                    className="h-14 w-14 object-contain grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                    <span className="text-[10px] font-bold text-slate-400">{inst.name}</span>
                  </div>
                )}
                <span className="text-[11px] text-slate-500 text-center leading-tight">
                  {lang === 'ko' ? inst.name_ko : inst.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
