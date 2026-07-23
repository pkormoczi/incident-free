import { useEffect, useRef, useState } from "react";

/* ---------- persistence: load on mount, save on every change ---------- */
export function usePersistentState(key, defaultState) {
  const [state, setState] = useState(defaultState);
  const [loaded, setLoaded] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const [hasSavedData, setHasSavedData] = useState(false);
  const firstRun = useRef(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get(key);
        if (r && r.value) {
          setState(JSON.parse(r.value));
          setHasSavedData(true);
        }
      } catch {
        /* nincs még mentés, vagy nincs storage */
        if (!window.storage) setStorageOk(false);
      } finally {
        setLoaded(true);
      }
    })();
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    if (firstRun.current) { firstRun.current = false; return; }
    (async () => {
      try { await window.storage.set(key, JSON.stringify(state)); }
      catch { setStorageOk(false); }
    })();
  }, [state, loaded, key]);

  return [state, setState, { loaded, storageOk, hasSavedData }];
}
