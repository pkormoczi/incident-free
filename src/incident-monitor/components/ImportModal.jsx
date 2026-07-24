import { useEffect, useState } from "react";
import { parseImport } from "../utils.js";

/* korábban exportált JSON visszatöltése — vágólapról beillesztve vagy .json fájlból  */
/* betöltve. "Mégse"/Escape/backdrop nem ment; sikertelen ellenőrzés esetén a modal    */
/* nyitva marad és hibaüzenetet mutat.                                                 */
export function ImportModal({ onConfirm, onCancel }) {
  const [text, setText] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  const loadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setText(reader.result); setError(null); };
    reader.readAsText(file);
    e.target.value = "";
  };

  const submit = (e) => {
    e.preventDefault();
    const res = parseImport(text);
    if (!res.ok) { setError(res.error); return; }
    onConfirm(res.data);
  };

  return (
    <div className="sm-modal-backdrop" onClick={onCancel}>
      <div className="sm-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={submit}>
          <div className="sm-modal-title">Adatok importálása</div>

          <label className="sm-modal-field">
            Illeszd be a korábban exportált / másolt JSON-t
            <textarea
              className="sm-inp sm-import-textarea"
              value={text}
              onChange={(e) => { setText(e.target.value); setError(null); }}
              autoFocus
              placeholder="{ &quot;config&quot;: ..., &quot;incidents&quot;: [...] }"
            />
          </label>

          <label className="sm-btn sm-modal-cancel sm-import-file">
            Fájl betöltése
            <input type="file" accept="application/json,.json" hidden onChange={loadFile} />
          </label>

          {error && <div className="sm-modal-error">{error}</div>}

          <div className="sm-modal-actions">
            <button type="button" className="sm-btn sm-modal-cancel" onClick={onCancel}>Mégse</button>
            <button type="submit" className="sm-btn sm-modal-confirm" disabled={!text.trim()}>Importálás</button>
          </div>
        </form>
      </div>
    </div>
  );
}
