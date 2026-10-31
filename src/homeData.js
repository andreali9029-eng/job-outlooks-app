/**
 * @file homeData.js
 * @description Data layer for the redesigned Home view (mockup D).
 *   Ports the approved design's coverflow NOC deck + relief map + province
 *   detail card data into the React PWA, adding EN/FR bilingual labels.
 *   - INDUSTRIES:     10 NOC groups (NOC 0-9), each with photo / colour / stats
 *   - PROV_RATINGS:   per-industry province rating colours (10 x 13 provinces)
 *   - RATE_MAP:       rating colour -> label / stars / rank
 *   - IND_SHAPE:      per-industry multipliers for the detail-card numbers
 *   - PROV_PHOTOS:    real-photo backdrops (Canada default + 13 provinces)
 *   - PROV_DETAILS:   per-province labour-market detail (EN/FR)
 * @author Xiaopeng Li
 * @copyright © 2026 Xiaopeng Li
 * @version 1.0.0
 */

/* Rating colour palette (dark theme) — colour encodes the rating level. */
export const RATE_MAP = {
  '#3ECF8E': { en: 'Very Good', fr: 'Très bon', stars: 5, order: 5 },
  '#7BE0A8': { en: 'Good', fr: 'Bon', stars: 4, order: 4 },
  '#F5B34C': { en: 'Moderate', fr: 'Modéré', stars: 3, order: 3 },
  '#F97316': { en: 'Limited', fr: 'Limité', stars: 2, order: 2 },
  '#EF4444': { en: 'Very Limited', fr: 'Très limité', stars: 1, order: 1 },
  '#64748B': { en: 'Undetermined', fr: 'Indéterminé', stars: 0, order: 0 }
}

export const RATING_ORDER = ['#3ECF8E', '#7BE0A8', '#F5B34C', '#F97316', '#EF4444', '#64748B']

/** Turn a rating colour back into its label / stars / rank. */
export function ratingOf(hex) {
  return RATE_MAP[hex] || RATE_MAP['#64748B']
}

/* Per-industry province ratings — 10 NOC groups × 13 provinces (simulated
   demo data consistent with the approved mockup). */
export const PROV_RATINGS = {
  management: { YT:'#64748B', NT:'#64748B', NU:'#64748B', BC:'#7BE0A8', AB:'#7BE0A8', SK:'#F5B34C', MB:'#F5B34C', ON:'#3ECF8E', QC:'#7BE0A8', NB:'#F97316', NS:'#F97316', PE:'#F5B34C', NL:'#F97316' },
  business:   { YT:'#64748B', NT:'#64748B', NU:'#64748B', BC:'#7BE0A8', AB:'#F5B34C', SK:'#F5B34C', MB:'#F5B34C', ON:'#3ECF8E', QC:'#7BE0A8', NB:'#F97316', NS:'#F97316', PE:'#F97316', NL:'#F97316' },
  science:    { YT:'#64748B', NT:'#64748B', NU:'#64748B', BC:'#7BE0A8', AB:'#F5B34C', SK:'#F5B34C', MB:'#F5B34C', ON:'#3ECF8E', QC:'#7BE0A8', NB:'#F97316', NS:'#F97316', PE:'#F97316', NL:'#F97316' },
  health:     { YT:'#F5B34C', NT:'#F5B34C', NU:'#F5B34C', BC:'#7BE0A8', AB:'#7BE0A8', SK:'#F5B34C', MB:'#7BE0A8', ON:'#3ECF8E', QC:'#7BE0A8', NB:'#7BE0A8', NS:'#7BE0A8', PE:'#F5B34C', NL:'#F5B34C' },
  education:  { YT:'#F5B34C', NT:'#F5B34C', NU:'#F5B34C', BC:'#7BE0A8', AB:'#7BE0A8', SK:'#F5B34C', MB:'#F5B34C', ON:'#3ECF8E', QC:'#7BE0A8', NB:'#7BE0A8', NS:'#7BE0A8', PE:'#F5B34C', NL:'#F5B34C' },
  art:        { YT:'#64748B', NT:'#64748B', NU:'#64748B', BC:'#F5B34C', AB:'#F97316', SK:'#F97316', MB:'#F97316', ON:'#F5B34C', QC:'#F5B34C', NB:'#F97316', NS:'#F97316', PE:'#F97316', NL:'#EF4444' },
  sales:      { YT:'#F5B34C', NT:'#F5B34C', NU:'#F5B34C', BC:'#F5B34C', AB:'#F5B34C', SK:'#F5B34C', MB:'#F5B34C', ON:'#F5B34C', QC:'#F5B34C', NB:'#F97316', NS:'#F97316', PE:'#F97316', NL:'#F97316' },
  trades:     { YT:'#64748B', NT:'#64748B', NU:'#64748B', BC:'#7BE0A8', AB:'#7BE0A8', SK:'#F5B34C', MB:'#F5B34C', ON:'#3ECF8E', QC:'#7BE0A8', NB:'#F97316', NS:'#F97316', PE:'#F97316', NL:'#F97316' },
  resources:  { YT:'#F5B34C', NT:'#F5B34C', NU:'#F5B34C', BC:'#F5B34C', AB:'#3ECF8E', SK:'#7BE0A8', MB:'#7BE0A8', ON:'#F5B34C', QC:'#F5B34C', NB:'#F97316', NS:'#F97316', PE:'#F97316', NL:'#7BE0A8' },
  factory:    { YT:'#64748B', NT:'#64748B', NU:'#64748B', BC:'#F5B34C', AB:'#7BE0A8', SK:'#F5B34C', MB:'#F5B34C', ON:'#3ECF8E', QC:'#7BE0A8', NB:'#F97316', NS:'#F97316', PE:'#F97316', NL:'#F97316' }
}

