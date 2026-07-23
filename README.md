# szabi-monitor

Egy "hány napja nem szakított meg senki munka közben" számláló, horror "kill list"
hangulatban — ki, mikor és mennyi időt lopott el tőled.

A koppintás egy típusra (levél, chat, hívás, meeting, "csak te tudod eldönteni", PROD
incidens) szerkesztő ablakot nyit, ahol megadható az elkövető, az elveszett idő (perc) és
egy megjegyzés, mielőtt a bejegyzés rögzül. Emellett van napi statisztika, egy 42 napos
"éjszaka-térkép" és egy visszamenőleg is szerkeszthető napló (KILL LIST).

Kizárólag kliensoldali, egyetlen React komponensfa — nincs backend, az adatok a böngésző
`localStorage`-ában élnek.

**Élő verzió:** https://pkormoczi.github.io/incident-free/

## Deployment

A `main`-re történő push automatikusan lintel, buildel, és kiteszi az appot GitHub
Pages-re (`.github/workflows/deploy.yml`, GitHub Actions mint Pages build-forrás — nincs
külön `gh-pages` branch). Kézi újrafuttatás az Actions fülön, "Run workflow" gombbal.

## Fejlesztés

```
npm install
npm run dev       # dev szerver forró újratöltéssel
npm run build     # production build a dist/ mappába
npm run preview   # az elkészült build helyi kiszolgálása
npm run lint       # oxlint
```

Nincs teszt-keretrendszer a projektben.

## Tech stack

- [React](https://react.dev/) 19 + [Vite](https://vite.dev/)
- [oxlint](https://oxc.rs/) lintelés (`react`, `oxc` pluginokkal, lásd `.oxlintrc.json`)
- Sima CSS-egyéni-tulajdonságok (`src/szabi-monitor/styles.css`) — nincs CSS-in-JS,
  nincs UI-keretrendszer

A kódstruktúra részletes leírását lásd a [`CLAUDE.md`](./CLAUDE.md) fájlban.
