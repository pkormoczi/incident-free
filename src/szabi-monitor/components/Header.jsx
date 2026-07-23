export function Header({ elapsedDays, totalDays, showSettings, onToggleSettings }) {
  return (
    <div className="sm-header">
      <div>
        <div className="sm-header-eyebrow">TÚLÉLÉSI NAPLÓ</div>
        <div className="sm-header-title">SZABI-MONITOR</div>
      </div>
      <div className="sm-header-meta">
        <div>{elapsedDays} / {totalDays}. NAP</div>
        <button
          className="sm-btn sm-period-btn"
          onClick={() => onToggleSettings(!showSettings)}
        >
          IDŐSZAK
        </button>
      </div>
    </div>
  );
}