/* Per-industry multipliers — detail-card numbers track the centred NOC (simulated). */
export const IND_SHAPE = {
  management: { jobs: .90, med: 1.35, out: .9 }, business: { jobs: 1.10, med: 1.00, out: 1.0 },
  science:    { jobs: .95, med: 1.25, out: 1.5 }, health:   { jobs: 1.20, med: 1.10, out: 1.3 },
  education:  { jobs: 1.05, med: .95, out: .95 }, art:      { jobs: .60, med: .75, out: .6 },
  sales:      { jobs: 1.35, med: .65, out: .8 },  trades:   { jobs: 1.10, med: .90, out: .9 },
  resources:  { jobs: .55, med: 1.15, out: .5 },  factory:  { jobs: .70, med: .90, out: .7 }
}

/* Big provinces first, so ties in ratings resolve to the most meaningful one. */
export const PROV_PRIORITY = ['ON', 'QC', 'BC', 'AB', 'SK', 'MB', 'NS', 'NB', 'NL', 'PE', 'YT', 'NT', 'NU']

/* Real-photo backdrops behind the map — Canada default, or the selected province. */
export const PROV_PHOTOS = {
  CA: 'ca-maple.jpg',
  YT: 'yt-aurora.jpg', NT: 'nt-aurora.jpg', NU: 'nu-tundra.jpg',
  BC: 'bc-vancouver.jpg', AB: 'ab-banff.jpg', SK: 'sk-wheat.jpg',
  MB: 'mb-polarbear.jpg', ON: 'on-toronto.jpg', QC: 'qc-quebec.jpg',
  NB: 'nb-fundy.jpg', NS: 'ns-lighthouse.jpg', PE: 'pe-coast.jpg',
  NL: 'nl-iceberg.jpg'
}

