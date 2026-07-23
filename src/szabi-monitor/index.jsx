import { useState } from "react";
import "./styles.css";
import { KEY, TYPES, DEFAULT_STATE } from "./constants.js";
import { usePersistentState } from "./hooks/usePersistentState.js";
import { useNow } from "./hooks/useNow.js";
import { useMonitorStats } from "./hooks/useMonitorStats.js";
import { Header } from "./components/Header.jsx";
import { SettingsPanel } from "./components/SettingsPanel.jsx";
import { CounterBoard } from "./components/CounterBoard.jsx";
import { IncidentForm } from "./components/IncidentForm.jsx";
import { StatsGrid } from "./components/StatsGrid.jsx";
import { Heatmap } from "./components/Heatmap.jsx";
import { IncidentLog } from "./components/IncidentLog.jsx";
import { LogModal } from "./components/LogModal.jsx";

/* ------------------------------------------------------------------ */
/*  SZABI-MONITOR — horror címtábla, nyugalmi állapot (3a)             */
/* ------------------------------------------------------------------ */

export default function SzabiMonitor() {
  const [state, setState, { storageOk }] = usePersistentState(KEY, DEFAULT_STATE);
  const now = useNow();

  const [flash, setFlash] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pendingType, setPendingType] = useState(null);

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

  const cleanDays = dayBuckets.slice(0, elapsedDays).filter((d) => d.n === 0).length;
  const topOffender = offenders.length ? offenders[0] : null;

  return (
    <div className="sm-root">
      <div className="sm-container">
        <Header
          elapsedDays={elapsedDays}
          totalDays={totalDays}
          showSettings={showSettings}
          onToggleSettings={setShowSettings}
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
      </div>

      {pendingType && (
        <LogModal type={pendingType} offenders={offenders} onConfirm={confirmLog} onCancel={cancelLog} />
      )}
    </div>
  );
}
