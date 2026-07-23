# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page React app: a "days since last work interruption" tracker, styled as a
horror-flavored "kill list" board (design direction `3a` from a Claude-generated design doc —
see `Szabadsag Tracker Iranyok - Standalone.html` in the repo root, a bundled Claude Artifact
export containing several rejected directions plus the chosen one). All UI copy is in
Hungarian. There is no backend — it's a static Vite/React build with client-side persistence
only.

## Commands

```
npm run dev       # start Vite dev server with HMR
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint (see .oxlintrc.json — react + oxc plugins)
```

There is no test suite/framework configured in this repo. Verification is build + lint +
driving the app in an actual (headless) browser.

## Architecture

The app is rendered by `src/main.jsx` from `src/szabi-monitor/index.jsx` (`SzabiMonitor`),
which is decomposed into layers under `src/szabi-monitor/`:

- `constants.js` — `KEY` (storage key), `TYPES` (interruption categories: `id`, `label`
  (legacy, unused for display), `pick` (type-grid button text, e.g. `"a PROD"`), `short`
  (compact label used in the KILL LIST / "fő fegyvernem" stat, e.g. `"PROD"`), `min` (default
  minutes logged). Extend this array to add a new interruption type.
- `utils.js` — pure date/format helpers: `todayISO`, `addDays`, `startOfDay`, `fmtDate`,
  `relLogDate` (renders a KILL LIST timestamp as `"ma HH:MM"` / `"tegn. HH:MM"` / `"N napja"`).
- `hooks/usePersistentState.js` — round-trips state through `window.storage.get/set` under
  key `szabi-monitor:v1`. `window.storage` is not a browser API — it's polyfilled in
  `src/storage-shim.js` (imported for its side effect in `main.jsx`, before the component
  renders) as a thin wrapper over `localStorage`. The load effect sets `storageOk = false`
  if `window.storage` is missing entirely; the save effect skips the very first render
  (`firstRun` ref) so it doesn't clobber storage with the default state before load completes.
- `hooks/useNow.js` — 1s `setInterval` tick.
- `hooks/useMonitorStats.js` — all derived data via `useMemo`: current streak, all-time
  record streak, per-day heatmap buckets (`dayBuckets`), `offenders` (who causes the most
  interruptions — also feeds the `<datalist>` autocomplete used in the KILL LIST inline
  editor), `topType` (most frequent interruption type, by count), weekly average. There is
  **no verdict/judgment tier** — the chosen design direction explicitly drops that ("jump
  scare és verdikt-sor nélkül").
- `components/*.jsx` — presentational, prop-driven, one per section: `Header`,
  `SettingsPanel` (date-range config), `CounterBoard` (the big streak number + embeds
  `ProgressBar`), `IncidentForm` (the "Elkövetés módja" type grid — **tap-to-log**: clicking
  a type button immediately logs an incident with that type's default minutes, no separate
  submit step), `StatsGrid`, `Heatmap` ("42 ÉJSZAKA"), `IncidentLog` (the "KILL LIST" —
  shows the 3 most recent entries collapsed with a "+N korábbi bejegyzés" expander; clicking
  a row opens an inline editor to set `who`/`min`/`note` after the fact, since tap-to-log
  doesn't collect those up front).
- `index.jsx` — thin container: wires the hooks, holds only UI-local state (`flash`,
  `showSettings`), defines actions (`log(typeId)`, `updateIncident(id, patch)`, `remove`,
  `resetAll`, `setStart`/`setEnd`), and renders `Header` + `SettingsPanel` outside a single
  `.sm-card` wrapper that contains `CounterBoard` → `IncidentForm` → `StatsGrid` → `Heatmap`
  → `IncidentLog` (separated by `.sm-divider`s) — matching the design's "one continuous
  panel" layout rather than separately-boxed sections.
- `styles.css` — all styling lives here as `:root` CSS custom properties (`--sm-*`, the
  horror palette: `--sm-void`/`--sm-card` backgrounds, `--sm-blood`/`--sm-blood-dark` red
  accents, `--sm-bone` text, `--sm-line*` dashed borders) plus one class per element.
  Components only ever set `className`; dynamic/data-driven styling (progress width, heatmap
  cell severity, the type-grid's critical/PROD variant) is expressed as class-name variants,
  not inline styles, so a future re-skin only has to touch this file + component markup, not
  the hooks/logic layer.

`App.jsx`, `App.css`, `index.css`, and the `assets/{react.svg,vite.svg,hero.png}` files are
leftover `npm create vite@latest` scaffolding, **not imported by the running app** —
`index.css` isn't imported anywhere, and `App.jsx`/`App.css` only import each other. Don't
assume changes to those files affect the live app; when in doubt, trace imports from
`index.html` → `src/main.jsx`.

No routing, no state-management library, and no network calls other than the storage shim —
it's fully client-local.
