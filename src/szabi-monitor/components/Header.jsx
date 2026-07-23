import { useState } from "react";

export function Header({ elapsedDays, totalDays, showSettings, onToggleSettings, onExport, onCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="sm-header">
      <div>
        <div className="sm-header-eyebrow">TÚLÉLÉSI NAPLÓ</div>
        <div className="sm-header-title">INCIDENS MONITOR</div>
      </div>
      <div className="sm-header-meta">
        <div>{elapsedDays} / {totalDays}. NAP</div>
        <div className="sm-header-actions">
          <button
            className="sm-btn sm-period-btn"
            onClick={() => onToggleSettings(!showSettings)}
          >
            IDŐSZAK
          </button>
          <button className="sm-btn sm-period-btn" onClick={onExport}>
            EXPORT
          </button>
          <button className="sm-btn sm-period-btn" onClick={handleCopy}>
            {copied ? "MÁSOLVA ✓" : "MÁSOLÁS"}
          </button>
        </div>
      </div>
    </div>
  );
}
