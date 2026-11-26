# Yaks Admin Panel

A responsive administration dashboard built with React, Vite, React Router, Tailwind CSS, Lucide, and Recharts. The current experience uses local sample data; actions that would require a backend provide local feedback or export CSV files rather than sending API requests.

## Development

```sh
npm install
npm run dev
```

Run `npm run lint` for Oxlint and `npm run build` for a production build.

## Structure

- `src/components/` — application shell, shared UI, and toast context
- `src/data/dashboard.js` — sample metrics and workspace records
- `src/pages/` — dashboard and routed workspace pages
- `src/utils/csv.js` — local CSV export helper
- `src/App.css` and `src/index.css` — shared visual system and responsive styling

Workspace records are intentionally local and in-memory. Connect API-backed data and mutations through a service layer when a backend is available.
