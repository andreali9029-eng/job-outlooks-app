/**
 * @file jobMatch.js
 * @description Job Bank live-posting matching module.
 *   Fetches & parses real-time Job Bank job-search pages through the /jb proxy
 *   (required because Job Bank blocks cross-origin browser requests), then
 *   scores each posting against the user's profile (title / wage / freshness /
 *   location). Pure functions — no React dependency.
 * @author andreali9029-eng
 * @copyright © 2026 andreali9029-eng
 * @version 1.0.0
 */

/* Job Match: fetch & parse live Job Bank postings (via the /jb dev proxy)
   and score each posting against the user's profile.
   Pure functions — no React dependency. */

const ARTICLE_RE = /<article[^>]*class="action-buttons"[\s\S]*?<\/article>/g
const TITLE_RE = /<span class="noctitle">\s*([\s\S]*?)\s*<\/span>/
const HREF_RE = /href="(\/jobsearch\/jobposting\/(\d+))[^"]*"/
const BUSINESS_RE = /<li class="business">([\s\S]*?)<\/li>/
const LOCATION_RE = /<li class="location">[\s\S]*?<\/span>\s*([\s\S]*?)<\/li>/
const SALARY_RE = /<li class="salary">[\s\S]*?Salary\s*([\s\S]*?)<\/li>/
const DATE_RE = /<li class="date">([\s\S]*?)<\/li>/
const TAG_RE = /<[^>]+>/g
const WS_RE = /\s+/g

export function cleanHtml(s) {
  return (s || '').replace(TAG_RE, ' ').replace(WS_RE, ' ').trim()
}

/** Parse the Job Bank search-results HTML into postings. */
export function parsePostings(html) {
  const jobs = []
  const articles = html.match(ARTICLE_RE) || []
  for (const art of articles) {
    const href = art.match(HREF_RE)
    if (!href) continue
    const title = cleanHtml((art.match(TITLE_RE) || [])[1])
    if (!title) continue
    let loc = cleanHtml((art.match(LOCATION_RE) || [])[1])
    if (loc && loc.startsWith('Location ')) loc = loc.slice('Location '.length)
    jobs.push({
      id: href[2],
      url: 'https://www.jobbank.gc.ca/jobsearch/jobposting/' + href[2],
      title,
      employer: cleanHtml((art.match(BUSINESS_RE) || [])[1]) || null,
      location: loc || null,
      wage: cleanHtml((art.match(SALARY_RE) || [])[1]) || null,
      date: cleanHtml((art.match(DATE_RE) || [])[1]) || null,
    })
  }
  return jobs
}

/** Split a free-text query into meaningful keywords (skip very short / noise). */
export function keywordsOf(query) {
  const noise = new Set(['a', 'an', 'the', 'and', 'or', 'of', 'for', 'in', 'on', 'to', 'with',
    'de', 'la', 'le', 'les', 'et', 'des', 'du', 'un', 'une', 'dans', 'pour'])
  return (query || '')
    .toLowerCase()
    .split(/[\s,;:/()+.-]+/)
    .map(w => w.trim())
    .filter(w => w.length >= 3 && !noise.has(w))
}

/** Match a posting's fields against the keyword list. Returns 0..1 hit ratio. */
export function fieldHit(fields, kws) {
  if (!kws.length) return 0
  let hits = 0
  for (const kw of kws) {
    if (fields.some(f => f && f.toLowerCase().includes(kw))) hits++
  }
  return hits / kws.length
}

/** Parse "$22.96-$34.00 per hour" / "$50,000 to $60,000 yearly" → min/max numbers. */
export function parseWage(wageStr) {
  if (!wageStr) return null
  const nums = wageStr.replace(/[$,\s]/g, '').match(/\d+(\.\d+)?/g)
  if (!nums || !nums.length) return null
  const vals = nums.map(Number)
  const yearly = /year|annual|annuel/i.test(wageStr)
  return { min: Math.min(...vals), max: Math.max(...vals), yearly }
}

/** Convert a Job Bank date string to a Date.
    Supports "2026-10-26", "October 26, 2026", "26 octobre 2026", "Oct 26, 2026". */
