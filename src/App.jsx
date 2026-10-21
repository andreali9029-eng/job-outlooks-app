import React from 'react'
import { CANADA_PATHS, CANADA_VIEWBOX } from './canadaPaths'
import TrendChart from './TrendChart'
import { badgeFor } from './provinceBadges'

/* ---------- i18n ---------- */
const I18N = {
  en: {
    tagline: 'Explore employment prospects across Canada',
    searchPlaceholder: 'Search for an occupation (e.g. Welder, Nurse, Software Engineer)',
    popular: 'Popular',
    outlookByProvince: 'Outlook by Province',
    filterByRating: 'Filter by rating',
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
    updated: 'Updated',
    noData: 'No data found.',
    noResults: 'No results match your filters.',
    loading: 'Loading...',
    methodology: 'Methodology',
    faqs: 'FAQs',
    compare: 'Compare',
    addToCompare: 'Add to compare',
    comparing: 'Comparing',
    clearCompare: 'Clear',
    vs: 'vs',
    median: 'Median',
    range: 'range',
    province: 'province',
    clearProvinceFilter: 'Clear province filter',
    dataSource: 'Data source: Government of Canada, Job Bank · 3-Year Employment Outlooks (2025-2027) · Wages (2025)',
    unitsLabel: 'provinces/territories',
    bestPay: 'Best paid province',
    nationalMedian: 'National median',
    sectorMix: 'Where they work',
    outlook: 'Outlook',
    wages: 'Wages',
    close: 'Close',
    backHome: 'Back to home',
    viewJobs: 'View job postings',
    jobsHint: 'Open Job Bank to see live postings for this occupation in this province',
    trends: 'Labour Market Trends',
    tabHome: 'Home',
    tabTrends: 'Trends',
    trendsHint: 'Unemployment rate, top industries and hardest-hit occupations — updated monthly from Statistics Canada',
    unemploymentRate: 'Unemployment rate',
    trendIndustries: 'Top industries by employment',
    topUnemploymentOcc: 'Occupations with the highest unemployment',
    allCanada: 'Canada',
    noTrendData: 'No data available for this region.',
    trendSource: 'Source: Statistics Canada, Labour Force Survey (tables 14-10-0287, 14-10-0201, 14-10-0416)',
    persons: 'Persons',
    todayJobs: 'postings today',
    hotTitle: 'In-demand occupations',
    hotHint: 'Live demand signals: outlook rating, current postings and national median wage',
    topGainers: 'Fastest-growing (12 months)',
    employment: 'Employment',
    yoyChange: '12-mo change',
    postingsTrend: 'Postings over time',
    postingsTrendHint: 'Daily snapshot of live postings on Job Bank for this occupation',
    buildingHistory: 'Daily history is being collected — one snapshot per day. The trend line appears once a few days of data are built up.',
    daysOfData: 'days of data',
  },
  fr: {
    tagline: 'Explorez les perspectives d\'emploi partout au Canada',
    searchPlaceholder: 'Rechercher une profession (p. ex. soudeur, infirmier, ingénieur logiciel)',
    popular: 'Populaires',
    outlookByProvince: 'Perspectives par province',
    filterByRating: 'Filtrer par cote',
    expandAll: 'Tout déplier',
    collapseAll: 'Tout replier',
    updated: 'Mis à jour',
    noData: 'Aucune donnée trouvée.',
    noResults: 'Aucun résultat ne correspond à vos filtres.',
    loading: 'Chargement...',
    methodology: 'Méthodologie',
    faqs: 'FAQ',
    compare: 'Comparer',
    addToCompare: 'Ajouter à la comparaison',
    comparing: 'Comparaison',
    clearCompare: 'Effacer',
    vs: 'contre',
    median: 'Médiane',
    range: 'fourchette',
    province: 'province',
    clearProvinceFilter: 'Effacer le filtre de province',
    dataSource: 'Source des données : Gouvernement du Canada, Guichet-Emplois · Perspectives d\'emploi sur 3 ans (2025-2027) · Salaires (2025)',
    unitsLabel: 'provinces/territoires',
    bestPay: 'Province la mieux rémunérée',
    nationalMedian: 'Médiane nationale',
    sectorMix: 'Secteurs d\'emploi',
    outlook: 'Perspectives',
    wages: 'Salaires',
    close: 'Fermer',
    backHome: 'Retour à l\'accueil',
    viewJobs: 'Voir les offres d\'emploi',
    jobsHint: 'Ouvrir le Guichet-Emplois pour voir les offres en direct pour cette profession dans cette province',
    trends: 'Tendances du marché du travail',
    tabHome: 'Accueil',
    tabTrends: 'Tendances',
    trendsHint: 'Taux de chômage, principaux secteurs et professions les plus touchées — mis à jour mensuellement à partir de Statistique Canada',
    unemploymentRate: 'Taux de chômage',
    trendIndustries: 'Principaux secteurs d\'emploi',
    topUnemploymentOcc: 'Professions les plus touchées par le chômage',
    allCanada: 'Canada',
    noTrendData: 'Aucune donnée disponible pour cette région.',
    trendSource: 'Source : Statistique Canada, Enquête sur la population active (tableaux 14-10-0287, 14-10-0201, 14-10-0416)',
    persons: 'Personnes',
    todayJobs: 'offres aujourd\'hui',
    hotTitle: 'Professions en demande',
    hotHint: 'Signaux de demande en direct : cote des perspectives, offres actuelles et salaire médian national',
    topGainers: 'Croissance la plus rapide (12 mois)',
    employment: 'Emploi',
    yoyChange: 'Variation sur 12 mois',
    postingsTrend: 'Offres au fil du temps',
    postingsTrendHint: 'Instantané quotidien des offres en direct sur le Guichet-Emplois pour cette profession',
    buildingHistory: 'L\'historique quotidien est en cours de collecte — un instantané par jour. La courbe apparaîtra dès que quelques jours de données seront accumulés.',
    daysOfData: 'jours de données',
  },
}

