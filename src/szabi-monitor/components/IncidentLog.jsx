import { useState } from "react";
import { TYPES } from "../constants.js";
import { relLogDate } from "../utils.js";

const typeShort = (id) => TYPES.find((t) => t.id === id)?.short ?? id;

function LogRow({ incident, now, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [who, setWho] = useState(incident.who);
  const [mins, setMins] = useState(incident.min);
  const [note, setNote] = useState(incident.note);

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

  const save = () => {
    onUpdate(incident.id, { who: who.trim(), min: Number(mins) || 0, note: note.trim() });
    setEditing(false);
  };

  return (
    <div className="sm-kill-row--editing">
      <input className="sm-inp sm-kill-edit-input" placeholder="Ki?" value={who} onChange={(e) => setWho(e.target.value)} />
      <input className="sm-inp sm-kill-edit-input sm-kill-edit-mins" type="number" min="0" step="5" value={mins} onChange={(e) => setMins(e.target.value)} aria-label="Elveszett perc" />
      <input className="sm-inp sm-kill-edit-input" placeholder="Megjegyzés" value={note} onChange={(e) => setNote(e.target.value)} />
      <button className="sm-btn sm-kill-save" onClick={save}>Mentés</button>
      <button className="sm-btn sm-kill-remove" onClick={() => onRemove(incident.id)}>Törlés</button>
    </div>
  );
}

export function IncidentLog({ incidents, now, onUpdate, onRemove }) {
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
              <LogRow key={i.id} incident={i} now={now} onUpdate={onUpdate} onRemove={onRemove} />
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
