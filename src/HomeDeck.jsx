/**
 * @file HomeDeck.jsx
 * @description Coverflow fan of ten NOC poker-style cards (mockup D).
 *
 *   - Continuous drag: while the finger moves, cards are re-posed DIRECTLY on
 *     the DOM inside a rAF loop (no React render, no per-frame CSS filters),
 *     so even mid-range phones stay at 60fps and the fan follows the finger.
 *     Dragging 200px = exactly one card step.
 *   - Elastic settle: on release the fan snaps to the nearest card through an
 *     overshoot spring curve; the paddle and taps step with the same spring.
 *   - Paddle rail (replaces the old arrows/dots): ten fixed slots under the
 *     fan — tap a slot to jump, drag along it to scrub (20px = 1 card), and
 *     arrow keys work once it has focus.
 *   - Tap arbitration: a tap is decided on RELEASE (<8px drift, <300ms). The
 *     previous rule flagged a drag after 6px mid-move, so a 7px finger roll
 *     swallowed the click and the card "did nothing"; now 8-62px springs back
 *     without navigating, and only a near-still release counts as a tap.
 *   - Centre card opens the sector: tapping the card under the lens calls
 *     onOpen(index); tapping a side card centres it instead.
 *   - Ratchet feedback on every card crossed (visual only — the user removed
 *       the click sound because it could not keep up with fast swipes):
 *       · a gold flash on the incoming card (works on every device);
 *       · a 5px mechanical kick of the whole deck;
 *       · vibration where the platform exposes it (not on iOS).
 *   - Circular loop NOC 0-9; cards beyond ±2 are hidden but stay in the loop.
 *   - On change, notifies the parent with the centred NOC key so the map and
 *     the province detail card stay in sync.
 *
 * @author Xiaopeng Li
 * @copyright © 2026 Xiaopeng Li
 * @version 1.4.0
 */
import React from 'react'
import { INDUSTRIES, ICONS, img } from './homeData'

const CARD_W = 200    /* px per card step — the deck card width */
const SWIPE = 62      /* px threshold for a velocity-less step */
const VEL = .45        /* px/ms velocity threshold for a flick */
const MAX_STEP = 2     /* max cards a single flick can advance */
const TAP_MAX = 8      /* px a release may drift and still be a tap */
const TAP_MS = 300     /* ms a tap may last before it becomes a press */
const RAIL_STEP = 20   /* px of rail drag that equals one card */

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
 * drag fraction), returned as a React style object for the static/settled
 * layout. Positions are piecewise-linear so dragging exactly CARD_W px moves
 * one card into the centre — the whole fan is glued to the finger.
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
  const x = abs <= 1 ? abs * 118 : 40 + abs * 78   /* 0→118→196 px */
  const rot = abs <= 1 ? abs * 24 : 4 + abs * 20   /* 0→24→44 deg */
  const sc = Math.max(.58, 1 - abs * .19)          /* ±1:.81  ±2:.62 */
  const b = Math.max(.55, 1 - abs * .2)            /* ±1:.80  ±2:.60 */
  const base = {
    transform: `translateX(${x * dir}px) rotateY(${rot * -dir}deg) scale(${sc})`,
    zIndex: 50 - Math.round(abs) * 10,
    filter: `brightness(${b})`,
    opacity: Math.max(0, 1 - abs * .13),
    boxShadow: '0 14px 26px rgba(0,0,0,.42)'
  }
  if (settling && abs < .04) {
    base.boxShadow = '0 22px 40px rgba(0,0,0,.55), 0 0 0 1px rgba(232,179,75,.18)'
  }
  return base
}

/**
 * Drag-time pose applied DIRECTLY to the DOM inside the rAF loop. During the
 * drag the fan is posed with 2D transforms only (translateX + scale) — no
 * rotateY, no perspective compositing — which is the GPU-fast path iPhones
 * need to keep 60fps while following the finger. The 3D rotateY returns on
 * settle, when React renders the resting fan.
 */