const PROVINCE_NAMES = {
  en: {
    NL: 'Newfoundland and Labrador', PE: 'Prince Edward Island', NS: 'Nova Scotia',
    NB: 'New Brunswick', QC: 'Quebec', ON: 'Ontario', MB: 'Manitoba', SK: 'Saskatchewan',
    AB: 'Alberta', BC: 'British Columbia', YT: 'Yukon', NT: 'Northwest Territories', NU: 'Nunavut',
  },
  fr: {
    NL: 'Terre-Neuve-et-Labrador', PE: 'Île-du-Prince-Édouard', NS: 'Nouvelle-Écosse',
    NB: 'Nouveau-Brunswick', QC: 'Québec', ON: 'Ontario', MB: 'Manitoba', SK: 'Saskatchewan',
    AB: 'Alberta', BC: 'Colombie-Britannique', YT: 'Yukon', NT: 'Territoires du Nord-Ouest', NU: 'Nunavut',
  },
}

const OUTLOOK_CONFIG = {
  'very good': { stars: 5, key: 'very good', color: '#16a34a', bg: '#dcfce7', order: 5 },
  'good': { stars: 4, key: 'good', color: '#4ade80', bg: '#f0fdf4', order: 4 },
  'moderate': { stars: 3, key: 'moderate', color: '#ca8a04', bg: '#fef9c3', order: 3 },
  'limited': { stars: 2, key: 'limited', color: '#ea580c', bg: '#ffedd5', order: 2 },
  'very limited': { stars: 1, key: 'very limited', color: '#dc2626', bg: '#fee2e2', order: 1 },
  'undetermined': { stars: 0, key: 'undetermined', color: '#6b7280', bg: '#f3f4f6', order: 0 },
}

const OUTLOOK_LABELS = {
  en: {
    'very good': 'Very Good', 'good': 'Good', 'moderate': 'Moderate',
    'limited': 'Limited', 'very limited': 'Very Limited', 'undetermined': 'Undetermined',
  },
  fr: {
    'very good': 'Très bon', 'good': 'Bon', 'moderate': 'Modéré',
    'limited': 'Limité', 'very limited': 'Très limité', 'undetermined': 'Indéterminé',
  },
}

const METHODOLOGY = {
  en: `
<h3>How we calculate employment outlooks</h3>
<p>The 3-year Employment Outlooks estimate job prospects for 516 occupations across Canada, by province, territory, and economic region.</p>
<p>They are based on a model developed by Employment and Social Development Canada (ESDC) regional economists, combining data from all regions with statistical techniques and labour market specialist analysis.</p>
<h4>Four main indicators</h4>
<ul>
  <li><strong>Employment growth rate</strong> — projected job growth over 3 years by occupation</li>
  <li><strong>Retirement outlook</strong> — number of positions opening up due to retirements</li>
  <li><strong>Unemployment pool</strong> — number of unemployed workers with recent experience in the occupation</li>
  <li><strong>Other factors</strong> — structural changes, new technology, economic cycle effects</li>
</ul>
<h4>Rating scale</h4>
<ul>
  <li><strong>Very Good (5 stars)</strong> — excellent demand, many job openings</li>
  <li><strong>Good (4 stars)</strong> — strong demand, good opportunities</li>
  <li><strong>Moderate (3 stars)</strong> — balanced job market</li>
  <li><strong>Limited (2 stars)</strong> — few openings, competition high</li>
  <li><strong>Very Limited (1 star)</strong> — very poor prospects</li>
  <li><strong>Undetermined (0 stars)</strong> — not enough data to assess</li>
</ul>
<p>Outlooks are updated annually. The forecast covers 3 years to avoid overlap between economic cycles.</p>`,
  fr: `
<h3>Comment nous calculons les perspectives d'emploi</h3>
<p>Les perspectives d'emploi sur 3 ans estiment les débouchés pour 516 professions au Canada, par province, territoire et région économique.</p>
<p>Elles reposent sur un modèle élaboré par les économistes régionaux d'Emploi et Développement social Canada (EDSC), combinant les données de toutes les régions, des techniques statistiques éprouvées et l'analyse de spécialistes du marché du travail.</p>
<h4>Quatre indicateurs principaux</h4>
<ul>
  <li><strong>Taux de croissance de l'emploi</strong> — croissance projetée des emplois sur 3 ans par profession</li>
  <li><strong>Perspectives de retraite</strong> — nombre de postes qui se libèrent en raison des départs à la retraite</li>
  <li><strong>Bassin de chômage</strong> — nombre de chômeurs ayant de l'expérience récente dans la profession</li>
  <li><strong>Autres facteurs</strong> — changements structurels, nouvelles technologies, effets du cycle économique</li>
</ul>
<h4>Échelle de cotes</h4>
<ul>
  <li><strong>Très bon (5 étoiles)</strong> — excellente demande, nombreux débouchés</li>
  <li><strong>Bon (4 étoiles)</strong> — forte demande, bonnes possibilités</li>
  <li><strong>Modéré (3 étoiles)</strong> — marché de l'emploi équilibré</li>
  <li><strong>Limite (2 étoiles)</strong> — peu de débouchés, concurrence élevée</li>
  <li><strong>Très limité (1 étoile)</strong> — très mauvaises perspectives</li>
  <li><strong>Indéterminé (0 étoile)</strong> — données insuffisantes</li>
</ul>
<p>Les perspectives sont mises à jour chaque année. La prévision couvre 3 ans pour éviter le chevauchement de deux cycles économiques.</p>`,
}

