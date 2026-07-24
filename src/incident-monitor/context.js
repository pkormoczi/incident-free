/* "#me" (vagy "#/me") → 'me', különben 'base'. A kontextus betöltéskor dől el;   */
/* váltáshoz újratöltés kell.                                                       */
export const getContext = () =>
  window.location.hash.replace(/^#\/?/, "").toLowerCase() === "me" ? "me" : "base";
