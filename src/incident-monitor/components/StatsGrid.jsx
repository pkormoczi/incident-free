import skullSmall from "../assets/skull-small.webp";

function Stat({ label, value, unit, wide, accent, icon }) {
  return (
    <div className={`sm-stat${wide ? " sm-stat--wide" : ""}${accent ? " sm-stat--accent" : ""}`}>
      {icon && <img className="sm-stat-skull" src={icon} alt="" aria-hidden="true" />}
      <div className="sm-stat-value">{value}{unit && <span className="sm-stat-unit">{unit}</span>}</div>
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
        <Stat label="összes elveszett" value={(lostMin / 60).toFixed(1)} unit=" ó" />
        <Stat label="heti átlag" value={perWeek.toFixed(1)} unit="/hét" />
        <Stat label="tiszta nap" value={cleanDays} />
        <Stat
          wide
          accent
          icon={skullSmall}
          value={topOffender ? `${topOffender[0]} · ${topType ?? "–"}` : "–"}
          label="fő elkövető · fő fegyvernem"
        />
      </div>
    </div>
  );
}
