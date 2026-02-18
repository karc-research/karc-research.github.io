import { useState } from 'react'
import { useLang } from '../../contexts/LangContext'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'
import iconCollaboration from '../../assets/icons/icon-collaboration.png'
import iconAiBrain from '../../assets/icons/icon-ai-brain.png'
import iconClinicalBrain from '../../assets/icons/icon-clinical-brain.png'
import iconMolecular from '../../assets/icons/icon-molecular.png'
import iconGlobalNetwork from '../../assets/icons/icon-global-network.png'
import iconClinicalCheckup from '../../assets/icons/icon-clinical-checkup.png'
import iconTranslational from '../../assets/icons/icon-translational.png'

const members = [
  // Omics & AI
  { name: 'Prof. Min-Sik Kim', name_ko: '김민식 교수', institution: 'DGIST', institution_ko: 'DGIST', area: 'OmicsAI',
    desc_ko: '단백체 멀티오믹스를 이용한 자폐 아동의 발달을 추적합니다', desc: 'Tracks the development of children with autism using proteomic multi-omics' },
  { name: 'Prof. Jun Kim', name_ko: '김준 교수', institution: 'CNU', institution_ko: '충남대학교', area: 'OmicsAI',
    desc_ko: '롱리드 시퀀싱을 이용해 복잡한 미해결 유전변이 연구를 합니다', desc: 'Studies complex unresolved genetic variants using long-read sequencing' },
  { name: 'Prof. Hong-Hee Won', name_ko: '원홍희 교수', institution: 'Sungkyunkwan Univ.', institution_ko: '성균관대학교', area: 'OmicsAI',
    desc_ko: '자폐 GWAS 연구를 수행합니다', desc: 'Conducts autism GWAS research' },
  { name: 'Prof. Jeong-Ho Lee', name_ko: '이정호 교수', institution: 'KAIST', institution_ko: 'KAIST', area: 'OmicsAI' },
  { name: 'Director Jun-Hak Lee', name_ko: '이준학 단장', institution: 'KISTI', institution_ko: 'KISTI', area: 'OmicsAI',
    desc_ko: '슈퍼컴퓨팅으로 자폐 연구 데이터처리를 가속화 합니다', desc: 'Accelerates autism research data processing with supercomputing' },
  { name: 'Prof. Jung-Kyoon Choi', name_ko: '최정균 교수', institution: 'KAIST', institution_ko: 'KAIST', area: 'OmicsAI' },
  { name: 'Prof. Sang-Hyuk Lee', name_ko: '이상혁 교수', institution: 'Ewha Womans Univ.', institution_ko: '이화여자대학교', area: 'OmicsAI' },
  { name: 'Prof. Minji Jeon', name_ko: '전민지 교수', institution: 'Korea Univ.', institution_ko: '고려대학교', area: 'OmicsAI' },
  // Clinical & Behavioural
  { name: 'Prof. So Hyun Kim', name_ko: '김소현 교수', institution: 'Korea Univ.', institution_ko: '고려대학교', area: 'Clinical' },
  { name: 'Prof. Ilbin Kim', name_ko: '김일빈 교수', institution: 'Gangnam CHA Hospital', institution_ko: '강남차병원', area: 'Clinical' },
  { name: 'Prof. Miae Oh', name_ko: '오미애 교수', institution: 'Kyunghee Univ.', institution_ko: '경희대학교', area: 'Clinical' },
  // Molecular & Translational
  { name: 'Prof. Eunha Kim', name_ko: '김은하 교수', institution: 'Korea Univ.', institution_ko: '고려대학교', area: 'Molecular',
    desc_ko: '사이토카인과 장내미생물을 통한 자폐 기전을 연구합니다', desc: 'Studies autism mechanisms through cytokines and gut microbiome' },
  { name: 'Prof. Jaesang Kim', name_ko: '김재상 교수', institution: 'Ewha Womans Univ.', institution_ko: '이화여자대학교', area: 'Molecular' },
  { name: 'Prof. Woong Sun', name_ko: '선웅 교수', institution: 'Korea Univ.', institution_ko: '고려대학교', area: 'Molecular',
    desc_ko: '뇌 오가노이드를 활용하여 신경발달을 연구합니다', desc: 'Studies neurodevelopment using brain organoids' },
  { name: 'Prof. Chan-Young Shin', name_ko: '신찬영 교수', institution: 'Konkuk Univ.', institution_ko: '건국대학교', area: 'Molecular' },
  { name: 'Prof. Daekee Lee', name_ko: '이대기 교수', institution: 'Ewha Womans Univ.', institution_ko: '이화여자대학교', area: 'Molecular' },
  { name: 'Prof. Seungbok Lee', name_ko: '이승복 교수', institution: 'Seoul National Univ.', institution_ko: '서울대학교', area: 'Molecular' },
  { name: 'Prof. Suk-Ho Lee', name_ko: '이석호 교수', institution: 'Seoul National Univ.', institution_ko: '서울대학교', area: 'Molecular' },
  { name: 'Prof. Yong-Seok Lee', name_ko: '이용석 교수', institution: 'Seoul National Univ.', institution_ko: '서울대학교', area: 'Molecular',
    desc_ko: '자폐 유전자의 시냅스 및 RAS 경로를 연구합니다', desc: 'Studies synapse and RAS pathways of autism genes' },
  { name: 'Prof. Ji-Yeon Lee', name_ko: '이지연 교수', institution: 'Seoul National Univ.', institution_ko: '서울대학교', area: 'Molecular' },
  { name: 'Prof. Sung-Oh Huh', name_ko: '허성오 교수', institution: 'Hallym Univ.', institution_ko: '한림대학교', area: 'Molecular' },
  { name: 'Prof. Sejin Jeon', name_ko: '전세진 교수', institution: 'Hallym Univ.', institution_ko: '한림대학교', area: 'Molecular' },
  // International
  { name: 'Donna Werling', institution: 'UW Madison', area: 'International' },
  { name: 'Stephan Sanders', institution: 'Univ. of Oxford', area: 'International' },
  { name: 'Stephen Scherer', institution: 'Univ. of Toronto / SickKids Hospital', area: 'International' },
  { name: 'Brett Trost', institution: 'Univ. of Toronto / SickKids Hospital', area: 'International' },
  { name: 'Anders Børglum', institution: 'Aarhus Univ.', area: 'International' },
  { name: 'Jakob Grove', institution: 'Aarhus Univ.', area: 'International' },
]

