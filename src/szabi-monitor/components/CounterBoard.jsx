import { ProgressBar } from "./ProgressBar.jsx";

export function CounterBoard({ flash, digits, record, elapsedDays, totalDays }) {
  return (
    <div className={`sm-board-section${flash ? " sm-flash" : ""}`}>
      <div className="sm-board-label">NAPOK AZ UTOLSÓ MEGSZAKÍTÁS ÓTA</div>
      <div className="sm-digit-big">{digits}</div>
      <div className="sm-board-record">rekord: {record}</div>
      <ProgressBar elapsedDays={elapsedDays} totalDays={totalDays} />
      <div className="sm-board-caption">{elapsedDays} / {totalDays} nap túlélve</div>
    </div>
  );
}
