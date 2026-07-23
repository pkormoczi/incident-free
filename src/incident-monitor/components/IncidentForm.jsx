import { TYPES } from "../constants.js";

export function IncidentForm({ onLog }) {
  return (
    <div className="sm-form-section">
      <div className="sm-section-heading">Elkövetés módja</div>

      <div className="sm-type-grid">
        {TYPES.map((t) => (
          <button
            key={t.id}
            className={`sm-btn sm-type-btn${t.id === "prod" ? " is-critical" : ""}`}
            onClick={() => onLog(t.id)}
          >
            {t.pick}
          </button>
        ))}
      </div>
    </div>
  );
}
