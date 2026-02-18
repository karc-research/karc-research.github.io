import { useLang } from '../../contexts/LangContext'
import iconSupport from '../../assets/icons/icon-support.png'

const donationLinks = [
  {
    name_en: 'Seoul National University Bundang Hospital',
    name_ko: '분당서울대학병원',
    desc_en: 'Donate through SNUBH Development Fund',
    desc_ko: '분당서울대학병원 발전기금을 통한 기부',
    url: 'https://www.snubh.org/dh/main/index.do?DP_CD=HCD7&MENU_ID=003004',
  },
  {
    name_en: 'Korea University',
    name_ko: '고려대학교',
    desc_en: 'Donate through Korea University Development Fund',
    desc_ko: '고려대학교 발전기금을 통한 기부',
    url: 'https://120.korea.ac.kr/donation-information',
  },
]

export default function SupportPage() {
  const { t, lang } = useLang()

  const reasons = lang === 'ko'
    ? [
        { title: '유전체 연구 가속화', desc: '최첨단 시퀀싱 기술을 통해 자폐와 관련된 새로운 유전적 요인을 발견하는 연구를 지원합니다.' },
        { title: '가족 중심 연구', desc: '가족 단위의 종합적인 임상 평가와 유전체 분석을 통해 보다 정확한 이해를 돕는 연구에 기여합니다.' },
        { title: '국제 협력 강화', desc: '전 세계 주요 연구 기관과의 공동 연구를 통해 한국인 고유의 유전적 특성을 밝히는 데 힘을 보탭니다.' },
        { title: '미래 세대를 위한 투자', desc: '오늘의 연구가 내일 자폐인과 가족들에게 더 나은 이해와 지원을 제공하는 밑거름이 됩니다.' },
      ]
    : [
        { title: 'Accelerating Genomic Research', desc: 'Support cutting-edge sequencing technologies to discover new genetic factors associated with autism.' },
        { title: 'Family-Centered Studies', desc: 'Contribute to research that combines comprehensive family-based clinical assessments with genomic analysis.' },
        { title: 'Strengthening Global Collaboration', desc: 'Help build international research networks to uncover genetic characteristics unique to the Korean population.' },
        { title: 'Investing in the Future', desc: "Today's research lays the foundation for better understanding and support for autistic individuals and their families." },
      ]

  const impacts = lang === 'ko'
    ? [
        { value: '1,328', label: '가족이 이미 연구에 참여' },
        { value: '4,453', label: '명의 참여자 데이터 축적' },
        { value: '20+', label: '편의 주요 학술 논문 발표' },
        { value: '7+', label: '개국 국제 공동연구 진행' },
      ]
    : [
        { value: '1,328', label: 'Families already participating' },
        { value: '4,453', label: 'Participant records collected' },
        { value: '20+', label: 'Major publications produced' },
        { value: '7+', label: 'Countries in collaboration' },
      ]

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16">
        <div className="mx-auto max-w-6xl px-4 flex items-start gap-6">
          <img src={iconSupport} alt="" className="hidden sm:block h-20 w-20 object-contain flex-shrink-0 mt-1" />
          <div>
            <h1 className="text-4xl font-bold text-slate-900">{t('support.title')}</h1>
            <p className="mt-4 max-w-3xl text-xl text-slate-600 leading-relaxed">
              {t('support.intro')}
            </p>
          </div>
        </div>
      </section>

      {/* Current funding context */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">{t('support.current')}</h2>
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-8">
            <p className="text-lg text-slate-700 leading-relaxed">
              {lang === 'ko'
                ? 'K-ARC의 연구는 지금까지 정부 R&D 연구비의 지원으로 수행되어 왔습니다. 덕분에 동아시아 최대 규모의 자폐 유전체 코호트를 구축하고, 의미 있는 연구 성과를 이어올 수 있었습니다.'
                : 'K-ARC research has been sustained through government R&D funding. Thanks to this support, we have built one of the largest autism genomic cohorts in East Asia and produced meaningful scientific contributions.'}
            </p>
            <p className="mt-4 text-lg text-slate-700 leading-relaxed">
              {lang === 'ko'
                ? '미국, 유럽 등 해외에서는 개인 기부자와 민간 재단의 후원이 자폐 연구의 큰 원동력이 되고 있습니다. 한국에서도 이러한 기부 문화가 확산된다면, 정부 지원만으로는 시도하기 어려운 더 다양하고 혁신적인 연구를 수행하여 자폐인과 가족에게 실질적인 도움을 줄 수 있을 것입니다.'
                : 'In the United States and Europe, private donors and foundations are a major driving force behind autism research. If a similar culture of giving takes root in Korea, it would enable more diverse and innovative studies beyond what government funding alone can support — research that can make a real difference for autistic individuals and their families.'}
            </p>
          </div>
        </div>
      </section>

      {/* Why support */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">{t('support.why')}</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {reasons.map((r) => (
              <div key={r.title} className="rounded-lg border border-gray-200 bg-white p-6">
                <h3 className="font-semibold text-slate-900">{r.title}</h3>
                <p className="mt-2 text-base text-slate-600 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">{t('support.impact')}</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {impacts.map((item) => (
              <div key={item.label} className="rounded-lg bg-primary-50 border border-gray-200 p-6 text-center">
                <p className="text-3xl font-bold text-primary-700">{item.value}</p>
                <p className="mt-1 text-base text-slate-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Next-generation researchers */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">
            {lang === 'ko' ? '다음 세대 연구자를 위한 후원' : 'Investing in the Next Generation'}
          </h2>
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-8">
            <p className="text-lg text-slate-700 leading-relaxed">
              {lang === 'ko'
                ? '자폐 연구는 한 세대의 노력으로 끝나지 않습니다. 지금의 연구를 이어받아 더 깊이 파고들 젊은 연구자들이 필요합니다. K-ARC는 대학원생과 박사후연구원들이 자폐 유전체 연구에 전념할 수 있도록 지원하고 있으며, 이들 중 일부는 이미 Oxford, Toronto 등 세계적인 연구 기관에서 활동하고 있습니다.'
                : 'Autism research does not end with a single generation of effort. It requires young researchers who can carry forward and deepen the work. K-ARC supports graduate students and postdoctoral fellows dedicated to autism genomics, some of whom are already working at leading institutions such as Oxford and Toronto.'}
            </p>
            <p className="mt-4 text-lg text-slate-700 leading-relaxed">
              {lang === 'ko'
                ? '여러분의 후원은 이 연구자들이 안정적으로 연구에 집중할 수 있는 환경을 만듭니다. 자폐 연구의 깊이를 더하고, 한국에서 출발한 연구가 세계로 이어지는 흐름을 함께 만들어 주세요.'
                : 'Your support helps create an environment where these researchers can focus on their work with stability. Help deepen the layers of autism research and sustain the flow of discoveries from Korea to the world.'}
            </p>
          </div>
        </div>
      </section>

      {/* How to support - Donation links */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold text-slate-900">{t('support.how')}</h2>
          <p className="mt-3 text-lg text-slate-600">
            {lang === 'ko'
              ? '현재 K-ARC 전용 기부 창구는 준비 중입니다. 아래 소속 기관의 발전기금을 통해 자폐 연구를 지정 기부하실 수 있습니다.'
              : 'A dedicated K-ARC donation channel is being prepared. In the meantime, you can make a designated donation for autism research through the development funds of our affiliated institutions below.'}
          </p>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {donationLinks.map((d) => (
              <a
                key={d.url}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg border border-gray-200 bg-white p-6 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">
                  {lang === 'ko' ? d.name_ko : d.name_en}
                </h3>
                <p className="mt-2 text-base text-slate-600">
                  {lang === 'ko' ? d.desc_ko : d.desc_en}
                </p>
                <p className="mt-3 text-sm font-medium text-primary-600 group-hover:text-primary-700">
                  {lang === 'ko' ? '기부 페이지 방문' : 'Visit donation page'} &rarr;
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
