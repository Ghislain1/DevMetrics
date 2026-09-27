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
| `src/main/main.ts` | Electron Main: Fenster, App-Lifecycle, Dateisystem-/Prozesszugriff |
| `src/preload/preload.ts` | **Einzige** Brücke: `contextBridge.exposeInMainWorld("electronAPI", ...)` |
| `src/renderer/index.html` | Renderer-Entry für Vite |
| `src/renderer/main.tsx` | React-Mount |
| `src/renderer/App.tsx` | Sidebar-Navigation + Views |
| `src/renderer/style.css` | Styles, flach, eine Datei |
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
- CSS-Klassen sind flach und BEM- lite: `app`, `sidebar`, `content`, `cards`, `card`.
  Kein CSS-Framework, keine CSS-in-JS.
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

1. **Build-Config ist inkonsistent.** Die Scripts rufen `electron-vite`, im Root liegt
   aber nur `vite.config.ts` (reines Vite, `root: "src/renderer"`, kein Main-/Preload-Build).
   Eine `electron.vite.config.*` fehlt, `out/main/main.js` existiert zwar im Ordner, wird
   aber von keinem Config erzeugt. Entweder electron-vite-Config anlegen oder die Scripts
   auf `vite` umstellen — nicht beides halb.
2. **Typecheck ist rot.** `bun run tsc --noEmit` bricht ab mit
   `TS2882: Cannot find module or type declarations for side-effect import of './style.css'`
   (`src/renderer/main.tsx:5`). Fix: `src/renderer/vite-env.d.ts` mit
   `/// <reference types="vite/client" />` anlegen.
3. **Toter File.** `src/renderer/preload.ts` ist leer. Der Preload gehört nach
   `src/preload/preload.ts`; die Datei im Renderer löschen.
4. **Kein Dev/Prod-Unterschied.** `src/main/main.ts:30` lädt hart `http://localhost:5173`.
   Im Build fehlt `loadFile` auf `dist/renderer/index.html` sowie
   `ELECTRON_RENDERER_URL` per `process.env`.
5. **App-Lifecycle unvollständig.** Kein `window-all-closed`, kein `activate`-Handler,
   Fenster-Referenz wird nicht gehalten.
6. **README ist veraltet.** Beschreibt `bun init` und `bun run index.ts`; eine
   `index.ts` existiert nicht. Auf die echten Befehle umstellen.
7. **Kein Renderer-State.** `App.tsx` rendert hardcodierte Werte (`87%`, `10`, `4.2`).
   Es gibt noch keine Datenquelle, kein Routing und keine Fehler-/Leerzustände.

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
