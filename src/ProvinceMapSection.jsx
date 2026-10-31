/**
 * @file ProvinceMapSection.jsx
 * @description Relief map + real-photo backdrop + province detail card (mockup D).
 *   - 3D-tilted relief map (perspective rotateX, two lit "plate" steps, seams).
 *   - Real-photo backdrop, fully visible — no scrim / no ocean layer.
 *   - Province click: card-flip the photo, float the province, reveal the card.
 *   - NOC change: recolours every province for the active industry, then focuses
 *     that industry's highest-rated province (big-city tie-break priority).
 * @author Xiaopeng Li
 * @copyright © 2026 Xiaopeng Li
 * @version 1.0.0
 */
import React from 'react'
import { CANADA_PATHS, CANADA_VIEWBOX } from './canadaPaths'
import {
  PROV_RATINGS, RATE_MAP, RATING_ORDER, PROV_PHOTOS, PROV_DETAILS,
  PROV_PRIORITY, ratingOf, provStats, topProvince, shade, img
} from './homeData'

const PIN_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>'
const STAR_PATH = '<path d="M12 2l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 17l-5.9 3.2 1.3-6.6L2.5 9l6.6-.8z"/>'

function StarRow({ n, size = 13, color }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= n ? color : 'rgba(255,255,255,.18)'} dangerouslySetInnerHTML={{ __html: STAR_PATH }} />
    )
  }
  return <>{stars}</>
}

