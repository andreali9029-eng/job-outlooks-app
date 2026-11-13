/**
 * @file OccBoard.jsx
 * @description Layer-1 occupation board of the home-first navigation.
 *   The home deck's centred NOC card opens it for that sector; a click on the
 *   home map opens it for that province. One panel, two scopes — no detour
 *   through the Explore tab, no extra tap to reach the list.
 *
 *   Data: public/data/match-index.json (lazy, shared with the match calculator).
 *   In that index `outlook` is a 0–4 ordinal per province:
 *   4 very good · 3 good · 2 moderate · 1 limited · 0 very limited · null n/a.
 *   `wage` mixes annual salaries and hourly rates with no flag, so the unit is
 *   inferred from the magnitude (>= 1000 → annual) and always printed.
 * @author Xiaopeng Li
 * @copyright © 2026 Xiaopeng Li
 * @version 1.0.0
 */
import React from 'react'

const RATING_LABELS = {
  en: ['Very Limited', 'Limited', 'Moderate', 'Good', 'Very Good'],
  fr: ['Très limité', 'Limité', 'Modéré', 'Bon', 'Très bon'],
}

const T = {
  en: {
    close: 'Back to home',
    occupations: 'occupations',
    sortedNoc: '3-year outlook · ranked by provinces rated Good or better, then live postings',
    sortedProv: '3-year outlook in {p} · then live postings, then median wage',
    goodProvinces: 'provinces good+',
    noData: '—',
    jobsToday: 'today',
    showAll: 'Show all {n}',
    showTop: 'Show top 12 only',
    loading: 'Loading the occupation index…',
    empty: 'No occupations in this group.',
    median: 'median',
  },
  fr: {
    close: "Retour à l'accueil",
    occupations: 'professions',
    sortedNoc: 'Perspectives 3 ans · classées selon le nombre de provinces cotées Bon ou mieux, puis les offres',
    sortedProv: 'Perspectives 3 ans en {p} · puis les offres, puis le salaire médian',
    goodProvinces: 'provinces bon+',
    noData: '—',
    jobsToday: "aujourd'hui",
    showAll: 'Afficher les {n}',
    showTop: 'Afficher les 12 premières',
    loading: "Chargement de l'index des professions…",
    empty: 'Aucune profession dans ce groupe.',
    median: 'médiane',
  },
}

const TOP_N = 12

