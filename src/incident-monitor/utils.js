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

/* egy már JSON.parse-olt objektum alak-validálása; elfogadja mind a teljes export     */
/* alakot ({ exportedAt, config, incidents }), mind a nyers állapotot                  */
/* ({ config, incidents }) — az exportedAt-ot és minden más kulcsot figyelmen kívül    */
/* hagyja. Sikeres eredmény: { ok: true, data: { config?, incidents } }.               */
export const validateImport = (parsed) => {
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { ok: false, error: "Ismeretlen adatformátum." };
  }

  if (!Array.isArray(parsed.incidents)) {
    return { ok: false, error: "Hiányzik vagy hibás az 'incidents' lista." };
  }
  const incidents = parsed.incidents.filter((i) => typeof i === "object" && i !== null);

  let config;
  if (parsed.config !== undefined) {
    const c = parsed.config;
    if (typeof c !== "object" || c === null || typeof c.start !== "string" || typeof c.end !== "string") {
      return { ok: false, error: "Hibás 'config' (Első/Utolsó nap)." };
    }
    config = { start: c.start, end: c.end };
  }

  return { ok: true, data: { config, incidents } };
};

/* beillesztett/betöltött export-JSON szöveg validálása importhoz — ld. validateImport. */
export const parseImport = (text) => {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: "A szöveg nem érvényes JSON." };
  }
  return validateImport(parsed);
};
