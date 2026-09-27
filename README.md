# Afghan Product Records

A daily product purchase recording app for Afghanistan, with all prices in Afghan Afghani (؋).

## Features

- **Daily records** — Each day has its own product list with auto-calculated totals
- **Reusable products** — Save a product once and select it again on future days
- **Search** — Search across all saved products and past records
- **History** — Browse records grouped by month and year
- **Backup & restore** — Export/import data as JSON
- **Offline** — Works as a PWA after first load
- **Responsive** — Optimized for iPhone and desktop

## Deployment to GitHub Pages

1. Push this repository to GitHub
2. Go to **Settings > Pages**
3. Under **Source**, select **GitHub Actions**
4. The included workflow (`.github/workflows/deploy.yml`) will build and deploy automatically on every push to `main`

The site will be available at `https://<your-username>.github.io/<repo-name>/`.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The build output is in the `dist/` folder.
