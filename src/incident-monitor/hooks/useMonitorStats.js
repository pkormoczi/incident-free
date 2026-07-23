import { useMemo } from "react";
import { DAY, TYPES } from "../constants.js";
import { startOfDay } from "../utils.js";

/* ---------- minden származtatott adat egy helyen: streak, rekord, ---------- */
/* ---------- naptérkép, elkövetők, heti átlag, fő fegyvernem         ---------- */
export function useMonitorStats(state, now) {
  const startMs = useMemo(() => new Date(state.config.start + "T00:00:00").getTime(), [state.config.start]);
  const endMs = useMemo(() => new Date(state.config.end + "T23:59:59").getTime(), [state.config.end]);
  const incidents = useMemo(() => [...state.incidents].sort((a, b) => b.ts - a.ts), [state.incidents]);

  const lastTs = incidents.length ? incidents[0].ts : startMs;
  const since = Math.max(0, now - lastTs);
  const sinceDays = Math.floor(since / DAY);
  const h = Math.floor((since % DAY) / 3600000);
  const m = Math.floor((since % 3600000) / 60000);
  const s = Math.floor((since % 60000) / 1000);

  const record = useMemo(() => {
    const pts = [startMs, ...state.incidents.map((i) => i.ts).sort((a, b) => a - b), Math.min(now, endMs)];
    let max = 0;
    for (let i = 1; i < pts.length; i++) max = Math.max(max, pts[i] - pts[i - 1]);
    return Math.floor(max / DAY);
  }, [state.incidents, startMs, endMs, now]);

  const totalDays = Math.max(1, Math.round((startOfDay(endMs) - startOfDay(startMs)) / DAY) + 1);
  const elapsedDays = Math.min(totalDays, Math.max(0, Math.floor((now - startMs) / DAY) + 1));
  const lostMin = state.incidents.reduce((a, i) => a + (Number(i.min) || 0), 0);

  const dayBuckets = useMemo(() => {
    const arr = Array.from({ length: totalDays }, (_, i) => ({ day: i, min: 0, n: 0, date: startOfDay(startMs) + i * DAY }));
    state.incidents.forEach((i) => {
      const idx = Math.floor((startOfDay(i.ts) - startOfDay(startMs)) / DAY);
      if (idx >= 0 && idx < totalDays) { arr[idx].min += Number(i.min) || 0; arr[idx].n += 1; }
    });
    return arr;
  }, [state.incidents, startMs, totalDays]);

  const offenders = useMemo(() => {
    const map = {};
    state.incidents.forEach((i) => { const k = (i.who || "").trim(); if (k) map[k] = (map[k] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [state.incidents]);

  const topType = useMemo(() => {
    const map = {};
    state.incidents.forEach((i) => { map[i.type] = (map[i.type] || 0) + 1; });
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return null;
    const t = TYPES.find((x) => x.id === entries[0][0]);
    return t ? t.short : entries[0][0];
  }, [state.incidents]);

  const perWeek = elapsedDays > 0 ? (state.incidents.length / elapsedDays) * 7 : 0;

  const digits = String(sinceDays).padStart(2, "0");

  return {
    startMs, endMs, incidents,
    sinceDays, h, m, s, digits,
    record, totalDays, elapsedDays, lostMin,
    dayBuckets, offenders, topType, perWeek,
  };
}