export default function ProvinceMapSection({ lang, activeIndKey }) {
  const fr = lang === 'fr'
  const [selected, setSelected] = React.useState(null)   /* null → default CA backdrop + Ontario card */
  const photoRef = React.useRef(null)
  const cardRef = React.useRef(null)
  const svgRef = React.useRef(null)
  const prevKey = React.useRef(activeIndKey)

  const ratings = PROV_RATINGS[activeIndKey] || PROV_RATINGS.management
  const cardCode = selected || 'ON'
  const prov = PROV_DETAILS[cardCode] || PROV_DETAILS.ON
  const r = ratingOf(ratings[cardCode] || '#64748B')
  const st = provStats(activeIndKey, cardCode)

  /* Photo flip: swing the backdrop away, swap the photo, swing the new face in. */
  const flipPhoto = (code, animate) => {
    const el = photoRef.current
    if (!el) return
    const next = 'map-photo ph-' + (PROV_PHOTOS[code] ? code : 'CA')
    if (animate === false) {
      el.className = next
      el.style.transition = ''
      el.style.transform = ''
      return
    }
    el.style.transition = 'transform .34s cubic-bezier(.45,0,.2,1)'
    el.style.transform = 'perspective(1100px) rotateY(84deg)'
    setTimeout(() => {
      el.className = next
      el.style.transform = 'perspective(1100px) rotateY(0deg)'
    }, 300)
  }

  /* Left→right staggered reveal of the new card content. */
  const revealCard = () => {
    const pc = cardRef.current
    if (!pc) return
    pc.classList.remove('reveal'); void pc.offsetWidth; pc.classList.add('reveal')
  }

  const selectProv = React.useCallback((code, animate = true) => {
    setSelected(code)
    flipPhoto(code, animate)
    revealCard()
    if (svgRef.current) {
      svgRef.current.querySelectorAll('.prov').forEach(p => p.classList.toggle('sel', p.dataset.code === code))
    }
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [])

  /* NOC changed: recolour (render) then focus this NOC's highest-rated province. */
  React.useEffect(() => {
    if (prevKey.current === activeIndKey) return
    prevKey.current = activeIndKey
    const top = topProvince(ratings)
    if (top) selectProv(top, true)
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [activeIndKey])

  /* Initial state: NOC 0 — maple-leaf backdrop, Ontario card, no province lit. */
  React.useEffect(() => {
    selectProv(null, false)
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [])

  const ind = activeIndKey || 'management'
  const indLabel = { management: ['MANAGEMENT · NOC 0', 'GESTION · NOC 0'], business: ['BUSINESS · NOC 1', 'AFFAIRES · NOC 1'], science: ['SCIENCES · NOC 2', 'SCIENCES · NOC 2'], health: ['HEALTH · NOC 3', 'SANTÉ · NOC 3'], education: ['EDUCATION · NOC 4', 'ÉDUCATION · NOC 4'], art: ['ART & CULTURE · NOC 5', 'ARTS ET CULTURE · NOC 5'], sales: ['SALES & SERVICE · NOC 6', 'VENTE ET SERVICES · NOC 6'], trades: ['TRADES · NOC 7', 'MÉTIERS · NOC 7'], resources: ['RESOURCES · NOC 8', 'RESSOURCES · NOC 8'], factory: ['MANUFACTURING · NOC 9', 'FABRICATION · NOC 9'] }[ind] || ['', '']

  const legend = RATING_ORDER.map(c => {
    const m = RATE_MAP[c]
    return { c, t: fr ? m.fr : m.en }
  })

  return (
    <div className="map-panel">
      <div className="map-head">
        <h3>{fr ? 'Perspectives par province' : 'Outlook by Province'}</h3>
        <span className="sub">2025–2027</span>
        <span className="industry-tag">{fr ? indLabel[1] : indLabel[0]}</span>
      </div>
      <div className="map-svg">
        <div className="map-photo ph-CA" ref={photoRef} style={{ backgroundImage: `url(${img(PROV_PHOTOS[selected || 'CA'])})` }} />
        <div className="map-tilt">
          <svg viewBox={CANADA_VIEWBOX} xmlns="http://www.w3.org/2000/svg" aria-hidden="true" ref={svgRef}>
            <defs>
              {CANADA_PATHS.map(p => {
                const c = ratings[p.code] || '#64748B'
                return (
                  <linearGradient key={'pg-' + p.code} id={'pg-' + p.code} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor={shade(c, .30)} />
                    <stop offset=".5" stopColor={c} />
                    <stop offset="1" stopColor={shade(c, -.32)} />
                  </linearGradient>
                )
              })}
              <filter id="relief" x="-14%" y="-14%" width="128%" height="128%">
                <feDropShadow dx="0" dy="5" stdDeviation="3.4" floodColor="#000000" floodOpacity=".55" />
              </filter>
            </defs>
            <g transform="translate(0 9)">{CANADA_PATHS.map(p => <path key={'d' + p.code} d={p.d} fill="#0C1B2E" />)}</g>
            <g transform="translate(0 4.5)">{CANADA_PATHS.map(p => <path key={'m' + p.code} d={p.d} fill="#13283F" />)}</g>
            {CANADA_PATHS.map(p => (
              <path
                key={p.code}
                className={'prov' + (selected === p.code ? ' sel' : '')}
                data-code={p.code}
                d={p.d}
                fill={`url(#pg-${p.code})`}
                stroke="#05080D"
                strokeWidth="3.4"
                strokeLinejoin="round"
                filter="url(#relief)"
                onClick={() => selectProv(p.code, true)}
              />
            ))}
          </svg>
        </div>
      </div>
      <div className="legend">
        {legend.map(l => (
          <span key={l.c}><i style={{ background: l.c }} />{l.t}</span>
        ))}
      </div>

      {/* province detail card */}
      <div className="prov-card" ref={cardRef} style={{ borderLeft: `3px solid ${ratings[cardCode] || '#3ECF8E'}` }}>
        <div className="p-top">
          <span className="pin" style={{ color: '#3ECF8E' }} dangerouslySetInnerHTML={{ __html: PIN_ICON }} />
          <span className="p-name">{fr ? prov.nameFr : prov.nameEn}</span>
          <span className="p-badge" style={{ color: r.stars >= 3 ? '#3ECF8E' : (r.stars === 0 ? '#64748B' : '#F5B34C'), borderColor: (r.stars >= 3 ? 'rgba(62,207,142,.3)' : 'rgba(245,179,76,.3)'), background: (r.stars >= 3 ? 'rgba(62,207,142,.10)' : 'rgba(245,179,76,.10)') }}>
            <StarRow n={r.stars} size={13} color={r.stars >= 3 ? '#3ECF8E' : (r.stars === 0 ? '#64748B' : '#F5B34C')} />
            {fr ? r.fr : r.en}
          </span>
        </div>
        <div className="p-desc">{fr ? prov.descFr : prov.descEn}</div>
        <div className="p-stats">
          <span><b className="v">{st.med}</b><span className="u">{fr ? 'médiane / h' : '/hr median'}</span></span>
          <span><b className="v">{st.jobs}</b><span className="u">{fr ? "offres aujourd'hui" : 'jobs today'}</span></span>
          <span><b className="v">{st.outlook}</b><span className="u">{fr ? 'perspectives 3 ans' : '3-yr outlook'}</span></span>
        </div>
      </div>

      {/* province ordering helper for screen readers */}
      <span className="sr-only">
        {fr ? 'Rang des provinces : ' : 'Province order: '}{PROV_PRIORITY.join(', ')}
      </span>
    </div>
  )
}