/** Star row: filled = rating, dim = the rest of the 5. */
function StarRow({ stars, color }) {
  return (
    <span className="ob-stars" aria-label={`${stars}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < stars ? 'on' : 'off'} style={i < stars ? { color } : null}>★</span>
      ))}
    </span>
  )
}

/** Wage with an explicit unit — annual vs hourly inferred from the magnitude. */
function fmtWage(v) {
  if (!v) return null
  return v >= 1000
    ? `$${Math.round(v).toLocaleString()}/yr`
    : `$${v.toFixed(2)}/hr`
}

/** Numeric outlook → 0–5 stars (null = undetermined = 0). */
const starsOf = (v) => (typeof v === 'number' ? v + 1 : 0)

/** Rating colour for a 0–4 ordinal. */
const colorOf = (v) => (typeof v !== 'number' ? '#94A3B8' : ['#EF4444', '#F97316', '#F5B34C', '#7BE0A8', '#3ECF8E'][v])

export default function OccBoard({ scope, lang, provinceNames, groups, getIndex, onClose, onPick }) {
  const t = T[lang === 'fr' ? 'fr' : 'en']
  const [index, setIndex] = React.useState(null)
  const [showAll, setShowAll] = React.useState(false)
  const listRef = React.useRef(null)

  /* Index is shared with the match calculator: one 222 KB fetch, cached there. */
  React.useEffect(() => {
    let alive = true
    Promise.resolve(getIndex()).then(idx => { if (alive && idx) setIndex(idx) })
    return () => { alive = false }
  }, [getIndex])

  /* Lock the page behind the sheet so touch scrolling stays inside it. */
  React.useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  /* Esc closes the board. */
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const isNoc = scope && scope.kind === 'noc'
  const provKey = scope && scope.kind === 'prov' ? scope.code : null
  /* The index keys Yukon `YK` under outlook but `YT` under jobs/wage. */
  const idxProv = provKey === 'YT' ? 'YK' : provKey
  const dataProv = provKey

  const rows = React.useMemo(() => {
    if (!index) return []
    const all = index.occs
    if (isNoc) {
      return all
        .filter(o => o.group === scope.id)
        .map(o => {
          const vals = Object.values(o.outlook || {}).filter(v => typeof v === 'number')
          const good = vals.filter(v => v >= 3).length
          const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null
          return {
            occ: o,
            stars: avg == null ? 0 : Math.max(1, Math.round(avg + 1)),
            color: avg == null ? '#94A3B8' : colorOf(Math.round(avg)),
            label: `${good}/${vals.length || 13}`,
            sub: [
              o.noc5,
              o.jobs && o.jobs.CA ? `${o.jobs.CA.toLocaleString()} ${t.jobsToday}` : null,
              fmtWage(o.wage && o.wage.CA) || t.noData,
            ].filter(Boolean).join(' · '),
            score: good * 1e6 + ((o.jobs && o.jobs.CA) || 0),
          }
        })
        .sort((a, b) => b.score - a.score)
    }
    return all
      .map(o => {
        const v = o.outlook ? o.outlook[idxProv] : null
        return {
          occ: o,
          stars: starsOf(v),
          color: colorOf(v),
          label: typeof v === 'number' ? RATING_LABELS[lang === 'fr' ? 'fr' : 'en'][v] : t.noData,
          sub: [
            o.noc5,
            o.jobs && o.jobs[dataProv] ? `${o.jobs[dataProv].toLocaleString()} ${t.jobsToday}` : null,
            fmtWage(o.wage && o.wage[dataProv]) || t.noData,
          ].filter(Boolean).join(' · '),
          score: (typeof v === 'number' ? v : -1) * 1e9 + ((o.jobs && o.jobs[dataProv]) || 0),
        }
      })
      .sort((a, b) => b.score - a.score)
  }, [index, isNoc, idxProv, scope, t, lang])

  const visible = showAll ? rows : rows.slice(0, TOP_N)

  const group = isNoc ? (groups || []).find(g => g.id === scope.id) : null
  const eyebrow = isNoc ? `NOC ${scope.id}` : `${provKey} · ${lang === 'fr' ? 'Province' : 'Province'}`
  const title = isNoc
    ? (group ? (lang === 'fr' ? group.fr : group.en) : eyebrow)
    : (provinceNames && provinceNames[provKey]) || provKey
  const subtitle = index
    ? (isNoc
      ? `${rows.length} ${t.occupations} · ${t.sortedNoc}`
      : `${rows.length} ${t.occupations} · ${t.sortedProv.replace('{p}', (provinceNames && provinceNames[provKey]) || provKey)}`)
    : t.loading

  return (
    <div className="occ-board" role="dialog" aria-modal="true" aria-label={title}>
      <div className="occ-board-head">
        <button className="ob-back" onClick={onClose} aria-label={t.close}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 5 8 12l7 7" />
          </svg>
        </button>
        <div className="ob-head-text">
          <span className="ob-eyebrow">{eyebrow}</span>
          <h2 className="ob-title">{title}</h2>
          <p className="ob-sub2">{subtitle}</p>
        </div>
      </div>

      <div className="occ-board-body" ref={listRef}>
        {index && rows.length === 0 && <p className="ob-empty">{t.empty}</p>}
        {visible.map((r, i) => (
          <button key={r.occ.code} className="ob-row" onClick={() => onPick(r.occ)}>
            <span className="ob-rank">{String(i + 1).padStart(2, '0')}</span>
            <span className="ob-main">
              <span className="ob-name">{r.occ.title[lang === 'fr' ? 'fr' : 'en'] || r.occ.title.en}</span>
              <span className="ob-sub">{r.sub}</span>
            </span>
            <span className="ob-meta">
              <StarRow stars={r.stars} color={r.color} />
              <span className="ob-rating">{r.label}</span>
            </span>
          </button>
        ))}

        {rows.length > TOP_N && (
          <button className="ob-more" onClick={() => setShowAll(v => !v)}>
            {showAll ? t.showTop : t.showAll.replace('{n}', rows.length)}
          </button>
        )}
      </div>
    </div>
  )
}
