import { useEffect, useState } from "react";
import "./styles.css";
import { KEY, TYPES, DEFAULT_STATE } from "./constants.js";
import { todayISO, tsToISO, validateImport } from "./utils.js";
import { getContext } from "./context.js";
import { usePersistentState } from "./hooks/usePersistentState.js";
import { useNow } from "./hooks/useNow.js";
import { useTheme } from "./hooks/useTheme.js";
import { useMonitorStats } from "./hooks/useMonitorStats.js";
import { Header } from "./components/Header.jsx";
import { SettingsPanel } from "./components/SettingsPanel.jsx";
import { CounterBoard } from "./components/CounterBoard.jsx";
import { IncidentForm } from "./components/IncidentForm.jsx";
import { StatsGrid } from "./components/StatsGrid.jsx";
import { Heatmap } from "./components/Heatmap.jsx";
import { IncidentLog } from "./components/IncidentLog.jsx";
import { LogModal } from "./components/LogModal.jsx";
import { IntroModal } from "./components/IntroModal.jsx";
import { ImportModal } from "./components/ImportModal.jsx";

/* ------------------------------------------------------------------ */
/*  INCIDENT-MONITOR — horror címtábla, nyugalmi állapot (3a)          */
/* ------------------------------------------------------------------ */

/* #me: ideiglenes, csak-JSON kontextus — a public/me.json mindig mérvadó, localStorage-hoz  */
/* nem nyúl (sem az alap kulcsot, sem sajátot), a szerkesztések csak a memóriában élnek.      */
/* Modulszinten dől el, mert a kontextus csak újratöltéssel válthat. A fájlt (GitHub Pages    */
/* CDN + böngésző cache-elés miatt, ld. Cache-Control: max-age=600 minden fájlon, HTML-en is) */
/* nem build-time importtal ágyazzuk be, hanem minden oldalbetöltéskor cache-bustolt fetch-csel*/
/* töltjük — így egy friss commit a következő betöltéskor látszik, nem a JS bundle cache-én múlik.*/
const CONTEXT = getContext();