const MONTHS = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  jan: 0, feb: 1, mar: 2, apr: 3, jun: 5, jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11,
  janvier: 0, février: 1, mars: 2, avril: 3, mai: 4, juin: 5, juillet: 6,
  août: 7, septembre: 8, octobre: 9, novembre: 10, décembre: 11,
}

function toUtc(y, mo, d) {
  const dt = new Date(Date.UTC(+y, mo, +d))
  return isNaN(dt) ? null : dt
}

export function parseDate(dateStr) {
  if (!dateStr) return null
  const s = String(dateStr)
  let m = s.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (m) return toUtc(m[1], +m[2] - 1, m[3])
  m = s.match(/([A-Za-zÀ-ÿ]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})/)
  if (m) {
    const mon = MONTHS[m[1].toLowerCase()]
    if (mon != null) return toUtc(m[3], mon, m[2])
  }
  return null
}

/**
 * Score one posting (0-100) from the list-level fields.
 * weights: title 40%, wage 25%, freshness 15%, location 20%.
 */
export function scorePosting(job, profile) {
  const kws = keywordsOf(profile.query)
  const titleScore = fieldHit([job.title, job.employer], kws) * 40

  /* Wage */
  let wageScore = 50
  const pw = parseWage(job.wage)
  if (pw) {
    if (profile.wage && profile.wage > 0) {
      const want = profile.wage
      const ref = pw.yearly ? (pw.min / 2000) : pw.min
      wageScore = ref >= want ? 100 : Math.min(100, (ref / want) * 100)
    } else {
      wageScore = 70
    }
  }

  /* Freshness */
  const d = parseDate(job.date)
  let freshScore = 40
  if (d) {
    const days = (Date.now() - d.getTime()) / 86400000
    freshScore = days <= 0 ? 100 : days <= 3 ? 85 : days <= 7 ? 65 : days <= 21 ? 50 : 40
  }

  /* Location: profile province already filtered server-side; city keyword adds */
  let locScore = 70
  const locKws = keywordsOf(profile.location || '')
  if (locKws.length) {
    locScore = fieldHit([job.location], locKws) * 100
  }

  return {
    score: Math.round(titleScore + wageScore * 0.25 + freshScore * 0.15 + locScore * 0.2),
    titleScore: Math.round(titleScore),
    wageScore: Math.round(wageScore),
    freshScore,
    locScore: Math.round(locScore),
  }
}

/** Fetch + parse the search page through the /jb proxy.
    Job Bank's term search only works reliably with ≤2 words and ignores quotes,
    so each keyword is searched separately and results are merged (deduped by id). */
export async function fetchPostings(profile) {
  const kws = keywordsOf(profile.query).slice(0, 5)
  if (!kws.length) throw new Error('no keywords')
  const base = new URLSearchParams()
  if (profile.prov && profile.prov !== 'CA') base.set('fprov', profile.prov)
  if (profile.noc) base.set('fn21', profile.noc)
  const qs = base.toString()
  const urls = kws.map(kw =>
    `/jb/jobsearch/jobsearch?${qs}${qs ? '&' : ''}term=${encodeURIComponent(kw)}`
  )
  const pages = await Promise.all(urls.map(u => fetch(u).then(r => {
    if (!r.ok) throw new Error(`Job Bank responded ${r.status}`)
    return r.text()
  })))
  const seen = new Set()
  const jobs = []
  for (const html of pages) {
    for (const j of parsePostings(html)) {
      if (!seen.has(j.id)) {
        seen.add(j.id)
        jobs.push(j)
      }
    }
  }
  return jobs
}

/** Fetch a posting detail page and extract the description text (for deep match). */
export async function fetchPostingDetail(url) {
  const proxyUrl = '/jb/jobsearch/jobposting/' + url.split('/').pop()
  const resp = await fetch(proxyUrl)
  if (!resp.ok) throw new Error(`detail ${resp.status}`)
  const html = await resp.text()
  /* Description body lives in <div class="job-posting-details-body ...">…</div>
     (sibling menu div follows). Fall back to og:description meta. */
  const m = html.match(/<div[^>]*class="job-posting-details-body[^"]*"[^>]*>([\s\S]*?)<div[^>]*class="job-posting-details-menu/i)
  let text = m ? cleanHtml(m[1]) : ''
  if (!text) {
    const og = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"/i)
    if (og) text = cleanHtml(og[1])
  }
  return { description: text }
}
