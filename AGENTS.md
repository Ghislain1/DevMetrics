# DevMetrics

Electron-Desktop-App zur Analyse von **Code-Quality-** und **CI/CD-Metriken**.

Stack: Electron 44 · React 19 · TypeScript 7 (`strict`) · electron-vite 5 · Bun 1.4 als Paketmanager.

> Architektur, Metrik-Pipeline und geplante Provider: `.opencode/docs/architecture.md`.
> **Lies diese Datei on demand**, sobald du Provider, Aggregator, IPC oder Views anfässt — nicht vorab.

## Befehle

| Zweck | Befehl |
| --- | --- |
| Dependencies | `bun install` |
| Entwicklung | `bun run dev` (Vite auf Port 5173, `strictPort`) |
| Produktionsbuild | `bun run build` |
| Vorschau | `bun run preview` |
| Typecheck | `bun run tsc --noEmit` |

`bun run tsc --noEmit` ist der **einzige** automatisierte Gate-Check: Es gibt weder Linter
noch Test-Suite (siehe [Baustellen](#bekannte-baustellen)). Wenn du eine hinzufügst, halte
sie im Tasksystem fest und priorisiere sie im Review.

## Struktur

| Pfad | Inhalt |
| --- | --- |
| `electron.vite.config.ts` | Einzige Build-Config: Main, Preload, Renderer |
| `src/main/main.ts` | Electron Main: Fenster, App-Lifecycle, Dateisystem-/Prozesszugriff |
| `src/preload/preload.ts` | **Einzige** Brücke: `contextBridge.exposeInMainWorld("electronAPI", ...)` |
| `src/renderer/index.html` | Renderer-Entry für Vite, trägt die CSP-`meta` |
| `src/renderer/main.tsx` | React-Mount, mountet `App` unter `StrictMode` |
| `src/renderer/theme.ts` | Light- und Dark-Theme aus einem Token-Set, einzige Quelle für Farben und Overrides |
| `src/renderer/hooks/` | `useColorMode.ts`: Modus-State, `localStorage`-Persistenz, Toggle |
| `src/renderer/App.tsx` | `ThemeProvider` + `CssBaseline`, AppBar, Drawer-Navigation, View-Umschalter |
| `src/renderer/components/` | Wiederverwendbare Bausteine: `MetricCard`, `SectionCard`, `Sparkline`, `StatusChip`, `ViewState` |
| `src/renderer/views/` | Eine Datei pro Sidebar-Eintrag |
| `src/renderer/metrics/` | `types.ts`, `format.ts` (Einheiten), `status.ts` (Ampel), `sample.ts` (Platzhalter) |
| `out/` | Build-Output Main + Preload (gitignored) |
| `dist/renderer/` | Build-Output Renderer (gitignored) |

Der Renderer darf ausschließlich `window.electronAPI` nutzen. Er darf **keine** Datei aus
`src/main/` oder `src/preload/` importieren.

## Sicherheits-Invarianten

Diese fünf Punkte sind nicht verhandelbar. Bei Verstoß: `electron-security` Agent laufen lassen.

1. `contextIsolation: true` und `nodeIntegration: false` in `webPreferences` bleiben gesetzt.
2. Jede Renderer-Fähigkeit läuft über `contextBridge` in `src/preload/preload.ts`.
3. `exposeInMainWorld` bekommt nur serialisierbare Werte — nie `ipcRenderer`, `fs`,
   `require` oder eine Modulinstanz. Kein Callback, der Node-Objekte zurückgibt.
4. DevMetrics liest fremde Repos von der Platte: jeder Pfad aus dem Renderer muss im
   Main-Prozess aufgelöst, auf Traversal (`..`) und Symlinks geprüft und auf eine
   Whitelist von Roots beschränkt werden.
5. Kein `remote`-Modul, kein `<webview>` mit fremden URLs, kein `shell.openExternal`
   mit ungeprüften Eingaben, kein `dangerouslySetInnerHTML`, kein `eval`/`new Function`.

## Code-Konventionen

- 4 Leerzeichen Einrückung, doppelte Quotes, Semikolons.
- Builtins als Default-Import: `import path from "node:path";`
- React: Function Components, JSX in `.tsx`, Hooks am Top der Komponente.
- TypeScript: `strict` ist aktiv. Kein `any`, keine nicht-leeren Assertions außer
  `document.getElementById("root")!` im Mount.
- **UI ist MUI 9** (`@mui/material` + `@mui/icons-material` + Emotion). Styling läuft über
  `sx` und `theme.ts` — es gibt keine CSS-Datei und kein CSS-in-JS. Der Renderer
  tree-shakes Icons über Deep-Imports (`@mui/icons-material/DashboardRounded`), nie über
  den Barrel `@mui/icons-material`.
- MUI 9 hat `Stack`-Flexprops (`alignItems`, `justifyContent`, `flexWrap`) und
  `Chip fullWidth` **entfernt** — solche Werte gehören in `sx`.
- Keine Farbliterale in Komponenten und Views: der Renderer läuft in beiden Modi, also
  greifen Komponenten ausschließlich auf `palette`-Tokens zu. Neue Farben kommen als
  weiteres Token in `TOKENS` in `theme.ts`.
- Kommentare sparsam und auf Deutsch oder Englisch. Erkläre **warum**, nicht **was**.

## Metrik-Domänen

Die Sidebar definiert den Funktionsumfang: **Dashboard, Projects, Security, Complexity,
Code Smells, Benchmarks, Reports**. Jede Metrik durchläuft fünf Stationen:

```
Provider → Normalizer → Aggregator → IPC (preload) → View
```

Neue Metriken baust du mit dem Skill `devmetrics-metric` oder dem Command
`/new-metric <Name>`. Beide referenzieren die Verträge in `.opencode/docs/architecture.md`.

## Bekannte Baustellen

Verifiziert am aktuellen Stand des Repos — vor dem Beheben prüfen, ob es noch gilt.

1. **Kein Renderer-State.** Die Views rendern `src/renderer/metrics/sample.ts` — typisierte
   Platzhalter. Der Aggregator liefert noch nicht über IPC, es gibt kein Routing und keine
   Persistenz. `ViewState` und `ViewError` sind vorhanden, werden aber nur in `ProjectsView`
   demonstriert. Nächster Schritt: `sample.ts` durch einen IPC-Client auf
   `window.electronAPI` ersetzen, ohne die Views anzufassen.
2. **Preload ist leer.** `src/preload/preload.ts` enthält noch keinen
   `contextBridge`-Aufruf. Damit fehlt die einzige Brücke zwischen Renderer und Main.
3. **Kein Routing.** Der View-Umschalter ist `useState` in `App.tsx`. Kein
   Deep-Linking, keine View merkt sich ihren Zustand über einen Remount hinweg.
4. **Bundle-Größe.** Der Renderer-Bundle liegt bei ~1,16 MB unkomprimiert. Das ist MUI
   plus Emotion, kein Fehlkonfiguration — aber es lohnt sich, `manualChunks` zu prüfen,
   sobald echte Daten fließen.
5. **README ist veraltet.** Beschreibt `bun init` und `bun run index.ts`; eine
   `index.ts` existiert nicht. Auf die echten Befehle umstellen.

## Definition of Done

Eine Änderung gilt als fertig, wenn:

- `bun run tsc --noEmit` ohne Fehler durchläuft,
- `bun run build` durchläuft,
- keine Sicherheits-Invariante verletzt ist,
- bei Metrik-Arbeit alle fünf Pipeline-Stationen konsistent sind und `unit`/`threshold`
  der neuen Metrik im Aggregator gesetzt sind,
- die Änderung in `AGENTS.md` nachvollziehbar bleibt (neue Views, neue Providers,
  geänderte Befehle).

## opencode-Hilfen in diesem Repo

| Datei | Zweck |
| --- | --- |
| `.opencode/opencode.json` | Projekt-Config, Berechtigungen, Share aus |
| `.opencode/command/check.md` | Vollständiger Gate-Check (Typecheck, Build, Security-Scan) |
| `.opencode/command/dev.md` | Toolchain prüfen und Dev-Start vorbereiten |
| `.opencode/command/new-metric.md` | Neue Metrik end-to-end scaffolden |
| `.opencode/agent/metric-reviewer.md` | Prüft Rechenlogik, Einheiten, Aggregation |
| `.opencode/agent/electron-security.md` | Prüft Main/Preload/Renderer-Grenze |
| `.opencode/skills/devmetrics-metric/SKILL.md` | Metrik-Pipeline-Konventionen |
| `.opencode/docs/architecture.md` | Architektur, IPC-Verträge, geplante Provider |
