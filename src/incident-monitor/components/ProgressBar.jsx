export function ProgressBar({ elapsedDays, totalDays }) {
  return (
    <div className="sm-progress">
      <div className="sm-progress-fill" style={{ width: `${(elapsedDays / totalDays) * 100}%` }} />
    </div>
  );
}
