import { useState } from "react";

/* első indítású beállító ablak — csak akkor jelenik meg, ha még nincs mentett     */
/* adat; a szabi kezdő- és végdátumát kéri be. Kötelező kitölteni, nincs Mégse/    */
/* Escape/backdrop-bezárás, mert enélkül nincs érvényes állapot, amit menteni      */
/* lehetne.                                                                        */
export function IntroModal({ onConfirm }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const hasBoth = start !== "" && end !== "";
  const rangeInvalid = hasBoth && end < start;
  const canSubmit = hasBoth && !rangeInvalid;

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    onConfirm({ start, end });
  };

  return (
    <div className="sm-modal-backdrop">
      <div className="sm-modal" role="dialog" aria-modal="true">
        <form onSubmit={submit}>
          <div className="sm-modal-title">Mettől meddig tart a szabi?</div>

          <label className="sm-modal-field">
            Első nap
            <input
              className="sm-inp"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              autoFocus
            />
          </label>

          <label className="sm-modal-field">
            Utolsó nap
            <input
              className="sm-inp"
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>

          {rangeInvalid && (
            <div className="sm-modal-error">Az utolsó nap nem lehet az első nap előtt.</div>
          )}

          <div className="sm-modal-actions">
            <button type="submit" className="sm-btn sm-modal-confirm" disabled={!canSubmit}>
              Indulhat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
