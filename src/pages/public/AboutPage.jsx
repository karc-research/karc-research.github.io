import { useLang } from '../../contexts/LangContext'

const members = [
  // Omics
  { name: 'Min-Sik Kim', name_ko: '김민식', institution: 'DGIST', area: 'Omics' },
  { name: 'Jun Kim', name_ko: '김준', institution: 'CNU', area: 'Omics' },
  { name: 'Hong-Hee Won', name_ko: '원홍희', institution: 'Sungkyunkwan Univ.', area: 'Omics' },
  { name: 'Jeong-Ho Lee', name_ko: '이정호', institution: 'KAIST', area: 'Omics' },
  { name: 'Jun-Hak Lee', name_ko: '이준학', institution: 'KISTI', area: 'Omics' },
  { name: 'Jung-Kyoon Choi', name_ko: '최정균', institution: 'KAIST', area: 'Omics' },
  // AI
  { name: 'Sang-Hyuk Lee', name_ko: '이상혁', institution: 'Ewha Womans Univ.', area: 'AI' },
  { name: 'Minji Jeon', name_ko: '전민지', institution: 'Korea Univ.', area: 'AI' },
  // Clinical
  { name: 'So Hyun Kim', name_ko: '김소현', institution: 'Korea Univ.', area: 'Clinical' },
  { name: 'Ilbin Kim', name_ko: '김일빈', institution: 'CHA Hospital', area: 'Clinical' },
  { name: 'Miae Oh', name_ko: '오미애', institution: 'Kyunghee Univ.', area: 'Clinical' },
  // Functional
  { name: 'Eunha Kim', name_ko: '김은하', institution: 'Korea Univ.', area: 'Functional' },
  { name: 'Jaesang Kim', name_ko: '김재상', institution: 'Ewha Womans Univ.', area: 'Functional' },
  { name: 'Woong Sun', name_ko: '선웅', institution: 'Korea Univ.', area: 'Functional' },
  { name: 'Chan-Young Shin', name_ko: '신찬영', institution: 'Konkuk Univ.', area: 'Functional' },
  { name: 'Daekee Lee', name_ko: '이대기', institution: 'Ewha Womans Univ.', area: 'Functional' },
  { name: 'Yong-Seok Lee', name_ko: '이용석', institution: 'Seoul National Univ.', area: 'Functional' },
  { name: 'Ji-Yeon Lee', name_ko: '이지연', institution: 'Seoul National Univ.', area: 'Functional' },
  // International
  { name: 'Donna Werling', institution: 'UW Madison', area: 'International' },
  { name: 'Stephan Sanders', institution: 'Oxford', area: 'International' },
  { name: 'Stephen Scherer', institution: 'Toronto Univ.', area: 'International' },
  { name: 'Anders Børglum', institution: 'Aarhus Univ.', area: 'International' },
  { name: 'Jakob Grove', institution: 'Aarhus Univ.', area: 'International' },
]

const areaLabels = {
  Omics: { en: 'Omics', ko: '오믹스' },
  AI: { en: 'AI', ko: 'AI' },
  Clinical: { en: 'Clinical', ko: '임상' },
  Functional: { en: 'Functional Studies', ko: '기능연구' },
  International: { en: 'International Collaborators', ko: '국제 협력' },
}

export default function AboutPage() {
  const { t, lang } = useLang()

  const pipelineSteps = [
    { step: '01', title: t('about.pipeline.step1'), description: t('about.pipeline.step1.desc'), color: 'bg-blue-500' },
    { step: '02', title: t('about.pipeline.step2'), description: t('about.pipeline.step2.desc'), color: 'bg-indigo-500' },
    { step: '03', title: t('about.pipeline.step3'), description: t('about.pipeline.step3.desc'), color: 'bg-violet-500' },
    { step: '04', title: t('about.pipeline.step4'), description: t('about.pipeline.step4.desc'), color: 'bg-purple-500' },
  ]

  const areas = ['Omics', 'AI', 'Clinical', 'Functional', 'International']

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-4xl font-bold text-slate-900">{t('about.title')}</h1>
          <p className="mt-4 max-w-3xl text-xl text-slate-600 leading-relaxed">
            {t('about.intro')}
          </p>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">{t('about.leadership')}</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Director - Yoo */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider">{t('about.director')}</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">{t('about.director.name')}</h3>
              <p className="text-base text-slate-500">{t('about.director.affiliation')}</p>
              <p className="mt-3 text-base text-slate-600">{t('about.director.desc')}</p>
            </div>
            {/* Genomics - An */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider">{t('about.coleadGenomics')}</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">{t('about.coleadGenomics.name')}</h3>
              <p className="text-base text-slate-500">{t('about.coleadGenomics.affiliation')}</p>
              <p className="mt-3 text-base text-slate-600">{t('about.coleadGenomics.desc')}</p>
            </div>
            {/* Functional - Kim */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider">{t('about.coleadFunctional')}</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-900">{t('about.coleadFunctional.name')}</h3>
              <p className="text-base text-slate-500">{t('about.coleadFunctional.affiliation')}</p>
              <p className="mt-3 text-base text-slate-600">{t('about.coleadFunctional.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Consortium Members */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">{t('about.institutions')}</h2>
          {areas.map((area) => (
            <div key={area} className="mt-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                {areaLabels[area][lang]}
              </h3>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {members
                  .filter((m) => m.area === area)
                  .map((m) => (
                    <div key={m.name} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
                      <p className="text-base font-medium text-slate-700">
                        {lang === 'ko' && m.name_ko ? m.name_ko : m.name}
                      </p>
                      <p className="text-sm text-slate-500">{m.institution}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Research Pipeline */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">{t('about.pipeline')}</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pipelineSteps.map((step) => (
              <div key={step.step} className="text-center">
                <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-white font-bold text-lg ${step.color}`}>
                  {step.step}
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-base text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
