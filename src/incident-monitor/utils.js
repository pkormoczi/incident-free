export const DAY = 86400000;

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const addDays = (iso, n) => new Date(new Date(iso).getTime() + n * DAY).toISOString().slice(0, 10);

export const startOfDay = (ms) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };

export const fmtDate = (ms) =>
  new Date(ms).toLocaleString("hu-HU", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

const pad = (n) => String(n).padStart(2, "0");

/* "ma 09:12" / "tegn. 16:40" / "júl. 22. 14:30" — a KILL LIST relatív időbélyege. A         */
/* dayDiff === 0 (nem <= 0), mert a szerkesztőben mostantól jövőbeli nap is választható      */
/* (a szabi jellemzően a jövőbe nyúlik) — egy jövőbeli időpontot nem szabad "ma"-ként írni.  */
export const relLogDate = (ts, now) => {
  const dayDiff = Math.round((startOfDay(now) - startOfDay(ts)) / DAY);
  const hh = pad(new Date(ts).getHours());
  const mm = pad(new Date(ts).getMinutes());
  if (dayDiff === 0) return `ma ${hh}:${mm}`;
  if (dayDiff === 1) return `tegn. ${hh}:${mm}`;
  return fmtDate(ts);
};

/* helyi idejű határ a <input type="datetime-local"> mezőhöz — NEM a JSON export/import     */
/* UTC ISO-8601 határa (ld. tsToISO/validateImport lejjebb). A datetime-local mindig helyi   */
/* időt vár/ad időzóna-jelző nélkül, ahogy az app minden más napszámítása is helyi idővel    */
/* megy (startOfDay, config.start/end parse a hookban) — ezért itt nem toISOString().        */
export const tsToLocalInput = (ms) => {
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const localInputToTs = (v) => {
  if (typeof v !== "string" || v === "") return null;
  const ms = new Date(v).getTime();
  return Number.isNaN(ms) ? null : ms;
};

/* JSON-határ: kifelé ISO-8601 szöveg (mint az exportedAt), befelé epoch ms. Minden        */
/* dátumszámítás (rendezés, streak, naptérkép) számmal megy, ezért az átváltás csak az     */
/* export/import két pontján történik — az állapot és a localStorage tartalma végig ms.    */
export const tsToISO = (ms) => {
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};

/* ISO-8601 szöveg → epoch ms; minden másra null. A typeof nem díszítés: a Date.parse      */
/* stringgé alakítaná az argumentumot, így pl. egy ["2026-...Z"] tömb is átmenne rajta.     */
const tsFromISO = (v) => {
  if (typeof v !== "string") return null;
  const ms = Date.parse(v);
  return Number.isNaN(ms) ? null : ms;
};

/* egy már JSON.parse-olt objektum alak-validálása; elfogadja mind a teljes export     */
/* alakot ({ exportedAt, config, incidents }), mind a nyers állapotot                  */
/* ({ config, incidents }) — az exportedAt-ot és minden más kulcsot figyelmen kívül    */
/* hagyja. A visszaadott incidents 'ts' mezője már epoch ms — a JSON-ban ISO-8601      */
/* szöveg. Sikeres eredmény: { ok: true, data: { config?, incidents } }.               */
export const validateImport = (parsed) => {
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { ok: false, error: "Ismeretlen adatformátum." };
  }

  if (!Array.isArray(parsed.incidents)) {
    return { ok: false, error: "Hiányzik vagy hibás az 'incidents' lista." };
  }
  /* egyetlen hibás 'ts' az egész importot elutasítja: az import teljes cserét jelent, */
  /* a hibás bejegyzés csendes eldobása némán adatot veszítene                         */
  const incidents = [];
  for (const i of parsed.incidents) {
    if (typeof i !== "object" || i === null) continue;
    const ts = tsFromISO(i.ts);
    if (ts === null) {
      return { ok: false, error: "Hibás 'ts' időbélyeg — ISO-8601 szöveg kell (pl. „2026-07-27T10:54:00.000Z”), nem szám." };
    }
    incidents.push({ ...i, ts });
  }

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
