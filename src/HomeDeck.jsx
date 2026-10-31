/**
 * @file HomeDeck.jsx
 * @description Coverflow fan of ten NOC poker-style cards (mockup D).
 *   - Real drag-to-swipe: the whole fan follows the pointer via a --drag CSS
 *     variable, then settles (snap back) or steps (SWIPE px / velocity px/ms).
 *   - Circular loop NOC 0-9; cards beyond ±2 are hidden but stay in the loop.
 *   - Haptics: navigator.vibrate where available, visual pulse as fallback.
 *   - On change, notifies the parent with the centred NOC key so the map and
 *     the province detail card stay in sync.
 * @author Xiaopeng Li
 * @copyright © 2026 Xiaopeng Li
 * @version 1.0.0
 */
import React from 'react'
import { INDUSTRIES, ICONS, img } from './homeData'

const SWIPE = 62   /* px threshold for a step */
const VEL = .45    /* px/ms velocity threshold for a flick */

/** Render 1-5 stars; empty stars stay dimmed. */
function StarRow({ n, size = 13 }) {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <svg key={i} width={size} height={size} viewBox="0 0 24 24"
        fill="currentColor" style={{ color: i <= n ? undefined : 'rgba(255,255,255,.28)' }}>
        <path d="M12 2l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 17l-5.9 3.2 1.3-6.6L2.5 9l6.6-.8z" />
      </svg>
    )
  }
  return <>{stars}</>
}

/** Per-card pose: distance from centre drives rotation, scale, brightness, z. */
function cardStyle(off) {
  if (off === 0) {
    return {
      transform: 'translateX(var(--drag, 0px)) rotateY(0deg) scale(1)',
      zIndex: 50,
      filter: 'brightness(1)',
      opacity: 1,
      boxShadow: '0 22px 40px rgba(0,0,0,.55), 0 0 0 1px rgba(232,179,75,.18)'
    }
  }
  const abs = Math.abs(off)
  if (abs > 2) {
    return {
      transform: 'translateX(var(--drag, 0px)) scale(.4)',
      zIndex: 1,
      filter: 'brightness(.7)',
      opacity: 0,
      pointerEvents: 'none',
      boxShadow: 'none'
    }
  }
  const dir = off > 0 ? 1 : -1
  const x = 118 + (abs - 1) * 78                 /* ±1:118px  ±2:196px */
  const rot = -dir * (24 + (abs - 1) * 20)       /* ±1:24°   ±2:44°   */
  const sc = Math.max(.58, 1 - abs * .19)        /* ±1:.81   ±2:.62   */
  const b = Math.max(.55, 1 - abs * .2)          /* ±1:.80   ±2:.60   */
  return {
    transform: `translateX(calc(var(--drag, 0px) + ${x * dir}px)) rotateY(${rot}deg) scale(${sc})`,
    zIndex: 50 - abs * 10,
    filter: `brightness(${b})`,
    opacity: 1 - abs * .13,
    boxShadow: '0 14px 26px rgba(0,0,0,.42)'
  }
}

