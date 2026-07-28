import { useState } from "react";
import { TYPES } from "../constants.js";
import { localInputToTs, relLogDate, tsToLocalInput } from "../utils.js";

const typeShort = (id) => TYPES.find((t) => t.id === id)?.short ?? id;

function LogRow({ incident, now, start, end, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [who, setWho] = useState(incident.who);
  const [mins, setMins] = useState(incident.min);
  const [note, setNote] = useState(incident.note);
  const [tsInput, setTsInput] = useState(() => tsToLocalInput(incident.ts));

  if (!editing) {
    return (
      <div className="sm-kill-row" onClick={() => setEditing(true)}>
        <span className="sm-kill-meta">
          {relLogDate(incident.ts, now)} · {typeShort(incident.type)} · {incident.who || "—"}
        </span>
        <span className="sm-kill-min">−{incident.min}p</span>
      </div>
    );
  }

  /* a natív naptár a szabin kívüli napokat kiszürkíti, de kézi begépeléssel a min/max nem   */
  /* blokkol — ezért a Mentés is tiltva marad, amíg az érték kilóg. Enélkül a sor mentés után */
  /* némán eltűnne a KILL LIST-ből és minden statisztikából (mindkettő az időszakra szűr).    */
  const minTs = `${start}T00:00`;
  const maxTs = `${end}T23:59`;
  const tsOutOfRange = tsInput !== "" && (tsInput < minTs || tsInput > maxTs);

  const save = () => {
    if (tsOutOfRange) return;
    const patch = { who: who.trim(), min: Number(mins) || 0, note: note.trim() };
    /* a datetime-local percre kerekít: érintetlen mező visszaírása némán levágná az        */
    /* eredeti másodperceket, és megkeverné az egy percen belüli bejegyzések sorrendjét      */
    if (tsInput !== tsToLocalInput(incident.ts)) {
      const ms = localInputToTs(tsInput);
      if (ms !== null) patch.ts = ms;
    }
    onUpdate(incident.id, patch);
    setEditing(false);
  };

  return (
    <div className="sm-kill-row--editing">
      <input className="sm-inp sm-kill-edit-input" placeholder="Ki?" value={who} onChange={(e) => setWho(e.target.value)} />
      <input className="sm-inp sm-kill-edit-input sm-kill-edit-mins" type="number" min="0" step="5" value={mins} onChange={(e) => setMins(e.target.value)} aria-label="Elveszett perc" />
      <input className="sm-inp sm-kill-edit-input" placeholder="Megjegyzés" value={note} onChange={(e) => setNote(e.target.value)} />
      <input
        className="sm-inp sm-kill-edit-input sm-kill-edit-ts"
        type="datetime-local"
        value={tsInput}
        min={minTs}
        max={maxTs}
        onChange={(e) => setTsInput(e.target.value)}
        aria-label="Időpont"
      />
      {tsOutOfRange && (
        <div className="sm-kill-edit-error">A szabin kívüli időpont ({start} – {end}).</div>
      )}
      <button className="sm-btn sm-kill-save" disabled={tsOutOfRange} onClick={save}>Mentés</button>
      <button className="sm-btn sm-kill-remove" onClick={() => onRemove(incident.id)}>Törlés</button>
    </div>
  );
}

export function IncidentLog({ incidents, now, start, end, onUpdate, onRemove }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? incidents : incidents.slice(0, 3);
  const hiddenCount = incidents.length - visible.length;

  return (
    <div className="sm-log-section">
      <div className="sm-section-heading sm-section-heading--mono">KILL LIST — VISSZAMENŐLEG</div>
      {incidents.length === 0 ? (
        <div className="sm-log-empty">
          Még üres. Ha valaki megtalál, koppints — a lista ettől lesz hiteles.
        </div>
      ) : (
        <>
          <div className="sm-kill-list">
            {visible.map((i) => (
              <LogRow key={i.id} incident={i} now={now} start={start} end={end} onUpdate={onUpdate} onRemove={onRemove} />
            ))}
          </div>
          {hiddenCount > 0 && (
            <button className="sm-btn sm-kill-more" onClick={() => setExpanded(true)}>
              + {hiddenCount} korábbi bejegyzés
            </button>
          )}
        </>
      )}
    </div>
  );
}
