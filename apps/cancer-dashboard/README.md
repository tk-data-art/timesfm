# Global Cancer Dashboard

An interactive front-end for exploring curated global cancer statistics from official sources.

## Features

- World choropleth map with hover summaries and click-to-drill country selection.
- Country KPI cards for total cases, deaths, survival rate, and top cancers.
- Trend chart for bundled yearly snapshots.
- Region/state breakdowns for countries where official subnational data is bundled.
- Filters for cancer type, search, year, and gender-oriented exploration.
- Top-10 ranking list for rapid navigation.

## Tech stack

- Modern static front-end with vanilla ES modules
- Plotly.js CDN for choropleth and chart rendering
- Custom responsive CSS inspired by glassmorphism dashboards

## Run locally

```bash
cd apps/cancer-dashboard
python -m http.server 4173
```

Then open <http://localhost:4173>.

## Data sources

This dashboard bundles a curated dataset in `data.js` built from the most recent official releases available during development. Each country record includes direct source links.

Primary sources referenced in the dataset:

- WHO cancer fact sheet: <https://www.who.int/news-room/fact-sheets/detail/cancer>
- IARC / Global Cancer Observatory (GLOBOCAN 2022 country fact sheets): <https://gco.iarc.who.int/>
- CDC United States Cancer Statistics: <https://www.cdc.gov/united-states-cancer-statistics/>
- India National Cancer Registry Programme: <https://ncdirindia.org/All_Reports/Report_2020/default.aspx>
- Australian Institute of Health and Welfare cancer data: <https://www.aihw.gov.au/reports/cancer/cancer-data-in-australia>
- South Africa National Cancer Registry: <https://www.nicd.ac.za/centres/national-cancer-registry/>
- Cancer Research UK statistics: <https://www.cancerresearchuk.org/health-professional/cancer-statistics>

## Notes on data quality

- The app degrades gracefully for countries without a bundled record.
- Regional drill-down is only shown where an official subnational snapshot is included.
- The `gender` filter currently acts as an exploratory UI control because not every bundled source publishes sex-segmented values in a consistent shape.
- Extend `data.js` with additional countries or years to deepen coverage.


## Deploy on Vercel

### Option A: Deploy from the Vercel Dashboard (recommended)

1. Push this repository to GitHub.
2. In Vercel, click **Add New Project** and import the GitHub repo.
3. In **Project Settings → Build and Deployment** set:
   - **Root Directory**: `apps/cancer-dashboard`
   - **Framework Preset**: `Other`
   - **Build Command**: *(leave empty)*
   - **Output Directory**: *(leave empty)*
4. Click **Deploy**.

Because this app is static (`index.html`, `app.js`, `data.js`, `styles.css`), no build step is required.

### Option B: Deploy with Vercel CLI

```bash
npm i -g vercel
cd apps/cancer-dashboard
vercel
```

For production promotion:

```bash
vercel --prod
```

### Included Vercel configuration

This folder includes `vercel.json` with:
- clean URLs
- security headers
- immutable cache headers for `.js` / `.css`
- revalidation-friendly cache header for `.html`

> If you deploy from the repository root instead of setting `apps/cancer-dashboard` as root directory, Vercel will deploy the wrong folder.