export default function HomeDeck({ lang, onChange }) {
  const [center, setCenter] = React.useState(0)
  const [mounted, setMounted] = React.useState(false)
  const deckRef = React.useRef(null)
  const drag = React.useRef({ on: false, dx: 0, x0: 0, t0: 0, moved: false })

  React.useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const N = INDUSTRIES.length
  const fr = lang === 'fr'

  /* Circular offset: -5..+4 around the centre; beyond ±2 hidden but in loop. */
  const loopOff = (i) => {
    const o = (i - center + N) % N
    return o > N / 2 ? o - N : o
  }

  /* Haptics: vibrate where available, visual pulse as fallback. */
  const haptic = (ms) => { if (navigator.vibrate) { try { navigator.vibrate(ms) } catch (e) {} } }
  const settlePulse = () => {
    if (!deckRef.current) return
    const cards = deckRef.current.querySelectorAll('.icard')
    for (const c of cards) {
      if (c.style.zIndex === '50') {
        c.classList.remove('pulse'); void c.offsetWidth; c.classList.add('pulse')
        break
      }
    }
  }

  const go = (dir) => {
    const next = (center + dir + N) % N
    setCenter(next)
    if (deckRef.current) deckRef.current.style.setProperty('--drag', '0px')
    haptic(10)
    setTimeout(settlePulse, 0)
    onChange(INDUSTRIES[next].key)
  }

  const jumpTo = (i) => {
    if (i === center) return
    setCenter(i)
    if (deckRef.current) deckRef.current.style.setProperty('--drag', '0px')
    haptic(10)
    setTimeout(settlePulse, 0)
    onChange(INDUSTRIES[i].key)
  }

  /* --- drag-to-swipe: the whole fan follows the pointer, then settles or steps --- */
  const onPointerDown = (e) => {
    const d = drag.current
    d.on = true; d.moved = false; d.dx = 0; d.x0 = e.clientX; d.t0 = performance.now()
    if (deckRef.current) deckRef.current.classList.add('dragging')
    deckRef.current?.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d.on) return
    d.dx = e.clientX - d.x0
    if (Math.abs(d.dx) > 6) d.moved = true
    if (deckRef.current) deckRef.current.style.setProperty('--drag', d.dx + 'px')
  }
  const endDrag = () => {
    const d = drag.current
    if (!d.on) return
    d.on = false
    if (deckRef.current) deckRef.current.classList.remove('dragging')
    const v = d.dx / Math.max(1, performance.now() - d.t0)
    if (d.moved && (d.dx < -SWIPE || v < -VEL)) go(1)
    else if (d.moved && (d.dx > SWIPE || v > VEL)) go(-1)
    else if (deckRef.current) deckRef.current.style.setProperty('--drag', '0px')
  }
  const cancelDrag = () => {
    drag.current.on = false
    if (deckRef.current) {
      deckRef.current.classList.remove('dragging')
      deckRef.current.style.setProperty('--drag', '0px')
    }
  }

  const ind = INDUSTRIES[center]
  const metaL = fr
    ? ['PROVINCES POSITIVES', "OFFRES AUJOURD'HUI", 'MÉDIANE / H']
    : ['PROVINCES POSITIVE', 'JOBS TODAY', 'MEDIAN / HR']

  return (
    <div className="deck-zone">
      <span className="swipe-tip">{fr ? 'GLISSER' : 'SWIPE'}</span>
      <div
        ref={deckRef}
        className={`deck${mounted ? ' animated' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={cancelDrag}
      >
        {INDUSTRIES.map((it, i) => {
          const off = loopOff(i)
          return (
            <div
              key={it.key}
              className={`icard bg-${it.key}`}
              style={{ ...cardStyle(off), backgroundImage: `url(${img(it.photo)})` }}
              onClick={() => jumpTo(i)}
              role="button"
              tabIndex={-1}
              aria-label={`NOC ${i} ${fr ? it.nameFr : it.nameEn}`}
            >
              <div className="edge top" />
              <div className="edge bot" />
              <div className="ic-num">{('0' + i).slice(-2)}</div>
              <div className="ic-body">
                <div className="ic-top">
                  <span className="ic-ico" style={{ color: it.color }} dangerouslySetInnerHTML={{ __html: ICONS[it.key] }} />
                  <div>
                    <div className="ic-name">{fr ? it.nameFr : it.nameEn}</div>
                    <div className="ic-code">{fr ? it.codeFr : it.codeEn}</div>
                  </div>
                </div>
                <div className="ic-rating">
                  <div className="ic-grade" style={{ color: it.color }}>
                    <span className="gdot" style={{ background: it.color, boxShadow: `0 0 9px ${it.color}aa` }} />
                    {fr ? it.rateFr : it.rateEn}
                  </div>
                  <div className="stars"><StarRow n={it.stars} /></div>
                </div>
                <div className="ic-meta">
                  <div className="ic-m"><span className="v">{it.prov}</span><span className="l">{metaL[0]}</span></div>
                  <div className="ic-m"><span className="v">{it.jobs}</span><span className="l">{metaL[1]}</span></div>
                  <div className="ic-m"><span className="v">{it.med}</span><span className="l">{metaL[2]}</span></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="deck-ctrl">
        <button className="arrow ctrl-left" aria-label={fr ? 'Secteur précédent' : 'Previous industry'} onClick={() => go(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </button>
        <div className="dots">
          {INDUSTRIES.map((it, i) => <i key={it.key} className={i === center ? 'on' : ''} />)}
        </div>
        <button className="arrow ctrl-right" aria-label={fr ? 'Secteur suivant' : 'Next industry'} onClick={() => go(1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
      {/* Hidden live region announcing the active NOC for screen readers */}
      <span className="sr-only" aria-live="polite">
        {fr ? `Secteur actif : NOC ${center} ${ind.nameFr}` : `Active NOC ${center} — ${ind.nameEn}`}
      </span>
    </div>
  )
}
