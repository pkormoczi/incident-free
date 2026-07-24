import { useCallback, useState } from "react";

const THEME_KEY = "incident-monitor:theme";

/* a kezdőértéket a index.html-beli inline script által a React előtt már            */
/* beállított <html data-theme> attribútumból olvassuk — nincs effekt, nincs villanás */
const readTheme = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

export function useTheme() {
  const [theme, setTheme] = useState(readTheme);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* nincs elérhető storage — a téma csak erre a munkamenetre él */
      }
      return next;
    });
  }, []);

  return [theme, toggleTheme];
}