function applyDragPose(el, off) {
  const abs = Math.abs(off)
  if (abs > 2) {
    el.style.transform = 'translateX(0) scale(.4)'
    el.style.zIndex = '1'
    el.style.filter = 'brightness(.7)'
    el.style.opacity = '0'
    el.style.pointerEvents = 'none'
    return
  }
  const dir = off > 0 ? 1 : -1
  const x = abs <= 1 ? abs * 118 : 40 + abs * 78
  const sc = Math.max(.58, 1 - abs * .19)
  el.style.transform = `translateX(${x * dir}px) scale(${sc})`
  el.style.zIndex = String(50 - Math.round(abs) * 10)
  el.style.filter = 'none'                     /* avoid per-frame pixel filters */
  el.style.opacity = String(Math.max(0, 1 - abs * .13))
  el.style.pointerEvents = ''
}

export default function HomeDeck({ lang, onChange, onOpen, counts }) {
  const [center, setCenter] = React.useState(0)
  const [dragX, setDragX] = React.useState(0)
  const [mounted, setMounted] = React.useState(false)
  const [settling, setSettling] = React.useState(false)
  const deckRef = React.useRef(null)
  const centerRef = React.useRef(0)
  const dragRaf = React.useRef(null)
  const drag = React.useRef({ on: false, x0: 0, t0: 0, units: 0, lastWhole: 0, moved: false, target: null })
  /* A drag that actually moved must swallow the synthetic click that follows
     pointerup (browsers still fire click after a mouse drag). Without this the
     tap handler jumps back to the card the finger LEFT — the deck looks like
     it "does nothing" on desktop/in-app browsers. */
  const suppressClick = React.useRef(false)
  /* Rail: accumulated drag distance and the click guard (a scrub must not end
     in a slot jump under the finger). */
  const railDrag = React.useRef({ on: false, x: 0, acc: 0, moved: 0, tick: null })
  const railTapBlock = React.useRef(false)

  const N = INDUSTRIES.length
  const fr = lang === 'fr'

  centerRef.current = center

  React.useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  /* --- power feedback (visual only: the user dropped the click sound — it
         could not keep up with fast swipes, and Web Audio is silenced by the
         iPhone side switch anyway) --- */

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

  /** Visual ratchet: flash the gold ring on the card about to land in the
      centre — works on every device, including iPhones with no vibration API
      and a silenced speaker. */
  const popCard = (idx) => {
    if (!deckRef.current) return
    const cards = deckRef.current.querySelectorAll('.icard')
    if (!cards || !cards[idx]) return
    const el = cards[idx]
    el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse')
  }

  /* Circular offset around the centre (reads latest centre via ref). */
  const loopOff = (i) => {
    const o = (i - centerRef.current + N) % N
    return o > N / 2 ? o - N : o
  }

  /* --- drag state machine (DOM-direct during drag) --- */

  /** rAF loop: re-pose every card from the live drag fraction, bypassing
      React entirely so 60Hz pointermove never drowns the UI thread. */
  const renderDrag = React.useCallback(() => {
    const d = drag.current
    if (!d.on) { dragRaf.current = null; return }
    const cards = deckRef.current ? deckRef.current.querySelectorAll('.icard') : null
    if (cards) {
      for (let i = 0; i < cards.length; i++) {
        const off = loopOff(i) + d.units
        if (Math.abs(off) > 2) continue      /* hidden cards keep their static pose */
        applyDragPose(cards[i], off)
      }
    }
    dragRaf.current = requestAnimationFrame(renderDrag)
  }, [])

  const startDrag = (e) => {
    const d = drag.current
    if (dragRaf.current) { cancelAnimationFrame(dragRaf.current); dragRaf.current = null }
    d.on = true; d.moved = false; d.x0 = e.clientX; d.t0 = performance.now()
    d.target = e.target && e.target.closest ? e.target.closest('.icard') : null
    d.units = dragX / CARD_W
    d.lastWhole = Math.round(d.units)
    setSettling(false)
    if (deckRef.current) deckRef.current.classList.add('dragging')
    deckRef.current?.setPointerCapture(e.pointerId)
  }

  const moveDrag = (e) => {
    const d = drag.current
    if (!d.on) return
    const dx = e.clientX - d.x0
    if (Math.abs(dx) > TAP_MAX) d.moved = true
    const units = dx / CARD_W
    /* ratchet: click + buzz + gold flash each time another card slides
       through centre — sound/vibration may be missing on some phones, so the
       visual flash is the guaranteed feedback */
    const whole = Math.round(units)
    if (d.moved && Math.abs(units) > .06 && whole !== d.lastWhole) {
      d.lastWhole = whole
      haptic(8)
      const incoming = whole > 0 ? (centerRef.current - 1 + N) % N : (centerRef.current + 1) % N
      popCard(incoming)
      /* mechanical kick: the whole deck jerks sideways like a ratchet pawl —
         5px so the power feedback is clearly visible on every device
         (sound/vibration may be absent) */
      const deckEl = deckRef.current
      if (deckEl && deckEl.animate) {
        try {
          deckEl.animate(
            [{ transform: 'translateX(5px)' }, { transform: 'translateX(0)' }],
            { duration: 90, easing: 'ease-out' }
          )
        } catch (e) { /* decorative only */ }
      }
    }
    d.units = units
    if (!dragRaf.current) dragRaf.current = requestAnimationFrame(renderDrag)
  }

  /** Tap on a card jumps to it — but a finished drag must not be followed by
      the browser's synthetic click (which would undo the step). */
  const handleCardClick = (i) => {
    if (suppressClick.current) return
    jumpTo(i)
  }

  const endDrag = () => {
    const d = drag.current
    if (!d.on) return
    d.on = false
    if (dragRaf.current) { cancelAnimationFrame(dragRaf.current); dragRaf.current = null }
    if (deckRef.current) deckRef.current.classList.remove('dragging')
    const v = (d.units * CARD_W) / Math.max(1, performance.now() - d.t0)
    const elapsed = performance.now() - d.t0

    /* --- tap arbitration: decided on RELEASE, not mid-move --------------- */
    if (!d.moved && elapsed < TAP_MS) {
      const target = d.target
      d.target = null
      if (target) {
        suppressClick.current = true                /* kill the synthetic click */
        setTimeout(() => { suppressClick.current = false }, 350)
        const idx = Number(target.dataset ? target.dataset.i : NaN)
        setDragX(0)
        setSettling(false)
        if (!Number.isNaN(idx)) {
          if (idx === centerRef.current) openSector(idx)   /* centre card = open the sector */
          else jumpTo(idx)                                 /* side card = bring it to the lens */
        }
        return
      }
    }
    d.target = null
    /* left-drag advances (+1), right-drag goes back (-1), like flipping a book */
    let step = -Math.round(d.units)
    if (!d.moved) step = 0
    else if (step === 0 && (d.units * CARD_W < -SWIPE || v < -VEL)) step = 1
    else if (step === 0 && (d.units * CARD_W > SWIPE || v > VEL)) step = -1
    step = Math.max(-MAX_STEP, Math.min(MAX_STEP, step))
    if (d.moved) {
      suppressClick.current = true
      setTimeout(() => { suppressClick.current = false }, 350)
    }
    setSettling(true)
    if (step === 0) {
      setDragX(0)                                 /* elastic snap back */
      setTimeout(() => setSettling(false), 700)
      return
    }
    const next = (centerRef.current + step + N) % N
    centerRef.current = next
    setCenter(next)
    /* leftover = U + step keeps the incoming card exactly where the finger
       left it, so the spring settle glides it into centre with zero jump */
    setDragX((d.units + step) * CARD_W)
    haptic(12)
    setTimeout(() => { settlePulse() }, 40)
    onChange(INDUSTRIES[next].key)
    setTimeout(() => { setDragX(0); setTimeout(() => setSettling(false), 620) }, 50)
  }

  const cancelDrag = () => {
    const d = drag.current
    d.on = false
    if (dragRaf.current) { cancelAnimationFrame(dragRaf.current); dragRaf.current = null }
    if (deckRef.current) deckRef.current.classList.remove('dragging')
    setDragX(0)
    setSettling(false)
  }

  /* Arrow steps / tap-to-jump — same spring settle, pulse. */
  const go = (dir) => {
    const next = (centerRef.current + dir + N) % N
    centerRef.current = next
    setCenter(next)
    setDragX(0)
    setSettling(true)
    haptic(10)
    setTimeout(() => { settlePulse() }, 40)
    setTimeout(() => setSettling(false), 700)
    onChange(INDUSTRIES[next].key)
  }

  const jumpTo = (i) => {
    if (i === centerRef.current) return
    centerRef.current = i
    setCenter(i)
    setDragX(0)
    setSettling(true)
    haptic(10)
    setTimeout(() => { settlePulse() }, 40)
    setTimeout(() => setSettling(false), 700)
    onChange(INDUSTRIES[i].key)
  }

  /* Centre card → hand its index to the parent, which opens the NOC group. */
  const openSector = (i) => {
    haptic(14)
    setTimeout(() => { settlePulse() }, 40)
    if (onOpen) onOpen(i)
  }

  /* --- paddle rail: tap a slot to jump, drag along it to scrub --------- */
  const startRail = (e) => {
    const r = railDrag.current
    r.on = true; r.x = e.clientX; r.acc = 0; r.moved = 0
    /* capture redirects the pointer AND the click that follows it, so the
       slot has to be resolved here and acted on in endRail — the tick's own
       onClick never fires once the rail captures the pointer */
    const el = e.target && e.target.closest ? e.target.closest('.tick') : null
    r.tick = el ? Number(el.dataset.i) : null
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const moveRail = (e) => {
    const r = railDrag.current
    if (!r.on) return
    const delta = e.clientX - r.x
    r.x = e.clientX
    r.moved += Math.abs(delta)
    r.acc += delta
    /* drag right = previous card, same convention as the fan */
    while (r.acc >= RAIL_STEP) { r.acc -= RAIL_STEP; go(-1) }
    while (r.acc <= -RAIL_STEP) { r.acc += RAIL_STEP; go(1) }
  }

  const endRail = () => {
    const r = railDrag.current
    if (!r.on) return
    r.on = false; r.acc = 0
    const tapped = r.tick
    r.tick = null
    if (r.moved > TAP_MAX) {          /* a scrub must not end in a slot jump */
      railTapBlock.current = true
      setTimeout(() => { railTapBlock.current = false }, 350)
      return
    }
    if (tapped != null && !isNaN(tapped)) jumpTo(tapped)
  }

  const tapTick = (i) => {
    if (railTapBlock.current) return
    jumpTo(i)
  }

  const railKey = (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1) }
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
          const occN = counts && counts[i] ? counts[i] : 0
          return (
            <div
              key={it.key}
              className={`icard bg-${it.key}`}
              data-i={i}
              data-side={Math.min(2, Math.abs(Math.round(contOff)))}
              style={{ ...cardStyle(contOff, settling), backgroundImage: `url(${img(it.photo)})` }}
              onClick={() => handleCardClick(i)}
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
                <div className="ic-cta">
                  <span>{occN > 0 ? `${occN} ` : ''}{fr ? 'PROFESSIONS' : 'OCCUPATIONS'}</span>
                  <b>
                    {fr ? 'VOIR' : 'BROWSE'}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
                  </b>
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
        <div
          className="rail"
          role="group"
          tabIndex={0}
          aria-label={fr ? 'Choisir un secteur : glisser ou toucher un repère' : 'Choose a sector: drag the rail or tap a tick'}
          onPointerDown={startRail}
          onPointerMove={moveRail}
          onPointerUp={endRail}
          onPointerCancel={endRail}
          onKeyDown={railKey}
        >
          {INDUSTRIES.map((it, i) => (
            <button
              key={it.key}
              type="button"
              className={`tick${i === center ? ' on' : ''}`}
              data-i={i}
              onClick={() => tapTick(i)}
              aria-label={`${i + 1} / ${N} · ${fr ? it.nameFr : it.nameEn}`}
            ><i /></button>
          ))}
        </div>
      </div>
      {/* Hidden live region announcing the active NOC for screen readers */}
      <span className="sr-only" aria-live="polite">
        {fr ? `Secteur actif : NOC ${center} ${ind.nameFr}` : `Active NOC ${center} — ${ind.nameEn}`}
      </span>
    </div>
  )
}
