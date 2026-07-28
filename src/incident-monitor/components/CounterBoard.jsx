import { ProgressBar } from "./ProgressBar.jsx";
import skullLarge from "../assets/skull-large.webp";

export function CounterBoard({ flash, digits, record, closedDays, totalDays }) {
  return (
    <div className={`sm-board-section${flash ? " sm-flash" : ""}`}>
      <img className="sm-board-skull" src={skullLarge} alt="" aria-hidden="true" />
      <div className="sm-board-label">NAPOK AZ UTOLSÓ MEGSZAKÍTÁS ÓTA</div>
      <div className="sm-digit-big">{digits}</div>
      <div className="sm-board-record">rekord: {record}</div>
      <ProgressBar closedDays={closedDays} totalDays={totalDays} />
      <div className="sm-board-caption">{closedDays} / {totalDays} nap túlélve</div>
    </div>
  );
}