const FAQS = {
  en: [
    { q: 'What are the 3-year employment outlooks?', a: 'They are ESDC\'s assessment of job prospects for each occupation in each region of Canada over the next 3 years, rated from Very Good to Very Limited.' },
    { q: 'How are the ratings determined?', a: 'They combine employment growth projections, retirement outlook, unemployment levels, and other labour market factors calculated by regional economists.' },
    { q: 'What does "Undetermined" mean?', a: 'There is not enough data to assign a rating. This usually happens in regions with very low employment in that occupation.' },
    { q: 'How often are outlooks updated?', a: 'Once per year, typically in December.' },
    { q: 'Why are outlooks different in different regions?', a: 'Local industry mix, employment trends, and labour supply vary by region.' },
    { q: 'Are these guaranteed predictions?', a: 'No. They are projections based on current data and trends. Actual outcomes may differ due to unforeseen economic changes.' },
  ],
  fr: [
    { q: 'Que sont les perspectives d\'emploi sur 3 ans ?', a: 'Ce sont les évaluations d\'EDSC des débouchés pour chaque profession dans chaque région du Canada au cours des 3 prochaines années, cotées de Très bon à Très limité.' },
    { q: 'Comment les cotes sont-elles déterminées ?', a: 'Elles combinent les projections de croissance de l\'emploi, les perspectives de retraite, les niveaux de chômage et d\'autres facteurs du marché du travail calculés par les économistes régionaux.' },
    { q: 'Que signifie « Indéterminé » ?', a: 'Il n\'y a pas assez de données pour attribuer une cote. Cela arrive souvent dans les régions où l\'emploi dans cette profession est très faible.' },
    { q: 'À quelle fréquence les perspectives sont-elles mises à jour ?', a: 'Une fois par année, généralement en décembre.' },
    { q: 'Pourquoi les perspectives diffèrent-elles selon les régions ?', a: 'La composition industrielle, les tendances de l\'emploi et l\'offre de main-d\'œuvre varient d\'une région à l\'autre.' },
    { q: 'S\'agit-il de prédictions garanties ?', a: 'Non. Ce sont des projections fondées sur les données et les tendances actuelles. Les résultats réels peuvent différer en raison de changements économiques imprévus.' },
  ],
}

/* ---------- helpers ---------- */
function Stars({ count }) {
  return (
    <span className="stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < count ? 'star filled' : 'star'}>★</span>
      ))}
    </span>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {typeof children === 'string'
            ? <div dangerouslySetInnerHTML={{ __html: children }} />
            : children}
        </div>
      </div>
    </div>
  )
}

function formatWage(val, isAnnual) {
  if (!val) return 'N/A'
  if (isAnnual) return `$${Math.round(val).toLocaleString()}`
  return `$${val.toFixed(2)}`
}

