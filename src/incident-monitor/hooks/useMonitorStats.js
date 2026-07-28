import { useMemo } from "react";
import { DAY, TYPES } from "../constants.js";
import { startOfDay } from "../utils.js";

/* hányadik napra esik a bejegyzés az időszak elejétől számolva (0-alapú) — egyetlen  */
/* definíció, ezt használja az időszakszűrő és a naptérkép is                          */
const dayIndex = (ts, startMs) => Math.floor((startOfDay(ts) - startOfDay(startMs)) / DAY);

/* ---------- minden származtatott adat egy helyen: streak, rekord, ---------- */
/* ---------- naptérkép, elkövetők, heti átlag, fő fegyvernem         ---------- */
export function useMonitorStats(state, now) {
  const startMs = useMemo(() => new Date(state.config.start + "T00:00:00").getTime(), [state.config.start]);
  const endMs = useMemo(() => new Date(state.config.end + "T23:59:59").getTime(), [state.config.end]);
  const totalDays = Math.max(1, Math.round((startOfDay(endMs) - startOfDay(startMs)) / DAY) + 1);
  const elapsedDays = Math.min(totalDays, Math.max(0, Math.floor((now - startMs) / DAY) + 1));
  /* lezárt nap = éjfélkor véget ért nap. A mai nap még nyitott (jöhet incidens), ezért a mai */
  /* nap 0-alapú indexe egyben a mögötte lezárult napok száma is — a "nap túlélve" felirat és */
  /* a "tiszta nap" számláló ezt használja, nem elapsedDays-t (ami a mai napot is beleszámolja)*/
  const closedDays = Math.min(totalDays, Math.max(0, dayIndex(now, startMs)));

  /* a lényeg: csak a beállított Első/Utolsó nap közé eső bejegyzések számítanak — a     */
  /* KILL LIST is ezt mutatja. Az időszakon kívüliek nem törlődnek, csak nem látszanak;  */
  /* az export/import továbbra is a teljes listát viszi (ld. index.jsx buildExport).     */
  const windowedIncidents = useMemo(() => state.incidents.filter((i) => {
    const idx = dayIndex(i.ts, startMs);
    return idx >= 0 && idx < totalDays;
  }), [state.incidents, startMs, totalDays]);

  const incidents = useMemo(() => [...windowedIncidents].sort((a, b) => b.ts - a.ts), [windowedIncidents]);

  const lastTs = incidents.length ? incidents[0].ts : startMs;
  /* a "record" már most is min(now, endMs)-re szorítja a rést — a fejszámláló ugyanígy   */
  /* lefagy az Utolsó nap után, nem ketyeg tovább egy már lezárult időszaknál             */
  const since = Math.max(0, Math.min(now, endMs) - lastTs);
  const sinceDays = Math.floor(since / DAY);
  const h = Math.floor((since % DAY) / 3600000);
  const m = Math.floor((since % 3600000) / 60000);
  const s = Math.floor((since % 60000) / 1000);

  const record = useMemo(() => {
    const pts = [startMs, ...windowedIncidents.map((i) => i.ts).sort((a, b) => a - b), Math.min(now, endMs)];
    let max = 0;
    for (let i = 1; i < pts.length; i++) max = Math.max(max, pts[i] - pts[i - 1]);
    return Math.floor(max / DAY);
  }, [windowedIncidents, startMs, endMs, now]);

  const lostMin = windowedIncidents.reduce((a, i) => a + (Number(i.min) || 0), 0);

  const dayBuckets = useMemo(() => {
    const arr = Array.from({ length: totalDays }, (_, i) => ({ day: i, min: 0, n: 0, date: startOfDay(startMs) + i * DAY }));
    windowedIncidents.forEach((i) => {
      const d = arr[dayIndex(i.ts, startMs)];
      d.min += Number(i.min) || 0; d.n += 1;
    });
    return arr;
  }, [windowedIncidents, startMs, totalDays]);

  const offenders = useMemo(() => {
    const map = {};
    windowedIncidents.forEach((i) => { const k = (i.who || "").trim(); if (k) map[k] = (map[k] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [windowedIncidents]);

  const topType = useMemo(() => {
    const map = {};
    windowedIncidents.forEach((i) => { map[i.type] = (map[i.type] || 0) + 1; });
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return null;
    const t = TYPES.find((x) => x.id === entries[0][0]);
    return t ? t.short : entries[0][0];
  }, [windowedIncidents]);

  /* csak az eltelt napok incidensei — a dayBuckets már eleve az időszakra szűrt forrásból */
  /* épül, tehát ez a slice automatikusan konzisztens marad a "tiszta nap" számítással      */
  const windowedCount = dayBuckets.slice(0, elapsedDays).reduce((a, d) => a + d.n, 0);

  /* megkezdett hetekre vetített átlag, nem extrapolált ütem — egyetlen incidens az első   */
  /* héten belül nem ugrik meg a hétszeresére                                              */
  const perWeek = elapsedDays > 0 ? windowedCount / Math.ceil(elapsedDays / 7) : 0;

  const digits = String(sinceDays).padStart(2, "0");

  return {
    startMs, endMs, incidents,
    sinceDays, h, m, s, digits,
    record, totalDays, elapsedDays, closedDays, lostMin,
    dayBuckets, offenders, topType, perWeek,
  };
}
