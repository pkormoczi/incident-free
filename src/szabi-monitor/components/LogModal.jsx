import { useEffect, useState } from "react";

/* rögzítés előtti szerkesztő ablak — a típusgombra koppintás ezt nyitja meg,       */
/* a bejegyzés csak "Rögzítés"-re jön létre, "Mégse"/Escape/backdrop nem ment      */
export function LogModal({ type, offenders, onConfirm, onCancel }) {
  const [who, setWho] = useState("");
  const [min, setMin] = useState(type.min);
  const [note, setNote] = useState("");

  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  const submit = (e) => {
    e.preventDefault();
    onConfirm({ who: who.trim(), min: Number(min) || 0, note: note.trim() });
  };

  return (
    <div className="sm-modal-backdrop" onClick={onCancel}>
      <div className="sm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={submit}>
          <div className="sm-modal-title">{type.short} rögzítése</div>

          <label className="sm-modal-field">
            Elkövető
            <input
              className="sm-inp"
              list="sm-modal-offenders"
              value={who}
              onChange={(e) => setWho(e.target.value)}
              autoFocus
              placeholder="Ki szakított meg?"
            />
          </label>
          <datalist id="sm-modal-offenders">
            {offenders.map(([name]) => <option key={name} value={name} />)}
          </datalist>

          <label className="sm-modal-field">
            Idő (perc)
            <input
              className="sm-inp"
              type="number"
              min="0"
              step="5"
              value={min}
              onChange={(e) => setMin(e.target.value)}
              aria-label="Elveszett perc"
            />
          </label>

          <label className="sm-modal-field">
            Megjegyzés
            <input
              className="sm-inp"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Megjegyzés (opcionális)"
            />
          </label>

          <div className="sm-modal-actions">
            <button type="button" className="sm-btn sm-modal-cancel" onClick={onCancel}>Mégse</button>
            <button type="submit" className="sm-btn sm-modal-confirm">Rögzítés</button>
          </div>
        </form>
      </div>
    </div>
  );
}
