# Focus to Flora

Focus to Flora is a fully static Vite + React productivity app for GitHub Pages. It lets you choose a focus duration, tag, plant type, and note, then records completed work as original CSS plants in a personal browser garden.

The app has no backend, login, Firebase, Supabase, database, paid service, or server API. All data is stored locally in the browser with `localStorage`.

## Features

- Focus timer with 25, 50, 60, and 90 minute presets plus custom durations
- Pause, resume, cancel with confirmation, and manual complete controls
- Completed sessions become visual plants in the garden
- Cancelled sessions are recorded and shown distinctly in history
- Session history with delete and clear-all controls
- Stats for today, week, month, all time, completion rate, tag totals, and average session length
- Default and custom tags
- Dark, light, forest, minimal, and lab notebook themes
- JSON backup export and validated JSON restore
- Internal React state navigation for GitHub Pages compatibility

## Local Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The app development entry is `app.html`, so if the browser does not open automatically, visit the `/app.html` path shown by Vite.

Build the production site:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## GitHub Pages Deployment

This project is configured for a repository named `focus-to-flora`.

In `vite.config.js`, the deployment base is:

```js
base: '/focus-to-flora/',
```

If you rename the repository, change that value to:

```js
base: '/your-repository-name/',
```

Then build the app:

```bash
npm run build
```

The included GitHub Actions workflow builds the app and publishes the generated `dist/` folder. In the GitHub repository settings, set **Pages** to deploy from **GitHub Actions**.

The build script also syncs the built `index.html` and `assets/` into the repository root. This keeps the site working even if GitHub Pages is still configured to deploy from the `main` branch root.

## localStorage Data

Focus to Flora stores data under these browser keys:

- `focusToFlora.sessions`: completed and cancelled session records
- `focusToFlora.tags`: default and custom tags
- `focusToFlora.theme`: selected theme

Session records include:

- `id`
- `startedAt`
- `endedAt`
- `plannedMinutes`
- `actualMinutes`
- `status`
- `tag`
- `note`
- `plantType`
- `createdAt`

Data stays in the current browser profile unless you export it or clear site data.

## Backup and Import

Open Settings and use **Export JSON** to download a backup containing sessions, tags, and theme.

Use **Import JSON** to restore a backup. The app validates the file shape before import and asks for confirmation before replacing current browser data.
