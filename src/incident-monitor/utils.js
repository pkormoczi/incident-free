export const DAY = 86400000;

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const addDays = (iso, n) => new Date(new Date(iso).getTime() + n * DAY).toISOString().slice(0, 10);

export const startOfDay = (ms) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };

export const fmtDate = (ms) =>
  new Date(ms).toLocaleString("hu-HU", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

/* "ma 09:12" / "tegn. 16:40" / "3 napja" — a KILL LIST relatív időbélyege */
export const relLogDate = (ts, now) => {
  const dayDiff = Math.round((startOfDay(now) - startOfDay(ts)) / DAY);
  const hh = String(new Date(ts).getHours()).padStart(2, "0");
  const mm = String(new Date(ts).getMinutes()).padStart(2, "0");
  if (dayDiff <= 0) return `ma ${hh}:${mm}`;
  if (dayDiff === 1) return `tegn. ${hh}:${mm}`;
  return `${dayDiff} napja`;
};