/* Per-province labour-market detail (shown in the detail card on click). */
export const PROV_DETAILS = {
  YT: { nameEn:'Yukon', nameFr:'Yukon', jobs:'1,020', med:'$36.40', outlook:'+4%',
    descEn:'A small, stable labour market anchored by public services and tourism.',
    descFr:'Un marché du travail petit et stable, porté par les services publics et le tourisme.' },
  NT: { nameEn:'Northwest Territories', nameFr:'Territoires du Nord-Ouest', jobs:'1,150', med:'$39.80', outlook:'+3%',
    descEn:'Government, mining and northern services drive steady hiring.',
    descFr:'Les services gouvernementaux, miniers et nordiques stimulent l\'embauche.' },
  NU: { nameEn:'Nunavut', nameFr:'Nunavut', jobs:'880', med:'$37.20', outlook:'+3%',
    descEn:'Growth is concentrated in public administration and community services.',
    descFr:'La croissance se concentre dans l\'administration publique et les services communautaires.' },
  BC: { nameEn:'British Columbia', nameFr:'Colombie-Britannique', jobs:'19,340', med:'$34.60', outlook:'+8%',
    descEn:'Tech, health and construction keep demand healthy across the province.',
    descFr:'La technologie, la santé et la construction maintiennent une forte demande.' },
  AB: { nameEn:'Alberta', nameFr:'Alberta', jobs:'15,870', med:'$36.10', outlook:'+6%',
    descEn:'Energy, engineering and services rebound as commodity prices firm.',
    descFr:'L\'énergie, l\'ingénierie et les services rebondissent à mesure que les prix des matières premières se consolident.' },
  SK: { nameEn:'Saskatchewan', nameFr:'Saskatchewan', jobs:'5,640', med:'$30.20', outlook:'+3%',
    descEn:'Agriculture and mining anchor a modest but steady outlook.',
    descFr:'L\'agriculture et les mines soutiennent des perspectives modestes mais stables.' },
  MB: { nameEn:'Manitoba', nameFr:'Manitoba', jobs:'6,180', med:'$29.90', outlook:'+4%',
    descEn:'Manufacturing and health lead a balanced labour market.',
    descFr:'La fabrication et la santé mènent un marché du travail équilibré.' },
  ON: { nameEn:'Ontario', nameFr:'Ontario', jobs:'48,920', med:'$34.80', outlook:'+9%',
    descEn:'Broad-based demand across tech, finance, health and trades.',
    descFr:'Une demande généralisée en technologie, finance, santé et métiers.' },
  QC: { nameEn:'Quebec', nameFr:'Québec', jobs:'26,430', med:'$33.40', outlook:'+7%',
    descEn:'Aerospace, AI and health support a resilient outlook.',
    descFr:'L\'aérospatiale, l\'IA et la santé soutiennent des perspectives résilientes.' },
  NB: { nameEn:'New Brunswick', nameFr:'Nouveau-Brunswick', jobs:'3,520', med:'$28.10', outlook:'+2%',
    descEn:'Growth is slower; health and IT remain the bright spots.',
    descFr:'La croissance est plus lente; la santé et les TI demeurent les points forts.' },
  NS: { nameEn:'Nova Scotia', nameFr:'Nouvelle-Écosse', jobs:'3,880', med:'$28.60', outlook:'+2%',
    descEn:'Defence, health and ocean tech offer pockets of demand.',
    descFr:'La défense, la santé et les technologies océaniques offrent des poches de demande.' },
  PE: { nameEn:'Prince Edward Island', nameFr:'Île-du-Prince-Édouard', jobs:'760', med:'$27.40', outlook:'+3%',
    descEn:'A small market; tourism and agriculture hold steady.',
    descFr:'Un petit marché; le tourisme et l\'agriculture restent stables.' },
  NL: { nameEn:'Newfoundland & Labrador', nameFr:'Terre-Neuve-et-Labrador', jobs:'2,140', med:'$30.80', outlook:'+1%',
    descEn:'Energy projects and health care temper a soft outlook.',
    descFr:'Les projets énergétiques et les soins de santé tempèrent des perspectives faibles.' }
}

