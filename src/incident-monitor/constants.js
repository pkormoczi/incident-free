import { DAY, todayISO, addDays } from "./utils.js";

export const KEY = "incident-monitor:v1";

export const TYPES = [
  { id: "mail", label: "„Csak nézz rá egy levélre”", pick: "Levél", short: "Levél", min: 20 },
  { id: "chat", label: "„Gyors kérdés” chaten", pick: "Chat", short: "Chat", min: 10 },
  { id: "call", label: "Telefonhívás", pick: "Hívás", short: "Hívás", min: 15 },
  { id: "meeting", label: "„Csak egy meeting”", pick: "Meeting", short: "Meeting", min: 60 },
  { id: "decision", label: "„Csak te tudod eldönteni”", pick: "„Csak Te tudod”", short: "„Csak Te”", min: 30 },
  { id: "prod", label: "Prod incidens", pick: "PROD Incidens", short: "PROD", min: 120 },
];

export { DAY };

export const DEFAULT_STATE = {
  config: { start: todayISO(), end: addDays(todayISO(), 41) },
  incidents: [],
};
