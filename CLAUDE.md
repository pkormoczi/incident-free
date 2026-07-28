# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page React app: a "days since last work interruption" tracker, styled as a
horror-flavored "kill list" board (design direction `3a` from a Claude-generated design doc —
originally `Szabadsag Tracker Iranyok - Standalone.html` in the repo root, a bundled Claude
Artifact export containing several rejected directions plus the chosen one; superseded by
`Incident-Monitor - Standalone.html`, a later export of the same direction with a refined
palette and three decorative images — the large skull next to the counter, the blood-moon/
forest heatmap background, and the small skull icon in the stats grid). Both exports are
gitignored (large, one-off bundles, not app source) — treat the live component tree below as
the source of truth for current styling, not the HTML exports. All UI copy is in Hungarian.
There is no backend — it's a static Vite/React build with client-side persistence only.

## Commands

```
npm run dev       # start Vite dev server with HMR
npm run build     # production build to dist/
npm run preview   # serve the production build locally
npm run lint      # oxlint (see .oxlintrc.json — react + oxc plugins)
npm run verify    # Playwright smoke test, see below
```

There is no assertion-based test suite/framework in this repo. `npm run verify`
(`scripts/verify-visual.mjs`) is a standalone Playwright script — not `@playwright/test`, no
runner/reporter — that boots Vite's dev server in-process (`createServer`/`server.listen()`,
so there's no child process to leak or clean up), drives headless Chromium through the
first-run intro modal, one tap-to-log round trip, and a KILL LIST inline `ts` edit, fails on
any console error, and saves screenshots to `verify-shots/` (gitignored) for manual visual
review. It is **not** wired into
CI — `.github/workflows/deploy.yml` only lints and builds; run `npm run verify` manually after
UI/styling changes.

`.github/workflows/deploy.yml` lints, builds, and deploys `dist/` to GitHub Pages on every
push to `main` (GitHub Actions as the Pages build source — no `gh-pages` branch involved).
Because Pages serves this as a project site under `/incident-free/`, `vite.config.js` sets
`base` to that path in production builds only (`mode === 'production'`), so `npm run dev`
is unaffected and still serves from `/`.

## Architecture

The app is rendered by `src/main.jsx` from `src/incident-monitor/index.jsx` (`IncidentMonitor`),
which is decomposed into layers under `src/incident-monitor/`:

- `constants.js` — `KEY` (storage key), `TYPES` (interruption categories: `id`, `label`
  (legacy, unused for display), `pick` (type-grid button text, e.g. `"a PROD"`), `short`
  (compact label used in the KILL LIST / "fő fegyvernem" stat, e.g. `"PROD"`), `min` (default
  minutes logged). Extend this array to add a new interruption type.
- `utils.js` — pure date/format helpers (`todayISO`, `addDays`, `startOfDay`, `fmtDate`,
  `relLogDate`, which renders a KILL LIST timestamp as `"ma HH:MM"` / `"tegn. HH:MM"` / a
  `fmtDate` fallback like `"júl. 22. 14:30"` for anything older — or in the future, since the
  KILL LIST row editor now allows setting a `ts` anywhere in the configured period) plus the
  JSON boundary: `validateImport`/`parseImport` inbound, `tsToISO` outbound. **Timestamp
  contract:** an incident's `ts` is epoch-ms *inside* the app (React state and the
  `localStorage` blob — all date math is numeric) but an ISO-8601 string *in JSON* (export
  output, import input, `public/me.json`), matching the top-level `exportedAt`. Conversion
  happens only at the two choke points: `buildExport` in `index.jsx` (ms→ISO) and
  `validateImport` (ISO→ms). Import accepts ISO only — a numeric `ts` is rejected with an
  error rather than migrated, so exports predating this change cannot be re-imported.
  `localStorage` is read back raw (`usePersistentState` does an unvalidated `JSON.parse`,
  never through `validateImport`), which is why the persisted form must stay numeric.
  Separately, `tsToLocalInput`/`localInputToTs` convert ms ↔ the *local*-time string a
  `<input type="datetime-local">` reads/writes (no timezone suffix) — this is a different
  boundary from the JSON one above (local time, not UTC ISO), used only by `IncidentLog`'s
  inline row editor.
- `hooks/usePersistentState.js` — round-trips state through `window.storage.get/set` under
  key `incident-monitor:v1`. `window.storage` is not a browser API — it's polyfilled in
  `src/storage-shim.js` (imported for its side effect in `main.jsx`, before the component
  renders) as a thin wrapper over `localStorage`. The load effect sets `storageOk = false`
  if `window.storage` is missing entirely; the save effect skips the very first render
  (`firstRun` ref) so it doesn't clobber storage with the default state before load completes.
