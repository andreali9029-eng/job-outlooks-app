/**
 * @file HomeDeck.jsx
 * @description Coverflow fan of ten NOC poker-style cards (mockup D).
 *   - Continuous drag: every card re-poses from a signed offset that includes
 *     the live finger position (dragging 200px = exactly one card step), so the
 *     fan follows the pointer 1:1 with no jump on release.
 *   - Elastic settle: on release the fan snaps to the nearest card with an
 *     overshoot spring curve; arrows / taps step with the same spring.
 *   - Power feedback: each time a card edge crosses centre during a drag, a
 *     short Web-Audio tick plays, the device vibrates, and the landing card
 *     pulses — a mechanical ratchet feel while swiping.
 *   - Circular loop NOC 0-9; cards beyond ±2 are hidden but stay in the loop.
 *   - On change, notifies the parent with the centred NOC key so the map and
 *     the province detail card stay in sync.
 * @author Xiaopeng Li
 * @copyright © 2026 Xiaopeng Li
 * @version 1.1.0
 */
import React from 'react'
import { INDUSTRIES, ICONS, img } from './homeData'

const CARD_W = 200   /* px per card step — the deck card width */
const SWIPE = 62     /* px threshold for a velocity-less step */
const VEL = .45       /* px/ms velocity threshold for a flick */
const MAX_STEP = 2    /* max cards a single flick can advance */

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

/**
 * Per-card pose from a CONTINUOUS signed offset (integer card steps + the live
 * drag fraction). Positions are piecewise-linear so dragging exactly CARD_W px
 * moves one card into the centre — the whole fan is glued to the finger.
 */
function cardStyle(off, settling) {
  const abs = Math.abs(off)
  if (abs > 2) {
    return {
      transform: 'translateX(0) scale(.4)',
      zIndex: 1,
      filter: 'brightness(.7)',
      opacity: 0,
      pointerEvents: 'none',
      boxShadow: 'none'
    }
  }
  const dir = off > 0 ? 1 : -1
  /* x: 0→118px over 0→1, then 118→196px over 1→2  (was ±1:118px, ±2:196px) */
  const x = abs <= 1 ? abs * 118 : 40 + abs * 78
  /* rot: 0→24° over 0→1, then 24→44° over 1→2 */
  const rot = abs <= 1 ? abs * 24 : 4 + abs * 20
  const sc = Math.max(.58, 1 - abs * .19)   /* ±1:.81  ±2:.62 */
  const b = Math.max(.55, 1 - abs * .2)     /* ±1:.80  ±2:.60 */
  const base = {
    transform: `translateX(${x * dir}px) rotateY(${rot * -dir}deg) scale(${sc})`,
    zIndex: 50 - Math.round(abs) * 10,
    filter: `brightness(${b})`,
    opacity: Math.max(0, 1 - abs * .13),
    boxShadow: '0 14px 26px rgba(0,0,0,.42)'
  }
  if (settling && abs < .04) {
    /* centre card during the spring settle keeps its gold ring */
    base.boxShadow = '0 22px 40px rgba(0,0,0,.55), 0 0 0 1px rgba(232,179,75,.18)'
  }
  return base
}

