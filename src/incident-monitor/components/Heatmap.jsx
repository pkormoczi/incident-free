function cellVariant(d, past) {
  if (!past) return "future";
  if (d.n === 0) return "clean";
  return d.min >= 60 ? "alarm" : "warn";
}

export function Heatmap({ dayBuckets, elapsedDays }) {
  return (
    <div className="sm-heatmap-section">
      <div className="sm-section-heading sm-section-heading--mono">42 ÉJSZAKA</div>
      <div className="sm-heatmap-frame">
        <div className="sm-heatmap-grid">
          {dayBuckets.map((d, i) => {
            const past = i < elapsedDays;
            return (
              <div
                key={i}
                className={`sm-cell sm-cell--${cellVariant(d, past)}`}
                title={`${new Date(d.date).toLocaleDateString("hu-HU", { month: "short", day: "numeric" })} — ${d.n} megszakítás, ${d.min} perc`}
              >
                {d.n || (past ? "" : "")}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