- `hooks/useNow.js` — 1s `setInterval` tick.
- `hooks/useMonitorStats.js` — all derived data via `useMemo`, computed from a single
  `windowedIncidents` filter (incidents whose `ts` falls within the configured
  Első/Utolsó nap, day-granular, inclusive both ends) — every returned value (`incidents`,
  i.e. the KILL LIST; the current streak, which — like the record streak — freezes at
  `min(now, endMs)` rather than counting past a finished period; the record streak, which
  is therefore the longest gap *within the configured period*, not an all-time record; `lostMin`;
  `dayBuckets`; `offenders`; `topType`; `perWeek`) is derived from that one filtered array,
  so none of them can disagree with another over what counts. Incidents outside the
  configured window are never deleted — they stay in `state`/localStorage and reappear the
  moment the window is widened to include them — they're just invisible everywhere in this
  read layer, including the KILL LIST and the `offenders`-fed `<datalist>` autocomplete in
  `LogModal` (the pre-log editor shown when tapping a type, not the KILL LIST's own inline
  row editor — that one has plain, non-autocompleting `<input>`s for `who`/`min`/`note`, plus
  a `<input type="datetime-local">` for `ts`, bounded by `min`/`max` attributes tied to the
  same Első/Utolsó nap config — editing a row's `ts` to a value outside that range disables
  Save with an inline error rather than silently producing an entry that would vanish from
  every filtered view on save). The write paths
  (`confirmLog`/`updateIncident`/`remove`/`importData`/`buildExport` in `index.jsx`)
  intentionally keep operating on the raw, unfiltered `state.incidents` — export/import is
  a full backup mechanism, not a mirror of the current view; `incidentCount` for the stat
  tile is just `incidents.length` at the `index.jsx` call site, not a separate hook field.
  `perWeek` ("heti átlag") divides the windowed count by the number of *started* weeks
  (`Math.ceil(elapsedDays / 7)`); deliberately not an extrapolated rate, so one incident on
  day 2 reads `1.0/hét`, not a projected `3.5/hét`. There is
  **no verdict/judgment tier** — the chosen design direction explicitly drops that
  ("jump scare és verdikt-sor nélkül").
- `components/*.jsx` — presentational, prop-driven, one per section: `Header`,
  `SettingsPanel` (date-range config), `CounterBoard` (the big streak number + embeds
  `ProgressBar`), `IncidentForm` (the "Elkövetés módja" type grid — **tap-to-log**: clicking
  a type button immediately logs an incident with that type's default minutes, no separate
  submit step), `StatsGrid` (its internal `Stat` component takes an optional `unit` prop,
  rendered as a smaller, muted `.sm-stat-unit` span after the value — e.g. `" ó"` on total
  lost time, `"/hét"` on the weekly average), `Heatmap` ("42 ÉJSZAKA"), `IncidentLog` (the
  "KILL LIST" — shows the 3 most recent entries collapsed with a "+N korábbi bejegyzés"
  expander; clicking a row opens an inline editor to set `who`/`min`/`note`/`ts` after the
  fact, since tap-to-log doesn't collect those up front — `ts` via a native `datetime-local`
  picker, min/max-clamped to the configured period; leaving it untouched keeps the incident's
  original ms exactly, since Save only includes `ts` in the patch when the field's value
  differs from the incident's current one).
- `index.jsx` — thin container: wires the hooks, holds only UI-local state (`flash`,
  `showSettings`), defines actions (`log(typeId)`, `updateIncident(id, patch)`, `remove`,
  `resetAll`, `setStart`/`setEnd`), and renders `Header` + `SettingsPanel` outside a single
  `.sm-card` wrapper that contains `CounterBoard` → `IncidentForm` → `StatsGrid` → `Heatmap`
  → `IncidentLog` (separated by `.sm-divider`s) — matching the design's "one continuous
  panel" layout rather than separately-boxed sections.
- `styles.css` — all styling lives here as `:root` CSS custom properties (`--sm-*`, the
  horror palette: `--sm-void`/`--sm-panel`/`--sm-card` backgrounds, `--sm-blood`/
  `--sm-blood-bright`/`--sm-blood-fire`/`--sm-blood-dark`/`--sm-ember`/`--sm-brick`/`--sm-rose`
  red/ember accents, `--sm-bone`/`--sm-ash`/`--sm-muted` text, `--sm-line*` dashed borders,
  `--sm-focus` for the focus outline) plus one class per element. Components only ever set
  `className`; dynamic/data-driven styling (progress width, heatmap cell severity, the
  type-grid's critical/PROD variant) is expressed as class-name variants, not inline styles,
  so a future re-skin only has to touch this file + component markup, not the hooks/logic
  layer.
- `assets/` (under `src/incident-monitor/`, **not** the top-level `src/assets/` scaffolding
  mentioned below) — the three decorative WebP images pulled from the design doc:
  `skull-large.webp` (CounterBoard, absolutely positioned in the card's top-right corner via
  `.sm-board-skull`), `nightmap.webp` (Heatmap's `.sm-heatmap-frame` background, with the
  severity cells in `.sm-cell--warn`/`--alarm` given partial transparency so the image still
  reads through), and `skull-small.webp` (StatsGrid's wide/accent "fő elkövető" tile, via the
  `Stat` component's `icon` prop). All three are decorative (`aria-hidden`, `pointer-events:
  none` where applicable) and were extracted + recompressed from the raw PNGs embedded in the
  design doc export (~1.8 MB raw → ~200 KB total as WebP).

`App.jsx`, `App.css`, `index.css`, and the top-level `src/assets/{react.svg,vite.svg,hero.png}`
files are leftover `npm create vite@latest` scaffolding, **not imported by the running app** —
`index.css` isn't imported anywhere, and `App.jsx`/`App.css` only import each other. Don't
assume changes to those files affect the live app; when in doubt, trace imports from
`index.html` → `src/main.jsx`.

No routing, no state-management library, and no network calls other than the storage shim —
it's fully client-local.
