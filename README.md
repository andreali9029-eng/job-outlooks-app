# Canada Job Outlooks 🇨🇦

A bilingual (**English / French**) PWA that turns the Job Bank *Explore job outlooks* data into an interactive employment-guidance tool for Canadians.

Search any of 500+ occupations (NOC 2021) to see 5-star outlook ratings, wages, provincial outlooks on a real Canada map, labour-market trends, and live job-postings counts — all in one place.

## Features

- 🔎 **Occupation search** — 500+ NOC 2021 occupations, bilingual titles, 5-star outlook ratings (Very Good → Very Limited)
- 🗺️ **Canada outlook map** — per-province/territory outlook with median wages (real Statistics Canada Lambert projection)
- 📈 **Labour market trends** — national & provincial unemployment curves (15y), top-industry employment (10y), highest-unemployment occupations (Statistics Canada LFS)
- 💼 **Daily job postings** — live Job Bank posting counts per occupation & province, refreshed daily by an automated task; "postings over time" charts as history accumulates
- ⚖️ **Compare** — side-by-side outlook & wages for 2 occupations across 13 provinces
- 💰 **Wages** — median / hourly / annual salary data, best-paying-province summary
- 🌐 **Fully bilingual** EN/FR, **PWA** (installable, offline-capable), mobile-responsive with swipe navigation

## Tech stack

- **Frontend**: Vite 6 + React 18, hand-rolled zero-dependency SVG charts, workbox PWA (`generateSW`)
- **Data pipelines**: Python (pandas) scripts under `scripts/`
- **Maps**: `@svg-maps/canada.lambert-projection`

## Getting started

```bash
npm install
npm run dev        # local dev server → http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build
```

## Data sources & freshness

| Data | Source | Update frequency |
|---|---|---|
| Outlook ratings (2025-2027) | Job Bank 3-year Employment Outlooks (open.canada.ca) | Annual (published ~December) |
| Wages (2025) | Job Bank wages dataset | Annual |
| Unemployment rate | Statistics Canada table **14100287** (LFS) | Monthly |
| Industry employment | Statistics Canada table **14100201** | Monthly |
| Occupation unemployment | Statistics Canada table **14100416** | Annual |
| Live posting counts | Job Bank job search | **Daily snapshot** (scheduled task) |

## Automation (Windows Task Scheduler)

| Task | Schedule | What it does |
|---|---|---|
| `JobBank JobCount Daily` | Daily 08:00 | Scrape postings for 14 hot occupations × 14 regions → refresh front-end data + history |
| `JobBank StatCan Auto` | Daily 08:30 | HEAD-check StatCan tables (download + rebuild only when updated; 28-day force fallback); auto-detects new Job Bank outlook releases each year |

> **Note (2026-10-21):** Statistics Canada's servers were down that day. The front-end trend JSONs were unaffected; once StatCan is back, the scheduled task automatically re-downloads and restores the source files. Pipelines validate downloaded files before ever replacing existing data.

See **[README-DATA.md](README-DATA.md)** for the full data-pipeline maintenance guide.

## Project structure

```
job-outlooks-app/
├── src/                  # React app (App.jsx, TrendChart.jsx, canadaPaths.js, styles)
├── public/
│   ├── data/
│   │   ├── occupations.json          # 516-occupation index (NOC, bilingual titles)
│   │   ├── occ/NOC_XXXXX.json        # per-occupation details (ratings, wages, trends)
│   │   └── trends/                   # unemployment / industry / jobcounts JSONs
│   └── icon-192.png, icon-512.png    # PWA icons
├── scripts/              # Python data pipelines (process, build, scrape, update)
├── data/                 # raw sources & snapshots (gitignored, re-downloadable)
├── jobcount_daily.ps1    # daily postings task script
├── monthly_update.ps1    # StatCan/outlook monthly task script
└── README-DATA.md        # data pipeline documentation
```

## License

Private — all rights reserved.