const areaLabels = {
  OmicsAI: { en: 'Omics & AI Working Group', ko: '오믹스 & AI 워킹그룹', icon: iconAiBrain },
  Clinical: { en: 'Clinical & Behavioural Working Group', ko: '임상 & 행동 워킹그룹', icon: iconClinicalBrain },
  Molecular: { en: 'Molecular & Translational Working Group', ko: '분자 & 중개연구 워킹그룹', icon: iconMolecular },
  International: { en: 'International Collaborators', ko: '국제 협력', icon: iconGlobalNetwork },
}

export default function AboutPage() {
  const { t, lang } = useLang()
  const [expandedMember, setExpandedMember] = useState(null)

  const pipelineSteps = [
    { step: '01', icon: iconClinicalCheckup, title: t('about.pipeline.step1'), description: t('about.pipeline.step1.desc'), color: 'bg-blue-500' },
    { step: '02', icon: iconMolecular, title: t('about.pipeline.step2'), description: t('about.pipeline.step2.desc'), color: 'bg-indigo-500' },
    { step: '03', icon: iconTranslational, title: t('about.pipeline.step3'), description: t('about.pipeline.step3.desc'), color: 'bg-violet-500' },
    { step: '04', icon: iconGlobalNetwork, title: t('about.pipeline.step4'), description: t('about.pipeline.step4.desc'), color: 'bg-purple-500' },
  ]

  const areas = ['OmicsAI', 'Clinical', 'Molecular', 'International']

  const leaders = [
    { role: t('about.director'), name: t('about.director.name'), affiliation: t('about.director.affiliation'), desc: t('about.director.desc') },
    { role: t('about.coleadGenomics'), name: t('about.coleadGenomics.name'), affiliation: t('about.coleadGenomics.affiliation'), desc: t('about.coleadGenomics.desc') },
    { role: t('about.coleadFunctional'), name: t('about.coleadFunctional.name'), affiliation: t('about.coleadFunctional.affiliation'), desc: t('about.coleadFunctional.desc') },
  ]

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16">
        <div className="mx-auto max-w-6xl px-4 flex items-start gap-6">
          <img src={iconCollaboration} alt="" className="hidden sm:block h-20 w-20 object-contain flex-shrink-0 mt-1" />
          <div>
            <h1 className="text-4xl font-bold text-slate-900">{t('about.title')}</h1>
            <p className="mt-4 max-w-3xl text-xl text-slate-600 leading-relaxed">
              {t('about.intro')}
            </p>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">{t('about.leadership')}</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {leaders.map((leader) => (
              <Card key={leader.name} className="py-0">
                <CardHeader className="pb-0 pt-6">
                  <p className="text-sm font-semibold text-primary-600 uppercase tracking-wider">{leader.role}</p>
                  <CardTitle className="text-xl">{leader.name}</CardTitle>
                  <CardDescription className="text-base">{leader.affiliation}</CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <p className="text-base text-slate-600">{leader.desc}</p>
                </CardContent>
              </Card>
            ))}
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
                  .map((m) => {
                    const hasDesc = lang === 'ko' ? m.desc_ko : m.desc
                    const isExpanded = expandedMember === m.name
                    return (
                      <Card
                        key={m.name}
                        className={`py-0 transition-all ${hasDesc ? 'cursor-pointer hover:shadow-md' : ''}`}
                        onClick={() => hasDesc && setExpandedMember(isExpanded ? null : m.name)}
                      >
                        <CardContent className="px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-base font-medium text-slate-700">
                                {lang === 'ko' && m.name_ko ? m.name_ko : m.name}
                              </p>
                              <p className="text-sm text-slate-500">{lang === 'ko' && m.institution_ko ? m.institution_ko : m.institution}</p>
                            </div>
                            {hasDesc && (
                              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            )}
                          </div>
                          {isExpanded && hasDesc && (
                            <p className="mt-2 pt-2 border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
                              {lang === 'ko' ? m.desc_ko : m.desc}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Future Fellows */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">{t('about.fellows')}</h2>
          <p className="mt-2 text-base text-slate-600 leading-relaxed">
            {lang === 'ko'
              ? 'K-ARC는 자폐 유전체 연구의 다음 세대를 이끌어 갈 젊은 연구자들을 함께 키워가고 있습니다.'
              : 'K-ARC is nurturing the next generation of researchers who will lead the future of autism genomics.'}
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                name: 'Yujin Kim', name_ko: '김유진',
                role_en: 'Postdoctoral Researcher', role_ko: '박사후연구원',
                institution: 'University of Oxford',
                desc_en: 'Ph.D. from Korea University. Continuing autism genomics research at Oxford.',
                desc_ko: '고려대학교 박사. Oxford에서 자폐 유전체 연구를 이어가고 있습니다.',
              },
              {
                name: 'Soo-Whee Kim', name_ko: '김수휘',
                role_en: 'Postdoctoral Researcher', role_ko: '박사후연구원',
                institution: 'University of Oxford',
                desc_en: 'Ph.D. from Korea University. Conducting research at Oxford.',
                desc_ko: '고려대학교 박사. Oxford에서 연구를 수행하고 있습니다.',
              },
              {
                name: 'Hyeji Lee', name_ko: '이혜지',
                role_en: 'Graduate Student (NRF Fellow)', role_ko: '대학원생 (한국연구재단 펠로)',
                institution: 'Korea University',
                institution_ko: '고려대학교',
                desc_en: 'NRF Fellowship recipient. Researching autism genetics at Korea University.',
                desc_ko: '한국연구재단 펠로십 수혜자. 고려대학교에서 자폐 유전학을 연구하고 있습니다.',
              },
            ].map((fellow) => (
              <Card key={fellow.name} className="py-0">
                <CardContent className="p-5">
                  <p className="text-base font-semibold text-slate-900">
                    {lang === 'ko' ? `${fellow.name_ko} (${fellow.name})` : `${fellow.name} (${fellow.name_ko})`}
                  </p>
                  <p className="mt-1 text-sm font-medium text-primary-600">
                    {lang === 'ko' ? fellow.role_ko : fellow.role_en}
                  </p>
                  <p className="text-sm text-slate-500">
                    {lang === 'ko' ? (fellow.institution_ko || fellow.institution) : fellow.institution}
                  </p>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {lang === 'ko' ? fellow.desc_ko : fellow.desc_en}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Research Pipeline */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">{t('about.pipeline')}</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pipelineSteps.map((step) => (
              <Card key={step.step} className="py-0 text-center border-none shadow-none">
                <CardContent className="p-6">
                  <div className="relative mx-auto h-16 w-16">
                    <img src={step.icon} alt="" className="h-16 w-16 object-contain" />
                    <span className={`absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold ${step.color}`}>
                      {step.step}
                    </span>
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-base text-slate-600">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