function CanadaMap({ provinceRatings, provinceWages, onProvinceClick, selectedProvince, lang }) {
  const [hover, setHover] = React.useState(null)
  const getColor = (code) => {
    const rating = provinceRatings[code]
    if (!rating) return '#e5e7eb'
    const cfg = OUTLOOK_CONFIG[rating] || OUTLOOK_CONFIG['undetermined']
    return cfg.color
  }
  const hoverData = hover ? (() => {
    const cfg = OUTLOOK_CONFIG[provinceRatings[hover]] || OUTLOOK_CONFIG['undetermined']
    const wage = provinceWages?.[hover]
    return {
      name: PROVINCE_NAMES[lang][hover] || hover,
      label: OUTLOOK_LABELS[lang][cfg.key],
      stars: cfg.stars,
      color: cfg.color,
      wage: wage?.median ? formatWage(wage.median, wage.annual) + (wage.annual ? '/yr' : '/hr') : null,
    }
  })() : null
  return (
    <div className="map-container">
      <svg viewBox={CANADA_VIEWBOX} className="canada-map" role="img" aria-label="Canada map">
        {CANADA_PATHS.map(p => {
          const isSel = selectedProvince === p.code
          return (
            <path
              key={p.code}
              d={p.d}
              fill={getColor(p.code)}
              stroke={isSel ? '#1e40af' : '#ffffff'}
              strokeWidth={isSel ? 3 : 1.2}
              strokeLinejoin="round"
              className={`province-path${isSel ? ' selected' : ''}${hover === p.code ? ' hovered' : ''}`}
              onClick={() => onProvinceClick(p.code)}
              onMouseEnter={() => setHover(p.code)}
              onMouseLeave={() => setHover(null)}
            >
              <title>{PROVINCE_NAMES[lang][p.code] || p.code}</title>
            </path>
          )
        })}
      </svg>
      {hoverData && (
        <div className="map-tooltip">
          <div className="map-tooltip-title">{hoverData.name}</div>
          <div className="map-tooltip-row" style={{ color: hoverData.color }}>
            <Stars count={hoverData.stars} /> {hoverData.label}
          </div>
          {hoverData.wage && (
            <div className="map-tooltip-wage">
              {I18N[lang].median}: {hoverData.wage}
            </div>
          )}
        </div>
      )}
      <div className="map-legend">
        {Object.values(OUTLOOK_CONFIG).slice().reverse().map(cfg => (
          <div key={cfg.key} className="legend-item">
            <span className="legend-color" style={{ background: cfg.color }}></span>
            <span>{OUTLOOK_LABELS[lang][cfg.key]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---------- App ---------- */
export default function App() {
  const [lang, setLang] = React.useState('en')
  const [tab, setTab] = React.useState('home')
  const [occupations, setOccupations] = React.useState([])
  const [query, setQuery] = React.useState('')
  const [selected, setSelected] = React.useState(null)
  const [occData, setOccData] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [showDropdown, setShowDropdown] = React.useState(false)
  const [expandedProvinces, setExpandedProvinces] = React.useState(new Set())
  const [expandedRegions, setExpandedRegions] = React.useState(new Set())
  const [filters, setFilters] = React.useState(new Set())
  const [modal, setModal] = React.useState(null)
  const [mapProvince, setMapProvince] = React.useState(null)
  const [compareList, setCompareList] = React.useState([])
  const [compareData, setCompareData] = React.useState({})
  const [trends, setTrends] = React.useState({ unemp: null, industry: null, occ: null })
  const [trendProvince, setTrendProvince] = React.useState('CA')
  const [jobCounts, setJobCounts] = React.useState(null)
  const [jobHistory, setJobHistory] = React.useState(null)
  const [jobsProv, setJobsProv] = React.useState(null)
  const [hotOcc, setHotOcc] = React.useState({})

  const t = I18N[lang]

  React.useEffect(() => {
    fetch('/data/occupations.json')
      .then(r => r.json())
      .then(setOccupations)
      .catch(() => {})
  }, [])

  /* Labour-market trends (StatCan pipeline output) */
  React.useEffect(() => {
    Promise.all([
      fetch('/data/trends/unemployment.json').then(r => r.json()),
      fetch('/data/trends/industry.json').then(r => r.json()),
      fetch('/data/trends/occ-unemployment.json').then(r => r.json()),
      fetch('/data/trends/jobcounts-latest.json').then(r => r.json()).catch(() => null),
      fetch('/data/trends/jobcounts-history.json').then(r => r.json()).catch(() => null),
    ]).then(([u, i, o, j, h]) => {
      setTrends({ unemp: u, industry: i, occ: o })
      setJobCounts(j)
      setJobHistory(h)
    })
      .catch(() => {})
  }, [])

  /* Load demand signals for the "In-demand occupations" cards (rating + wage) */
  const QUICK_NOCS = ['72106', '31301', '21232', '72410', '72200']
  React.useEffect(() => {
    let alive = true
    Promise.all(QUICK_NOCS.map(code =>
      fetch(`/data/occ/NOC_${code}.json`).then(r => r.json()).catch(() => null)
    )).then(list => {
      if (!alive) return
      const m = {}
      list.forEach((data, i) => {
        if (!data) return
        const code = QUICK_NOCS[i]
        const wage = (data.wages || []).find(w => w.province === 'CA') || null
        // No national rating row exists; use the most common province rating
        const ratings = (data.regions?.en || []).map(r => r.outlook).filter(Boolean)
        const counts = {}
        ratings.forEach(x => { counts[x] = (counts[x] || 0) + 1 })
        let mode = null, modeN = 0
        for (const [k, n] of Object.entries(counts)) {
          if (n > modeN) { mode = k; modeN = n }
        }
        m[code] = { wage, rating: mode, provGood: modeN, provTotal: ratings.length, title: data.title }
      })
      setHotOcc(m)
    })
    return () => { alive = false }
  }, [])

  const filtered = query.length > 1
    ? occupations.filter(o => {
        const title = (o.title[lang] || '').toLowerCase()
        const other = (o.title[lang === 'en' ? 'fr' : 'en'] || '').toLowerCase()
        const q = query.toLowerCase()
        return title.includes(q) || other.includes(q) || o.code.replace('NOC_', '').includes(q)
      }).slice(0, 10)
    : []

  const loadOccupation = async (occ, opts = {}) => {
    const { updateHistory = true } = opts
    setSelected(occ)
    setJobsProv(null)
    setQuery(occ.title[lang] || occ.title.en || '')
    setShowDropdown(false)
    setExpandedProvinces(new Set())
    setExpandedRegions(new Set())
    setFilters(new Set())
    setMapProvince(null)
    setLoading(true)
    if (updateHistory) {
      // Home -> result: push a history entry so the browser back / edge-swipe
      // returns inside the app. Result -> result: replace the current entry.
      if (window.history.state && window.history.state.code) {
        window.history.replaceState({ code: occ.code }, '')
      } else {
        window.history.pushState({ code: occ.code }, '')
      }
    }
    try {
      const res = await fetch(`/data/occ/${occ.code}.json`)
      const data = await res.json()
      setOccData(data)
    } catch (e) {
      setOccData(null)
    }
    setLoading(false)
  }

  const resetHome = () => {
    setSelected(null)
    setOccData(null)
    setQuery('')
    setShowDropdown(false)
    setExpandedProvinces(new Set())
    setExpandedRegions(new Set())
    setFilters(new Set())
    setMapProvince(null)
    window.scrollTo({ top: 0 })
  }

  const goHome = () => {
    // If a result is recorded in history, let the browser go back (triggers
    // popstate -> resetHome). Otherwise reset state directly so we never
    // navigate outside the app.
    if (window.history.state && window.history.state.code) {
      window.history.back()
    } else {
      resetHome()
    }
  }

  /* Keep the latest loadOccupation/resetHome accessible to the popstate listener */
  const handlersRef = React.useRef({ loadOccupation, resetHome })
  handlersRef.current = { loadOccupation, resetHome }
  React.useEffect(() => {
    const onPopState = (e) => {
      const st = e.state
      if (st && st.code) {
        const occ = (handlersRef.current.occupations || []).find(o => o.code === st.code)
        if (occ) handlersRef.current.loadOccupation(occ, { updateHistory: false })
        else handlersRef.current.resetHome()
      } else {
        handlersRef.current.resetHome()
      }
    }
    handlersRef.current.occupations = occupations
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [occupations])

  /* Swipe-to-go-back (mobile): leftward swipe on the result page returns home */
  const touchStartRef = React.useRef(null)
  const handleTouchStart = (e) => {
    if (!selected && tab === 'home') return
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY }
  }
  const handleTouchEnd = (e) => {
    const start = touchStartRef.current
    touchStartRef.current = null
    if (!start) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    // Leftward swipe, clearly horizontal, long enough to be intentional
    if (dx < -70 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (selected) {
        goHome()
      } else if (tab === 'trends') {
        setTab('home')
      }
    }
  }

  const openJobs = (provCode) => {
    if (!occData) return
    const base = lang === 'en'
      ? 'https://www.jobbank.gc.ca/jobsearch/jobsearch'
      : 'https://www.guichetemplois.gc.ca/jobsearch/rechercheemplois'
    const title = occData.title[lang] || occData.title.en || ''
    const noc = occData.code.replace('NOC_', '')
    const url = `${base}?term=${encodeURIComponent(title)}&fn21=${noc}&fprov=${provCode}`
    const isDesktop = window.matchMedia('(min-width: 820px)').matches
    if (isDesktop) {
      // Desktop: centered half-screen popup window
      const w = Math.min(520, Math.round(window.innerWidth * 0.55))
      const h = Math.min(780, Math.round(window.innerHeight * 0.85))
      const left = Math.max(20, Math.round((window.innerWidth - w) / 2))
      const top = Math.max(20, Math.round((window.innerHeight - h) / 2))
      const popup = window.open(url, 'jobbank_jobs',
        `popup=yes,width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`)
      if (!popup) { // popup blocked -> fall back to standard link
        const a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.rel = 'noopener'
        document.body.appendChild(a)
        a.click()
        a.remove()
      }
    } else {
      // Mobile / small screens: standard link (more reliable than window.open in iOS PWA)
      const a = document.createElement('a')
      a.href = url
      a.target = '_blank'
      a.rel = 'noopener'
      document.body.appendChild(a)
      a.click()
      a.remove()
    }
  }

  const addToCompare = async (occ) => {
    if (compareList.length >= 2) return
    if (compareList.some(c => c.code === occ.code)) return
    const next = [...compareList, occ]
    setCompareList(next)
    if (!compareData[occ.code]) {
      fetch(`/data/occ/${occ.code}.json`)
        .then(r => r.json())
        .then(data => setCompareData(prev => ({ ...prev, [occ.code]: data })))
        .catch(() => {})
    }
  }

  const removeFromCompare = (code) => {
    setCompareList(prev => prev.filter(c => c.code !== code))
  }

  const clearCompare = () => {
    setCompareList([])
    setCompareData({})
  }

  /* Group regions by province */
  const byProvince = React.useMemo(() => {
    if (!occData) return {}
    const langRegions = occData.regions[lang] || occData.regions.en || []
    const groups = {}
    for (const r of langRegions) {
      if (!groups[r.province]) groups[r.province] = []
      groups[r.province].push(r)
    }
    return groups
  }, [occData, lang])

  const provinceRatings = React.useMemo(() => {
    const ratings = {}
    for (const [provCode, regions] of Object.entries(byProvince)) {
      ratings[provCode] = regions[0]?.outlook
    }
    return ratings
  }, [byProvince])

  /* Wage helpers */
  const provinceWages = React.useMemo(() => {
    if (!occData) return {}
    const map = {}
    for (const w of occData.wages || []) {
      if (w.province && !map[w.province]) map[w.province] = w
    }
    return map
  }, [occData])

  const nationalWage = React.useMemo(() => {
    if (!occData) return null
    return (occData.wages || []).find(w => w.province === 'CA') || null
  }, [occData])

  const bestPaidProvince = React.useMemo(() => {
    let best = null
    for (const [prov, w] of Object.entries(provinceWages)) {
      if (prov === 'CA' || !w.median) continue
      if (!best || w.median > best.w.median) best = { prov, w }
    }
    return best
  }, [provinceWages])

  const toggleProvince = (provCode) => {
    const next = new Set(expandedProvinces)
    if (next.has(provCode)) next.delete(provCode)
    else next.add(provCode)
    setExpandedProvinces(next)
  }

  const toggleRegion = (key) => {
    const next = new Set(expandedRegions)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setExpandedRegions(next)
  }

  const expandAll = () => {
    setExpandedProvinces(new Set(Object.keys(byProvince)))
    const regs = new Set()
    for (const [provCode, regions] of Object.entries(byProvince)) {
      regions.forEach((r, i) => regs.add(`${provCode}-${i}`))
    }
    setExpandedRegions(regs)
  }

  const collapseAll = () => {
    setExpandedProvinces(new Set())
    setExpandedRegions(new Set())
  }

  const toggleFilter = (label) => {
    const next = new Set(filters)
    if (next.has(label)) next.delete(label)
    else next.add(label)
    setFilters(next)
  }

  const handleMapClick = (provCode) => {
    setMapProvince(prev => prev === provCode ? null : provCode)
  }

  const filteredProvinces = React.useMemo(() => {
    let entries = Object.entries(byProvince)
    if (filters.size > 0) {
      entries = entries.filter(([provCode, regions]) => {
        const cfg = OUTLOOK_CONFIG[regions[0]?.outlook] || OUTLOOK_CONFIG['undetermined']
        return filters.has(cfg.key)
      })
    }
    if (mapProvince) {
      entries = entries.filter(([provCode]) => provCode === mapProvince)
    }
    return entries
  }, [byProvince, filters, mapProvince])

  const quickTerms = lang === 'en' ? ['Welder', 'Nurse', 'Software', 'Truck', 'Electrician'] : ['soudeur', 'infirmier', 'logiciel', 'camion', 'électricien']

  /* ---- Trend section derived data ---- */
  const INDUSTRY_COLORS = ['#1d4ed8', '#0d9488', '#d97706', '#7c3aed', '#dc2626', '#059669', '#c026d3', '#ea580c', '#2563eb', '#0891b2']

  const trendGeoName = trendProvince === 'CA'
    ? t.allCanada
    : (PROVINCE_NAMES[lang][trendProvince] || trendProvince)

  const unempSeries = React.useMemo(() => {
    const s = trends.unemp?.series?.[trendProvince]?.['en']
    if (!s || !s.values || !s.values.length) return null
    return { series: [{ name: trendGeoName, color: '#1d4ed8', values: s.values }], dates: s.dates }
  }, [trends.unemp, trendProvince, trendGeoName])

  const topIndustries = React.useMemo(() => {
    const geo = trends.industry?.series?.[trendProvince]
    if (!geo) return null
    const names = trends.industry?.industryNames?.[lang] || {}
    const growth = (values) => {
      if (!values || values.length < 13) return null
      const last = values[values.length - 1]
      const prev = values[values.length - 13]
      if (last == null || prev == null || prev === 0) return null
      return (last - prev) / prev * 100
    }
    const list = Object.entries(geo)
      .map(([code, d]) => ({
        code,
        name: names[code] || code,
        shortName: (names[code] || code).split('[')[0].trim(),
        ...d,
        growth12: growth(d.values),
      }))
      .filter(d => d.latest != null)
      .sort((a, b) => b.latest - a.latest)
      .slice(0, 5)
    if (!list.length) return null
    const dates = list[0].dates
    return {
      dates,
      series: list.map((d, i) => ({
        name: d.shortName,
        color: INDUSTRY_COLORS[i % INDUSTRY_COLORS.length],
        values: d.values,
      })),
      rank: list,
    }
  }, [trends.industry, trendProvince, lang])

  const totalJobsFor = (code) => {
    const c = jobCounts?.counts?.[code]
    if (!c) return null
    if (typeof c.CA === 'number') return c.CA
    const vals = Object.values(c)
    const sum = vals.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)
    return sum || null
  }

  const topOcc = React.useMemo(() => {
    const list = trends.occ?.[lang]?.[trendProvince]
    if (!list || !list.length) return null
    return list.slice(0, 5)
  }, [trends.occ, trendProvince, lang])

  const formatPersons = (v) => {
    if (v == null) return '–'
    if (v >= 1000000) return (v / 1000000).toFixed(1) + 'M'
    if (v >= 1000) return (v / 1000).toFixed(0) + 'k'
    return String(v)
  }

  const selectedTitle = selected?.title?.[lang] || selected?.title?.en || selected?.title?.fr || ''

  return (
    <div className="app" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <header className="header">
        <div className="lang-switch">
          <button className={lang === 'en' ? 'lang-btn active' : 'lang-btn'} onClick={() => setLang('en')}>EN</button>
          <span className="lang-divider">|</span>
          <button className={lang === 'fr' ? 'lang-btn active' : 'lang-btn'} onClick={() => setLang('fr')}>FR</button>
        </div>
        <h1>Canada Job Outlooks</h1>
        <p className="subtitle">{t.tagline}</p>
        <div className="header-links">
          <button className="link-btn" onClick={() => setModal('methodology')}>{t.methodology}</button>
          <span>|</span>
          <button className="link-btn" onClick={() => setModal('faq')}>{t.faqs}</button>
        </div>
      </header>

      <main className="main">
        {/* Back to home (only when a result is shown) */}
        {selected && (
          <button className="back-home-btn" onClick={goHome}>← {t.backHome}</button>
        )}

        {/* Search */}
        <div className="search-box">
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={e => { setQuery(e.target.value); setShowDropdown(true) }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && filtered.length > 0 && (
            <ul className="dropdown">
              {filtered.map(o => (
                <li key={o.code} onClick={() => loadOccupation(o)}>
                  {o.title[lang] || o.title.en} <span className="noc">{o.code.replace('NOC_', '')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick searches -> In-demand occupation cards */}
        {!selected && tab === 'home' && (
          <section className="hot-section">
            <div className="hot-head">
              <h2 className="hot-title">{t.hotTitle}</h2>
              <p className="hot-hint">{t.hotHint}</p>
            </div>
            <div className="hot-cards">
              {QUICK_NOCS.map(code => {
                const occ = occupations.find(o => o.code === `NOC_${code}`)
                if (!occ) return null
                const hot = hotOcc[code]
                const cfg = OUTLOOK_CONFIG[hot?.rating] || OUTLOOK_CONFIG['undetermined']
                const jobs = totalJobsFor(code)
                return (
                  <button key={code} className="hot-card" onClick={() => loadOccupation(occ)}>
                    <span className="hot-card-title">{(occ.title[lang] || occ.title.en).split(',')[0]}</span>
                    <span className="hot-card-meta">
                      {hot?.rating && (
                        <span className="hot-stars" style={{ color: cfg.color, background: cfg.bg }}
                          title={hot.provGood ? `${hot.provGood}/${hot.provTotal} ${lang === 'en' ? 'provinces' : 'provinces'}` : ''}>
                          <Stars count={cfg.stars} /> {OUTLOOK_LABELS[lang][cfg.key]}
                        </span>
                      )}
                      {jobs != null && (
                        <span className="hot-jobs">💼 {jobs.toLocaleString()} {t.todayJobs}</span>
                      )}
                      {hot?.wage?.median && (
                        <span className="hot-wage">
                          {formatWage(hot.wage.median, hot.wage.annual)}{hot.wage.annual ? '/yr' : '/hr'}
                        </span>
                      )}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* Labour Market Trends (dedicated bottom tab) */}
        {!selected && tab === 'trends' && (
          <section className="trends-section">
            <div className="trends-head">
              <h2 className="trends-title">{t.trends}</h2>
              <p className="trends-hint">{t.trendsHint}</p>
            </div>

            {/* Region picker */}
            <div className="trend-chips">
              {['CA', ...Object.keys(PROVINCE_NAMES.en)].map(code => {
                const b = badgeFor(code)
                return (
                  <button
                    key={code}
                    className={`trend-chip ${trendProvince === code ? 'active' : ''}`}
                    onClick={() => setTrendProvince(code)}
                  >
                    <span className="prov-badge" style={{ background: `linear-gradient(135deg, ${b.from}, ${b.to})` }}>
                      {b.sym}
                    </span>
                    <span className="prov-name">
                      {code === 'CA' ? t.allCanada : (PROVINCE_NAMES[lang][code] || code)}
                    </span>
                  </button>
                )
              })}
            </div>

            {!trends.unemp && <p className="loading">{t.loading}</p>}

            {trends.unemp && (
              <>
                {!unempSeries ? (
                  <p className="trend-no-data">{t.noTrendData}</p>
                ) : (
                  <div className="trend-block">
                    <h3 className="trend-block-title">
                      <span className="trend-dot" style={{ background: '#1d4ed8' }}></span>
                      {t.unemploymentRate} — {trendGeoName}
                    </h3>
                    <TrendChart
                      series={unempSeries.series}
                      dates={unempSeries.dates}
                      formatValue={v => `${v.toFixed(1)}%`}
                      yLabel="%"
                      emptyText={t.noTrendData}
                    />
                  </div>
                )}

                {topIndustries && (
                  <div className="trend-block">
                    <h3 className="trend-block-title">{t.trendIndustries} — {trendGeoName}</h3>
                    <TrendChart
                      series={topIndustries.series}
                      dates={topIndustries.dates}
                      formatValue={formatPersons}
                      yLabel={t.persons}
                      emptyText={t.noTrendData}
                    />
                    {/* Digital ranking cards: size + 12-month growth */}
                    <div className="ind-rank">
                      {topIndustries.rank.map((d, i) => {
                        const g = d.growth12
                        const up = g != null && g >= 0
                        return (
                          <div key={d.code} className="ind-rank-row">
                            <span className="ind-rank-rank">{i + 1}</span>
                            <span className="ind-rank-name">{d.shortName}</span>
                            <span className="ind-rank-jobs" title={t.employment}>
                              {formatPersons(d.latest)}
                            </span>
                            {g != null ? (
                              <span className={`ind-rank-growth ${up ? 'up' : 'down'}`} title={t.yoyChange}>
                                {up ? '▲' : '▼'} {Math.abs(g).toFixed(1)}%
                              </span>
                            ) : (
                              <span className="ind-rank-growth na">–</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <p className="ind-rank-note">{t.topGainers}</p>
                  </div>
                )}

                {topOcc && (
                  <div className="trend-block">
                    <h3 className="trend-block-title">
                      {t.topUnemploymentOcc} — {trendGeoName} <span className="trend-year">({trends.occ?.year})</span>
                    </h3>
                    <ul className="trend-occ-list">
                      {topOcc.map((o, i) => (
                        <li key={i} className="trend-occ-item">
                          <span className="trend-occ-rank">{i + 1}</span>
                          <span className="trend-occ-name">{o.name.split('[')[0].trim()}</span>
                          <span className="trend-occ-rate" style={{ width: `${Math.min(90, 12 + o.rate * 6)}%` }}>
                            {o.rate}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="trend-source">{t.trendSource}</p>
              </>
            )}
          </section>
        )}

        {/* Compare bar */}
        {compareList.length > 0 && (
          <div className="compare-bar">
            <span className="compare-label">{t.comparing} ({compareList.length}/2):</span>
            {compareList.map(c => (
              <span key={c.code} className="compare-chip">
                {c.title[lang] || c.title.en}
                <button className="compare-remove" onClick={() => removeFromCompare(c.code)}>×</button>
              </span>
            ))}
            {compareList.length === 2 && (
              <button className="compare-go" onClick={() => setModal('compare')}>{t.compare}</button>
            )}
            <button className="compare-clear" onClick={clearCompare}>{t.clearCompare}</button>
          </div>
        )}

        {/* Result */}
        {selected && !occData && !loading && <p>{t.noData}</p>}
        {selected && loading && <p className="loading">{t.loading}</p>}

        {selected && occData && !loading && (
          <div className="result">
            <div className="result-header">
              <div>
                <h2>{selectedTitle}</h2>
                <span className="noc-badge">NOC {selected.code.replace('NOC_', '')}</span>
                {!compareList.some(c => c.code === selected.code) && compareList.length < 2 && (
                  <button className="add-compare-btn" onClick={() => addToCompare(selected)}>+ {t.addToCompare}</button>
                )}
              </div>
              <span className="date">{t.updated} {occData.releaseDate}</span>
            </div>

            {/* Summary cards */}
            {(nationalWage || bestPaidProvince) && (
              <div className="summary-cards">
                {nationalWage?.median && (
                  <div className="summary-card">
                    <span className="summary-label">{t.nationalMedian}</span>
                    <span className="summary-value">
                      {formatWage(nationalWage.median, nationalWage.annual)}
                      <span className="summary-unit">{nationalWage.annual ? '/yr' : '/hr'}</span>
                    </span>
                  </div>
                )}
                {bestPaidProvince && (
                  <div className="summary-card">
                    <span className="summary-label">{t.bestPay}</span>
                    <span className="summary-value">
                      {PROVINCE_NAMES[lang][bestPaidProvince.prov] || bestPaidProvince.prov}
                      <span className="summary-sub">{formatWage(bestPaidProvince.w.median, bestPaidProvince.w.annual)}</span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Postings over time (daily Job Bank snapshot) */}
            {jobHistory?.occupations?.[selected.code.replace('NOC_', '')] && (() => {
              const noc = selected.code.replace('NOC_', '')
              const h = jobHistory.occupations[noc]
              const provs = Object.keys(h.series)
              // default province = CA if present, else the one with most data points
              const byPoints = provs.slice().sort((a, b) => h.series[b].dates.length - h.series[a].dates.length)
              const defaultProv = provs.includes('CA') ? 'CA' : byPoints[0]
              const activeProv = jobsProv || defaultProv
              const s = h.series[activeProv]
              const dates = s.dates
              const series = [{
                name: activeProv === 'CA' ? t.allCanada : (PROVINCE_NAMES[lang][activeProv] || activeProv),
                color: '#0d9488',
                values: s.counts,
              }]
              return (
                <div className="jobs-trend-block">
                  <h3 className="section-title">{t.postingsTrend}</h3>
                  <p className="jobs-trend-hint">{t.postingsTrendHint}</p>
                  <div className="jobs-trend-chips">
                    {byPoints.map(p => {
                      const b = badgeFor(p)
                      return (
                        <button
                          key={p}
                          className={`trend-chip ${activeProv === p ? 'active' : ''}`}
                          onClick={() => setJobsProv(p)}
                        >
                          <span className="prov-badge" style={{ background: `linear-gradient(135deg, ${b.from}, ${b.to})` }}>
                            {b.sym}
                          </span>
                          <span className="prov-name">
                            {p === 'CA' ? t.allCanada : (PROVINCE_NAMES[lang][p] || p)}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  {dates.length < 2 ? (
                    <p className="jobs-trend-building">
                      ⏳ {t.buildingHistory} <em>({dates.length} {t.daysOfData})</em>
                    </p>
                  ) : (
                    <TrendChart
                      series={series}
                      dates={dates}
                      formatValue={v => String(v)}
                      yLabel={t.todayJobs}
                      emptyText={t.noData}
                    />
                  )}
                </div>
              )
            })()}

            {/* Map */}
            <div className="map-section">
              <h3 className="section-title">{t.outlookByProvince}</h3>
              <CanadaMap
                provinceRatings={provinceRatings}
                provinceWages={provinceWages}
                onProvinceClick={handleMapClick}
                selectedProvince={mapProvince}
                lang={lang}
              />
              {mapProvince && (
                <button className="clear-map-filter" onClick={() => setMapProvince(null)}>
                  {t.clearProvinceFilter}
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="filters">
              <span className="filter-label">{t.filterByRating}:</span>
              {Object.values(OUTLOOK_CONFIG).map(cfg => (
                <label key={cfg.key} className={`filter-chip ${filters.has(cfg.key) ? 'active' : ''}`}
                  style={{ background: filters.has(cfg.key) ? cfg.bg : '#f3f4f6' }}>
                  <input type="checkbox" checked={filters.has(cfg.key)} onChange={() => toggleFilter(cfg.key)} style={{ display: 'none' }} />
                  <Stars count={cfg.stars} /> {OUTLOOK_LABELS[lang][cfg.key]}
                </label>
              ))}
            </div>

            {/* Bulk actions */}
            <div className="bulk-actions">
              <button onClick={expandAll}>{t.expandAll}</button>
              <button onClick={collapseAll}>{t.collapseAll}</button>
              <span className="result-count">{filteredProvinces.length} {t.unitsLabel}</span>
            </div>

            {/* Province cards */}
            <div className="provinces">
              {filteredProvinces.length === 0 && <p className="no-results">{t.noResults}</p>}
              {filteredProvinces.map(([provCode, regions]) => {
                const cfg = OUTLOOK_CONFIG[regions[0]?.outlook] || OUTLOOK_CONFIG['undetermined']
                const isExpanded = expandedProvinces.has(provCode)
                const wage = provinceWages[provCode]
                return (
                  <div key={provCode} className="province-card" style={{ borderLeftColor: cfg.color }}>
                    <div className="province-header" onClick={() => toggleProvince(provCode)}>
                      <div>
                        <h3>{PROVINCE_NAMES[lang][provCode] || provCode}</h3>
                        {wage?.median && (
                          <span className="wage-info">
                            {t.median}: {formatWage(wage.median, wage.annual)}{wage.annual ? '/yr' : '/hr'}
                            {wage.low && wage.high && (
                              <span className="wage-range"> ({formatWage(wage.low, wage.annual)} – {formatWage(wage.high, wage.annual)})</span>
                            )}
                          </span>
                        )}
                        {jobCounts?.counts?.[selected.code.replace('NOC_', '')]?.[provCode] != null && (
                          <span className="jobs-today-badge">
                            💼 {jobCounts.counts[selected.code.replace('NOC_', '')][provCode]} {t.todayJobs}
                          </span>
                        )}
                      </div>
                      <div className="province-rating" style={{ color: cfg.color, background: cfg.bg }}>
                        <Stars count={cfg.stars} />
                        <span>{OUTLOOK_LABELS[lang][cfg.key]}</span>
                        <span className="expand-icon">{isExpanded ? '−' : '+'}</span>
                      </div>
                    </div>

                    {isExpanded && regions[0]?.trends && (
                      <div className="trend-desc" dangerouslySetInnerHTML={{ __html: regions[0].trends }} />
                    )}

                    <button
                      className="jobs-btn"
                      title={t.jobsHint}
                      onClick={(e) => { e.stopPropagation(); openJobs(provCode) }}
                    >
                      💼 {t.viewJobs}
                    </button>

                    {isExpanded && regions.length > 1 && (
                      <ul className="regions">
                        {regions.slice(1).map((r, i) => {
                          const rc = OUTLOOK_CONFIG[r.outlook] || OUTLOOK_CONFIG['undetermined']
                          const regKey = `${provCode}-${i}`
                          const regExpanded = expandedRegions.has(regKey)
                          return (
                            <li key={i} className="region-item">
                              <div className="region-row" onClick={() => toggleRegion(regKey)}>
                                <span className="region-name">{r.regionName}</span>
                                <span className="region-rating" style={{ color: rc.color }}>
                                  <Stars count={rc.stars} /> {OUTLOOK_LABELS[lang][rc.key]}
                                  {r.trends && <span className="expand-icon">{regExpanded ? '−' : '+'}</span>}
                                </span>
                              </div>
                              {regExpanded && r.trends && (
                                <div className="trend-desc small" dangerouslySetInnerHTML={{ __html: r.trends }} />
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      {/* Bottom tab bar (hidden while an occupation detail is open) */}
      {!selected && (
        <nav className="tabbar">
          <button
            className={`tabbar-btn ${tab === 'home' ? 'active' : ''}`}
            onClick={() => setTab('home')}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h5v-6h4v6h5V9.5" />
            </svg>
            <span>{t.tabHome}</span>
          </button>
          <button
            className={`tabbar-btn ${tab === 'trends' ? 'active' : ''}`}
            onClick={() => setTab('trends')}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M22 20H2" />
            </svg>
            <span>{t.tabTrends}</span>
          </button>
        </nav>
      )}

      <footer className="footer">
        <p>{t.dataSource}</p>
      </footer>

      {/* Modals */}
      {modal === 'methodology' && (
        <Modal title={t.methodology} onClose={() => setModal(null)}>
          {METHODOLOGY[lang]}
        </Modal>
      )}
      {modal === 'faq' && (
        <Modal title={t.faqs} onClose={() => setModal(null)}>
          <div>
            {FAQS[lang].map((f, i) => (
              <div key={i} style={{ marginBottom: '16px' }}>
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>{i + 1}. {f.q}</p>
                <p style={{ color: '#4b5563' }}>{f.a}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}
      {modal === 'compare' && compareList.length === 2 && (
        <Modal title={`${t.compare}: ${compareList[0].title[lang]} ${t.vs} ${compareList[1].title[lang]}`} onClose={() => setModal(null)}>
          <CompareTable
            occA={compareList[0]}
            occB={compareList[1]}
            dataA={compareData[compareList[0].code]}
            dataB={compareData[compareList[1].code]}
            lang={lang}
          />
        </Modal>
      )}
    </div>
  )
}

function CompareTable({ occA, occB, dataA, dataB, lang }) {
  const t = I18N[lang]
  const provCodes = Object.keys(PROVINCE_NAMES[lang])
  const ratingOf = (data, prov) => {
    if (!data) return null
    const regions = data.regions[lang] || data.regions.en || []
    const r = regions.find(x => x.province === prov)
    return r ? r.outlook : null
  }
  const wageOf = (data, prov) => {
    if (!data) return null
    return (data.wages || []).find(w => w.province === prov) || null
  }
  const wageText = (w) => {
    if (!w || !w.median) return '–'
    return `${formatWage(w.median, w.annual)}${w.annual ? '/yr' : '/hr'}`
  }
  const cfgOf = (outlook) => OUTLOOK_CONFIG[outlook] || OUTLOOK_CONFIG['undetermined']

  return (
    <div className="compare-table-wrap">
      <table className="compare-table">
        <thead>
          <tr>
            <th>{t.province}</th>
            <th>{occA.title[lang] || occA.title.en}</th>
            <th>{occB.title[lang] || occB.title.en}</th>
          </tr>
        </thead>
        <tbody>
          {provCodes.map(p => {
            const ra = ratingOf(dataA, p)
            const rb = ratingOf(dataB, p)
            const wa = wageOf(dataA, p)
            const wb = wageOf(dataB, p)
            return (
              <tr key={p}>
                <td className="cmp-prov">{PROVINCE_NAMES[lang][p]}</td>
                <td>
                  <span style={{ color: cfgOf(ra).color }}><Stars count={cfgOf(ra).stars} /> {OUTLOOK_LABELS[lang][cfgOf(ra).key]}</span>
                  <div className="cmp-wage">{wageText(wa)}</div>
                </td>
                <td>
                  <span style={{ color: cfgOf(rb).color }}><Stars count={cfgOf(rb).stars} /> {OUTLOOK_LABELS[lang][cfgOf(rb).key]}</span>
                  <div className="cmp-wage">{wageText(wb)}</div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