/* Industry-scaled stats for one province, derived from the base table (simulated). */
export function provStats(indKey, code) {
  const base = PROV_DETAILS[code] || PROV_DETAILS.ON
  const f = IND_SHAPE[indKey] || IND_SHAPE.management
  const jobs = Math.round(parseFloat(base.jobs.replace(/,/g, '')) * f.jobs).toLocaleString('en-US')
  const med = '$' + (parseFloat(base.med.slice(1)) * f.med).toFixed(2)
  const o = parseFloat(base.outlook) * f.out
  const out = (o >= 0 ? '+' : '') + Math.round(o) + '%'
  return { jobs, med, outlook: out }
}

/** Highest-rated province under a given NOC's ratings. */
export function topProvince(ratings) {
  let best = null, bestOrder = -1
  for (const code of PROV_PRIORITY) {
    const r = ratingOf(ratings[code] || '#64748B')
    if (r.order > bestOrder) { bestOrder = r.order; best = code }
  }
  return best
}

/* Inline SVG icon set for the ten NOC groups (24×24, currentColor strokes). */
export const ICONS = {
  management: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="7" r="3.5"/><path d="M2.5 20c.8-4 3.4-6 6.5-6s5.7 2 6.5 6"/><path d="M15.5 4.5a3.5 3.5 0 0 1 0 5"/><path d="M17.5 14.5c2.4.8 3.7 2.6 4 5.5"/></svg>',
  business: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/></svg>',
  science: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4.5 4.5 0 0 0-6.2 6.2l8.1 8.1a2.2 2.2 0 0 0 3.1-3.1l-5-5"/><circle cx="10.5" cy="10.5" r="1.2" fill="currentColor" stroke="none"/></svg>',
  health: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"/></svg>',
  education: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 9L12 4l9.5 5L12 14z"/><path d="M6.5 11.5V17c0 1.4 2.5 2.6 5.5 2.6s5.5-1.2 5.5-2.6v-5.5"/></svg>',
  art: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="8" cy="10" r="1.1" fill="currentColor" stroke="none"/><circle cx="12" cy="7.5" r="1.1" fill="currentColor" stroke="none"/><circle cx="16" cy="10" r="1.1" fill="currentColor" stroke="none"/><path d="M12 21c0-2 1.2-3 2.8-3H16a2.4 2.4 0 0 0 0-4.8H12"/></svg>',
  sales: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 8h13l-1.2 12a2 2 0 0 1-2 1.8H8.7a2 2 0 0 1-2-1.8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  trades: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/></svg>',
  resources: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5l7.5 9h-4.5l4 5.5h-5v4.5h-4V17H5l4-5.5H4.5z"/></svg>',
  factory: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V9l5 3V9l5 3V9l5 3V21z"/><path d="M3 21h18"/></svg>'
}

/* The ten NOC groups (NOC 0-9). `on` holds the Ontario snapshot; the detail
   card uses provStats() scaling so numbers follow the centred NOC. */