export default function IncidentMonitor() {
  const [state, setState, { loaded, storageOk, hasSavedData }] = usePersistentState(
    CONTEXT === "me" ? null : KEY,
    DEFAULT_STATE,
  );
  const now = useNow();
  const [theme, toggleTheme] = useTheme();

  const [flash, setFlash] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pendingType, setPendingType] = useState(null);
  const [introDone, setIntroDone] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [meReady, setMeReady] = useState(CONTEXT !== "me");
  const showIntro = CONTEXT === "base" && loaded && !hasSavedData && !introDone;

  useEffect(() => {
    if (CONTEXT !== "me") return;
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.BASE_URL}me.json?t=${Date.now()}`, { cache: "no-store" });
        const r = validateImport(await res.json());
        if (r.ok) {
          setState((p) => ({ ...p, config: r.data.config ?? p.config, incidents: r.data.incidents }));
        } else {
          /* a me.json mérvadó — hibás tartalomnál ne csak némán az alapállapot maradjon */
          console.warn("me.json:", r.error);
        }
      } catch {
        /* marad az alapállapot */
      } finally {
        setMeReady(true);
      }
    })();
  }, [setState]);

  const {
    incidents, digits,
    record, totalDays, elapsedDays, lostMin,
    dayBuckets, offenders, topType, perWeek,
  } = useMonitorStats(state, now);

  /* ---------- actions ---------- */

  /* koppintás = szerkesztő ablak megnyitása a típus alapértelmezett percével;    */
  /* a bejegyzés csak a modal megerősítésekor jön létre                          */
  const pickType = (typeId) => setPendingType(TYPES.find((x) => x.id === typeId));

  const confirmLog = ({ who, min, note }) => {
    const t = pendingType;
    setState((p) => ({
      ...p,
      incidents: [
        ...p.incidents,
        { id: Math.random().toString(36).slice(2), ts: Date.now(), type: t.id, min, who, note },
      ],
    }));
    setPendingType(null);
    setFlash(true);
    setTimeout(() => setFlash(false), 900);
  };

  const cancelLog = () => setPendingType(null);

  const updateIncident = (id, patch) => setState((p) => ({
    ...p,
    incidents: p.incidents.map((i) => (i.id === id ? { ...i, ...patch } : i)),
  }));

  const remove = (id) => setState((p) => ({ ...p, incidents: p.incidents.filter((i) => i.id !== id) }));
  const resetAll = () => { if (confirm("Az egész KILL LIST törlése. Biztos?")) setState((p) => ({ ...p, incidents: [] })); };

  const setStart = (start) => setState((p) => ({ ...p, config: { ...p.config, start } }));
  const setEnd = (end) => setState((p) => ({ ...p, config: { ...p.config, end } }));

  /* első indítású beállítás — a modal csak akkor jelenik meg, ha még nincs        */
  /* mentett adat; a megerősítéssel jön létre az első kimenthető állapot           */
  const confirmIntro = ({ start, end }) => {
    setState((p) => ({ ...p, config: { ...p.config, start, end } }));
    setIntroDone(true);
  };

  /* kifelé ISO-8601 időbélyeg (mint az exportedAt) — belül marad az epoch ms */
  const buildExport = () => JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      config: state.config,
      incidents: state.incidents.map((i) => ({ ...i, ts: tsToISO(i.ts) })),
    },
    null,
    2,
  );

  const exportData = () => {
    const blob = new Blob([buildExport()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `incident-monitor-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyData = async () => {
    const json = buildExport();
    try {
      await navigator.clipboard.writeText(json);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = json;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  };

  /* teljes csere: a beolvasott incidents mindig felülír, a config csak akkor, ha az   */
  /* import tartalmazza — különben a jelenlegi Első/Utolsó nap marad                    */
  const importData = (data) => {
    setState((p) => ({ config: data.config ?? p.config, incidents: data.incidents }));
    setShowImport(false);
    setIntroDone(true);
  };

  const cleanDays = dayBuckets.slice(0, elapsedDays).filter((d) => d.n === 0).length;
  const topOffender = offenders.length ? offenders[0] : null;

  if (!meReady) {
    return (
      <div className="sm-root">
        <div className="sm-container sm-loading">Betöltés…</div>
      </div>
    );
  }

  return (
    <div className="sm-root">
      <div className="sm-container">
        <Header
          elapsedDays={elapsedDays}
          totalDays={totalDays}
          showSettings={showSettings}
          onToggleSettings={setShowSettings}
          onExport={exportData}
          onImport={() => setShowImport(true)}
          onCopy={copyData}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {showSettings && (
          <SettingsPanel
            start={state.config.start}
            end={state.config.end}
            onChangeStart={setStart}
            onChangeEnd={setEnd}
            onResetAll={resetAll}
          />
        )}

        <div className="sm-card">
          <CounterBoard flash={flash} digits={digits} record={record} elapsedDays={elapsedDays} totalDays={totalDays} />

          <div className="sm-divider" />

          <IncidentForm onLog={pickType} />

          <div className="sm-divider" />

          <StatsGrid
            incidentCount={state.incidents.length}
            lostMin={lostMin}
            perWeek={perWeek}
            cleanDays={cleanDays}
            topOffender={topOffender}
            topType={topType}
          />

          <div className="sm-divider" />

          <Heatmap dayBuckets={dayBuckets} elapsedDays={elapsedDays} />

          <div className="sm-divider" />

          <IncidentLog incidents={incidents} now={now} onUpdate={updateIncident} onRemove={remove} />
        </div>

        {!storageOk && (
          <div className="sm-storage-warning">
            A mentés nem elérhető ebben a környezetben — az adatok az oldal bezárásáig élnek.
          </div>
        )}

        {CONTEXT === "me" && (
          <div className="sm-storage-warning">
            Személyes nézet (#me): a beépített adatokat mutatja. A módosítások nem mentődnek —
            exportáld és commitold a JSON-t a megőrzésükhöz.
          </div>
        )}
      </div>

      {pendingType && (
        <LogModal type={pendingType} offenders={offenders} onConfirm={confirmLog} onCancel={cancelLog} />
      )}

      {showIntro && !showImport && <IntroModal onConfirm={confirmIntro} onImport={() => setShowImport(true)} />}

      {showImport && (
        <ImportModal onConfirm={importData} onCancel={() => setShowImport(false)} />
      )}
    </div>
  );
}
