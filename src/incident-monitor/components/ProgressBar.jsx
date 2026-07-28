export function ProgressBar({ closedDays, totalDays }) {
  return (
    <div className="sm-progress">
      <div className="sm-progress-fill" style={{ width: `${(closedDays / totalDays) * 100}%` }} />
    </div>
  );
}