export const INDUSTRIES = [
  { key:'management', nameEn:'Management', nameFr:'Gestion', codeEn:'NOC 0 · Management', codeFr:'NOC 0 · Gestion',
    prov:'7/14', jobs:'28,140', med:'$58.20', rateEn:'Good', rateFr:'Bon', color:'#57C7FF', stars:4,
    tagEn:'MANAGEMENT · NOC 0', tagFr:'GESTION · NOC 0', photo:'ind-management.jpg',
    on:{ jobs:'6,880', med:'$59.40', outlook:'+7%', rateEn:'Good', rateFr:'Bon', stars:4,
      descEn:'Leadership demand tracks the broader economy, with steady openings across public and private administration.',
      descFr:'La demande de gestionnaires suit l\'économie générale, avec des postes stables dans l\'administration publique et privée.' } },
  { key:'business', nameEn:'Business & Finance', nameFr:'Affaires et finance', codeEn:'NOC 1 · Business & Finance', codeFr:'NOC 1 · Affaires et finance',
    prov:'9/14', jobs:'52,180', med:'$34.10', rateEn:'Fair', rateFr:'Moyen', color:'#F5B34C', stars:3,
    tagEn:'BUSINESS · NOC 1', tagFr:'AFFAIRES · NOC 1', photo:'ind-business.jpg',
    on:{ jobs:'11,940', med:'$35.20', outlook:'+9%', rateEn:'Fair', rateFr:'Moyen', stars:3,
      descEn:'Steady demand across professional services and finance, with growth in data and analyst roles.',
      descFr:'Demande stable dans les services professionnels et la finance, avec croissance des rôles de données et d\'analyse.' } },
  { key:'science', nameEn:'Natural & Applied Sciences', nameFr:'Sciences naturelles et appliquées', codeEn:'NOC 2 · Sciences', codeFr:'NOC 2 · Sciences',
    prov:'7/14', jobs:'38,104', med:'$42.80', rateEn:'Good', rateFr:'Bon', color:'#3ECF8E', stars:4,
    tagEn:'SCIENCES · NOC 2', tagFr:'SCIENCES · NOC 2', photo:'ind-science.jpg',
    on:{ jobs:'9,410', med:'$43.10', outlook:'+14%', rateEn:'Good', rateFr:'Bon', stars:4,
      descEn:'Engineering and tech roles keep expanding as Ontario invests in clean energy and R&D.',
      descFr:'L\'ingénierie et la technologie continuent de croître alors que l\'Ontario investit dans l\'énergie propre et la R-D.' } },
  { key:'health', nameEn:'Health', nameFr:'Santé', codeEn:'NOC 3 · Health', codeFr:'NOC 3 · Santé',
    prov:'8/14', jobs:'45,230', med:'$38.60', rateEn:'Good', rateFr:'Bon', color:'#3ECF8E', stars:5,
    tagEn:'HEALTH · NOC 3', tagFr:'SANTÉ · NOC 3', photo:'ind-health.jpg',
    on:{ jobs:'12,480', med:'$39.20', outlook:'+11%', rateEn:'Very Good', rateFr:'Très bon', stars:5,
      descEn:'Strong demand expected over the next 3 years, driven by an aging population and steady sector growth.',
      descFr:'Forte demande attendue au cours des 3 prochaines années, portée par le vieillissement de la population.' } },
  { key:'education', nameEn:'Education, Law & Social', nameFr:'Éducation, droit et services sociaux', codeEn:'NOC 4 · Education', codeFr:'NOC 4 · Éducation',
    prov:'8/14', jobs:'34,520', med:'$33.70', rateEn:'Good', rateFr:'Bon', color:'#57C7FF', stars:4,
    tagEn:'EDUCATION · NOC 4', tagFr:'ÉDUCATION · NOC 4', photo:'ind-education.jpg',
    on:{ jobs:'8,640', med:'$34.30', outlook:'+8%', rateEn:'Good', rateFr:'Bon', stars:4,
      descEn:'Schools and social services keep hiring; demand for early-childhood educators stays strong.',
      descFr:'Les écoles et les services sociaux embauchent; la demande d\'éducateurs de la petite enfance reste forte.' } },
  { key:'art', nameEn:'Art, Culture & Sport', nameFr:'Arts, culture et sports', codeEn:'NOC 5 · Art & Culture', codeFr:'NOC 5 · Arts et culture',
    prov:'3/14', jobs:'12,760', med:'$25.10', rateEn:'Limited', rateFr:'Limité', color:'#C084FC', stars:2,
    tagEn:'ART & CULTURE · NOC 5', tagFr:'ARTS ET CULTURE · NOC 5', photo:'ind-art.jpg',
    on:{ jobs:'2,910', med:'$25.80', outlook:'+2%', rateEn:'Limited', rateFr:'Limité', stars:2,
      descEn:'Recovery is gradual; competition remains high for creative and performance roles.',
      descFr:'La reprise est graduelle; la concurrence demeure forte pour les rôles créatifs et de spectacle.' } },
  { key:'sales', nameEn:'Sales & Service', nameFr:'Vente et services', codeEn:'NOC 6 · Sales & Service', codeFr:'NOC 6 · Vente et services',
    prov:'5/14', jobs:'61,430', med:'$21.80', rateEn:'Fair', rateFr:'Moyen', color:'#F5B34C', stars:3,
    tagEn:'SALES & SERVICE · NOC 6', tagFr:'VENTE ET SERVICES · NOC 6', photo:'ind-sales.jpg',
    on:{ jobs:'13,720', med:'$22.40', outlook:'+5%', rateEn:'Fair', rateFr:'Moyen', stars:3,
      descEn:'Large volume of openings, mostly in retail and hospitality, with steady turnover.',
      descFr:'Grand volume d\'offres, surtout dans le commerce de détail et l\'hôtellerie, avec un roulement constant.' } },
  { key:'trades', nameEn:'Trades & Transport', nameFr:'Métiers et transport', codeEn:'NOC 7 · Trades', codeFr:'NOC 7 · Métiers',
    prov:'6/14', jobs:'41,270', med:'$31.40', rateEn:'Fair', rateFr:'Moyen', color:'#F97316', stars:3,
    tagEn:'TRADES · NOC 7', tagFr:'MÉTIERS · NOC 7', photo:'ind-trades.jpg',
    on:{ jobs:'10,870', med:'$32.10', outlook:'+6%', rateEn:'Fair', rateFr:'Moyen', stars:3,
      descEn:'Construction and logistics hiring stays solid, buoyed by housing and infrastructure pipelines.',
      descFr:'L\'embauche dans la construction et la logistique reste solide, portée par le logement et les infrastructures.' } },
  { key:'resources', nameEn:'Natural Resources & Agriculture', nameFr:'Ressources naturelles et agriculture', codeEn:'NOC 8 · Resources', codeFr:'NOC 8 · Ressources',
    prov:'4/14', jobs:'18,240', med:'$30.60', rateEn:'Limited', rateFr:'Limité', color:'#A3E635', stars:2,
    tagEn:'RESOURCES · NOC 8', tagFr:'RESSOURCES · NOC 8', photo:'ind-resources.jpg',
    on:{ jobs:'3,860', med:'$31.20', outlook:'+1%', rateEn:'Limited', rateFr:'Limité', stars:2,
      descEn:'Commodity prices weigh on hiring; agriculture shows pockets of steady demand.',
      descFr:'Les prix des matières premières pèsent sur l\'embauche; l\'agriculture montre des poches de demande stable.' } },
  { key:'factory', nameEn:'Manufacturing & Utilities', nameFr:'Fabrication et services publics', codeEn:'NOC 9 · Manufacturing', codeFr:'NOC 9 · Fabrication',
    prov:'4/14', jobs:'19,860', med:'$29.70', rateEn:'Limited', rateFr:'Limité', color:'#FB923C', stars:2,
    tagEn:'MANUFACTURING · NOC 9', tagFr:'FABRICATION · NOC 9', photo:'ind-factory.jpg',
    on:{ jobs:'5,240', med:'$30.40', outlook:'+3%', rateEn:'Limited', rateFr:'Limité', stars:2,
      descEn:'Mixed outlook as auto electrification offsets softer consumer demand.',
      descFr:'Perspectives mitigées alors que l\'électrification automobile compense la demande des consommateurs.' } }
]

/** Lighten (amt>0) or darken (amt<0) a hex colour — unified light source. */
export function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16)
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  if (amt < 0) {
    r = Math.max(0, Math.round(r * (1 + amt)))
    g = Math.max(0, Math.round(g * (1 + amt)))
    b = Math.max(0, Math.round(b * (1 + amt)))
  } else {
    r = Math.min(255, Math.round(r + (255 - r) * amt))
    g = Math.min(255, Math.round(g + (255 - g) * amt))
    b = Math.min(255, Math.round(b + (255 - b) * amt))
  }
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

/** Base path prefix so images resolve on GitHub Pages sub-path hosting too. */
export const BASE_URL = import.meta.env.BASE_URL || '/'
export const img = (name) => `${BASE_URL}images/${name}`
