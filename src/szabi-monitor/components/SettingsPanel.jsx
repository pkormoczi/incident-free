export function SettingsPanel({ start, end, onChangeStart, onChangeEnd, onResetAll }) {
  return (
    <div className="sm-settings">
      <label className="sm-settings-label">
        Első nap
        <input
          className="sm-inp sm-settings-input"
          type="date"
          value={start}
          onChange={(e) => onChangeStart(e.target.value)}
        />
      </label>
      <label className="sm-settings-label">
        Utolsó nap
        <input
          className="sm-inp sm-settings-input"
          type="date"
          value={end}
          onChange={(e) => onChangeEnd(e.target.value)}
        />
      </label>
      <button className="sm-btn sm-reset-btn" onClick={onResetAll}>
        KILL LIST törlése
      </button>
    </div>
  );
}
