function Stat({ label, value, wide, accent }) {
  return (
    <div className={`sm-stat${wide ? " sm-stat--wide" : ""}${accent ? " sm-stat--accent" : ""}`}>
      <div className="sm-stat-value">{value}</div>
      <div className="sm-stat-label">{label}</div>
    </div>
  );
}

export function StatsGrid({ incidentCount, lostMin, perWeek, cleanDays, topOffender, topType }) {
  return (
    <div className="sm-stats-section">
      <div className="sm-section-heading sm-section-heading--mono">STATISZTIKA</div>
      <div className="sm-stats-grid">
        <Stat label="megszakítás" value={incidentCount} />
        <Stat label="összes elveszett" value={`${(lostMin / 60).toFixed(1)} ó`} />
        <Stat label="heti átlag" value={`${perWeek.toFixed(1)}/n`} />
        <Stat label="tiszta nap" value={cleanDays} />
        <Stat
          wide
          accent
          value={topOffender ? `${topOffender[0]} · ${topType ?? "–"}` : "–"}
          label="fő elkövető · fő fegyvernem"
        />
      </div>
    </div>
  );
}