export default function HomeDeck({ lang, onChange }) {
  const [center, setCenter] = React.useState(0)
  const [dragX, setDragX] = React.useState(0)         /* live finger px */
  const [mounted, setMounted] = React.useState(false)
  const [settling, setSettling] = React.useState(false)
  const deckRef = React.useRef(null)
  const rafPending = React.useRef(false)
  const drag = React.useRef({ on: false, x0: 0, t0: 0, units: 0, lastWhole: 0, moved: false })
  const actxRef = React.useRef(null)

  const N = INDUSTRIES.length
  const fr = lang === 'fr'

  React.useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  /* --- power feedback --- */
  /** Short mechanical "tick" via Web Audio (triangle sweep, fast decay). */
  const tick = React.useCallback(() => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!actxRef.current) actxRef.current = new Ctx()
      const actx = actxRef.current
      if (actx.state === 'suspended') actx.resume()
      const t = actx.currentTime
      const osc = actx.createOscillator()
      const g = actx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(820, t)
      osc.frequency.exponentialRampToValueAtTime(220, t + 0.03)
      g.gain.setValueAtTime(0.09, t)
      g.gain.exponentialRampToValueAtTime(0.0006, t + 0.04)
      osc.connect(g)
      g.connect(actx.destination)
      osc.start(t)
      osc.stop(t + 0.045)
    } catch (e) { /* audio unavailable — haptics still carry the feedback */ }
  }, [])

  /** Vibration where the device supports it. */
  const haptic = (ms) => {
    if (navigator.vibrate) { try { navigator.vibrate(ms) } catch (e) {} }
  }

  /** Golden pulse on the centre card — visual landing feedback. */
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

  /* Circular offset: -5..+4 around the centre; beyond ±2 hidden but in loop. */
  const loopOff = (i) => {
    const o = (i - center + N) % N
    return o > N / 2 ? o - N : o
  }

  /* --- drag state machine --- */
  const startDrag = (e) => {
    const d = drag.current
    d.on = true; d.moved = false; d.x0 = e.clientX; d.t0 = performance.now()
    d.units = dragX / CARD_W; d.lastWhole = Math.round(d.units)
    tick()                                        /* prime audio on the gesture */
    setSettling(false)
    if (deckRef.current) deckRef.current.classList.add('dragging')
    deckRef.current?.setPointerCapture(e.pointerId)
  }

  const moveDrag = (e) => {
    const d = drag.current
    if (!d.on) return
    const dx = e.clientX - d.x0
    if (Math.abs(dx) > 6) d.moved = true
    const units = dx / CARD_W
    /* ratchet: a click + buzz each time another card slides through centre */
    const whole = Math.round(units)
    if (d.moved && Math.abs(units) > .06 && whole !== d.lastWhole) {
      d.lastWhole = whole
      haptic(8)
      tick()
    }
    d.units = units
    /* rAF-throttled setState so 60Hz pointermove never drowns the UI thread */
    if (!rafPending.current) {
      rafPending.current = true
      requestAnimationFrame(() => {
        rafPending.current = false
        setDragX(drag.current.units * CARD_W)
      })
    }
  }

  const endDrag = () => {
    const d = drag.current
    if (!d.on) return
    d.on = false
    if (deckRef.current) deckRef.current.classList.remove('dragging')
    const v = (d.units * CARD_W) / Math.max(1, performance.now() - d.t0)
    /* left-drag advances (+1), right-drag goes back (-1), like flipping a book */
    let step = -Math.round(d.units)
    if (!d.moved) step = 0
    else if (step === 0 && (d.units * CARD_W < -SWIPE || v < -VEL)) step = 1
    else if (step === 0 && (d.units * CARD_W > SWIPE || v > VEL)) step = -1
    step = Math.max(-MAX_STEP, Math.min(MAX_STEP, step))
    setSettling(true)
    if (step === 0) {
      /* elastic snap back to the same card */
      setDragX(0)
      setTimeout(() => setSettling(false), 700)
      return
    }
    const next = (center + step + N) % N
    setCenter(next)
    /* leftover = U + step keeps the incoming card exactly where the finger left
       it, so the spring settle glides it into centre with zero visual jump */
    setDragX((d.units + step) * CARD_W)
    haptic(12)
    setTimeout(() => { settlePulse() }, 40)
    onChange(INDUSTRIES[next].key)
    setTimeout(() => { setDragX(0); setTimeout(() => setSettling(false), 620) }, 50)
  }

  const cancelDrag = () => {
    const d = drag.current
    d.on = false
    if (deckRef.current) deckRef.current.classList.remove('dragging')
    setDragX(0)
    setSettling(false)
  }

  /* Arrow steps / tap-to-jump — same spring settle, tick + pulse. */
  const go = (dir) => {
    const next = (center + dir + N) % N
    setCenter(next)
    setDragX(0)
    setSettling(true)
    haptic(10)
    setTimeout(() => { settlePulse() }, 40)
    setTimeout(() => setSettling(false), 700)
    onChange(INDUSTRIES[next].key)
  }

  const jumpTo = (i) => {
    if (i === center) return
    setCenter(i)
    setDragX(0)
    setSettling(true)
    haptic(10)
    setTimeout(() => { settlePulse() }, 40)
    setTimeout(() => setSettling(false), 700)
    onChange(INDUSTRIES[i].key)
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
        className={`deck${mounted ? ' animated' : ''}${settling ? ' settling' : ''}`}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={cancelDrag}
      >
        {INDUSTRIES.map((it, i) => {
          const contOff = loopOff(i) + dragX / CARD_W
          return (
            <div
              key={it.key}
              className={`icard bg-${it.key}`}
              style={{ ...cardStyle(contOff, settling), backgroundImage: `url(${img(it.photo)})` }}
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
