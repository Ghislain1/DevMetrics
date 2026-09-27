# DevMetrics

Electron-Desktop-App zur Analyse von **Code-Quality-** und **CI/CD-Metriken**. DevMetrics liest
fremde Repositories von der Platte, normalisiert die Kennzahlen und zeigt sie in sieben Views:
Dashboard, Projects, Security, Complexity, Code Smells, Benchmarks, Reports.

> **Status:** frühe Baustufe. Die Views rendern typisierte Platzhalter aus
> `src/renderer/metrics/sample.ts`; Provider, Aggregator und IPC-Vertrag sind in
> `.opencode/docs/architecture.md` beschrieben, aber noch nicht implementiert. Bekannte Lücken
> stehen am [Ende dieses Dokuments](#bekannte-baustellen).

## Stack

| Bereich | Wahl |
| --- | --- |
| Shell | Electron 44 (`contextIsolation: true`, `nodeIntegration: false`) |
| Renderer | React 19 · MUI 9 (`@mui/material` + `@mui/icons-material` + Emotion) |
| Sprache | TypeScript 7, `strict` |
| Build | electron-vite 5 (Main, Preload, Renderer) · Vite 8 |
| Pakete | Bun 1.4 (`bun.lock`) |

## Voraussetzungen

- [Bun](https://bun.com) ≥ 1.4
- Kein globales Node nötig — Bun führt `electron-vite` aus, Electron bringt seine eigene Node-Runtime mit
- Beim ersten `bun install` lädt Bun die Electron-Binary (ca. 100 MB). Hinter einem Firmenproxy:
  `ELECTRON_MIRROR` setzen

## Schnellstart

```bash
bun install
bun run dev
```

`bun run dev` startet Vite auf Port 5173 (`strictPort`) und öffnet das Electron-Fenster.

## Befehle

| Zweck | Befehl |
| --- | --- |
| Dependencies | `bun install` |
| Entwicklung | `bun run dev` |
| Produktionsbuild | `bun run build` |
| Vorschau des Builds | `bun run preview` |
| Typecheck | `bun run tsc --noEmit` |

`bun run tsc --noEmit` ist der **einzige** automatisierte Gate-Check im Repo — es gibt weder Linter
noch Test-Suite. Ein sinnvoller Linter- oder Test-Aufbau ist der erste offene Punkt in der Roadmap.

Build-Output: `out/main/main.cjs` und `out/preload/preload.cjs` (Main + Preload) sowie
`dist/renderer/` (Renderer). Beide Ordner sind gitignored.

## Projektstruktur

| Pfad | Inhalt |
| --- | --- |
| `electron.vite.config.ts` | Einzige Build-Config: Main, Preload, Renderer |
| `src/main/main.ts` | Electron Main: Fenster, App-Lifecycle, Dateisystem-/Prozesszugriff |
| `src/preload/preload.ts` | **Einzige** Brücke: `contextBridge.exposeInMainWorld("electronAPI", ...)` |
| `src/renderer/theme.ts` | Light- und Dark-Theme aus einem Token-Set |
| `src/renderer/hooks/useColorMode.ts` | Modus-State, `localStorage`-Persistenz, Toggle |
| `src/renderer/components/` | `MetricCard`, `SectionCard`, `Sparkline`, `StatusChip`, `ViewState` |
| `src/renderer/views/` | Eine Datei pro Sidebar-Eintrag |
| `src/renderer/metrics/` | `types.ts`, `format.ts` (Einheiten), `status.ts` (Ampel), `sample.ts` (Platzhalter) |
| `.github/workflows/` | CI (Typecheck/Build) und Electron-Security-Scan |
| `.opencode/` | Config, Agents, Commands, Skills, Architektur-Doku |

Der Renderer darf ausschließlich `window.electronAPI` nutzen und importiert **nie** eine Datei aus
`src/main/` oder `src/preload/`.

## Metrik-Pipeline

Jede Kennzahl durchläuft fünf Stationen:

```
Provider → Normalizer → Aggregator → IPC (preload) → View
```

Neue Metriken scaffoldet `/new-metric <Name>` oder der Skill `devmetrics-metric`; beide referenzieren
die Verträge in `.opencode/docs/architecture.md`. Jede Metrik braucht `unit` und `threshold` im
Aggregator, sonst bleibt die Ampel in `src/renderer/metrics/status.ts` auf "Keine Daten".

## Theming

Light und Dark entstehen aus einem Token-Set in `src/renderer/theme.ts`
(`darkTheme`, `lightTheme`, `themes`). `useColorMode` hält den Modus, speichert ihn unter
`devmetrics.colorMode` in `localStorage` und fällt auf `prefers-color-scheme` zurück. Der Button in
der AppBar schaltet um.

Komponenten greifen ausschließlich auf `palette`-Tokens zu, keine Farbliterale — deshalb funktioniert
jede View in beiden Modi ohne Sonderfall.

## Sicherheit

Fünf Invarianten, nicht verhandelbar. Verstoß heißt: `electron-security`-Agent laufen lassen.

1. `contextIsolation: true` und `nodeIntegration: false` bleiben gesetzt.
2. Jede Renderer-Fähigkeit läuft über `contextBridge` in `src/preload/preload.ts`.
3. `exposeInMainWorld` bekommt nur serialisierbare Werte — nie `ipcRenderer`, `fs`, `require` oder
   eine Modulinstanz.
4. Pfade aus dem Renderer werden im Main-Prozess aufgelöst, gegen `..` und Symlinks geprüft und auf
   eine Whitelist von Roots beschränkt.
5. Kein `remote`, kein `<webview>` mit fremden URLs, kein ungeprüftes `shell.openExternal`, kein
   `dangerouslySetInnerHTML`, kein `eval`/`new Function`.

## CI/CD

| Workflow | Trigger | Inhalt |
| --- | --- | --- |
| `.github/workflows/ci.yml` | Push/PR auf `main`, `master` | `bun install --frozen-lockfile` → Typecheck → Build → Artefaktprüfung → Bundle-Budget (1,5 MB) → sauberer Working tree → Build-Output als Artifact |
| `.github/workflows/security.yml` | Push/PR auf `main`, `master` | Grep-Gate auf die fünf Invarianten; Renderer-Muster zusätzlich auf `src/renderer` eingeschränkt |
| `.github/dependabot.yml` | wöchentlich | `bun.lock` gruppiert nach MUI/Emotion, Electron/Vite, TypeScript; dazu `github-actions` |

Ein Packaging-Job fehlt bewusst: ohne `electron-builder` in `package.json` gäbe es nichts zu
veröffentlichen. Sobald das Tooling steht, gehört ein Release-Workflow mit Signatur dazu.

## Agent-Workflow (opencode)

`.opencode/` trägt die Agenten-Werkzeuge des Projekts:

| Werkzeug | Zweck |
| --- | --- |
| `/check` | Vollständiger Gate-Check: Dependencies, Typecheck, Build, Security-Scan, Sauberkeit |
| `/dev` | Toolchain prüfen und Dev-Start vorbereiten |
| `/new-metric <Name>` | Neue Metrik end-to-end scaffolden |
| Agent `electron-security` | Prüft die Main/Preload/Renderer-Grenze (kein Edit-Zugriff) |
| Agent `metric-reviewer` | Prüft Rechenlogik, Einheiten, Aggregation (kein Edit-Zugriff) |
| Skill `devmetrics-metric` | Konventionen der Metrik-Pipeline |

`AGENTS.md` ist die verbindliche Projektanweisung für jeden Agenten — Stack, Konventionen,
Sicherheits-Invarianten und Definition of Done.

## MUI MCP in opencode

[`@mui/mcp`](https://www.npmjs.com/package/@mui/mcp) (v0.1.x) stellt die MUI-Dokumentation und
Code-Generierung als MCP-Server bereit. Damit beantwortet der Agent Fragen zu MUI mit echten,
aktuellen Docs statt mit Trainingsdaten — in einem Projekt, das auf **MUI 9** pinnt, ist das der
Unterschied zwischen einer erfundenen Prop und der realen API.

### Registrieren

In `.opencode/opencode.json` — `mcp` ist ein Objekt, das **direkt nach Servernamen** schlüsselt
(kein `servers`-Wrapper). Schema: <https://opencode.ai/config.json>.

```json
{
    "$schema": "https://opencode.ai/config.json",
    "mcp": {
        "mui": {
            "type": "local",
            "command": ["npx", "-y", "@mui/mcp@latest"],
            "enabled": true
        }
    }
}
```

`command` ist ein Array aus Strings, `type` ist Pflicht. Für den Codegen-Tool zusätzlich nötig:

```json
"environment": { "MUI_RECIPES_API_KEY": "{env:MUI_RECIPES_API_KEY}" }
```

Der Key kommt von <https://console.mui.com/products/recipes/api-keys>; **nicht** in die
`opencode.json` schreiben, sondern als Umgebungsvariable setzen. Die beiden Doku-Tools
funktionieren ohne Key.

**Config wird einmal beim Start gelesen:** nach dem Ändern opencode beenden und neu starten, sonst
läuft die Session mit dem alten Stand.

### Prüfen, ob der Server läuft

```bash
opencode mcp list
```

Der Status muss `connected` zeigen. Alternativ `opencode mcp add mui` für eine globale
Registrierung.

### Beispiel: Doku-Recherche

Prompt:

> Nutze `useMuiDocs` für `@mui/material` und hole die Doku-Seite zu `Chip`. Wie konfiguriere ich
> einen outlined Chip in einer Warnfarbe, und welche Props hat `slotProps` in MUI 9?

Der Agent ruft `useMuiDocs({ sources: ["@mui/material"] })` auf — das liefert nur den Katalog
(URLs + Kurzbeschreibungen) — und danach `fetchDocs(urls)` mit der passenden URL. Daraus entsteht
eine Antwort mit echtem API-Stand. Genau diese Zweischritt-Reihenfolge ist wichtig: `fetchDocs`
allein kennt die URL nicht.

### Beispiel: Komponente generieren

Voraussetzung: `MUI_RECIPES_API_KEY` gesetzt. `generateReactCode` bekommt ein natürlichsprachliches
`prompt` und optional `muiPairing`, das die MUI-Version festnagelt:

```json
{
    "prompt": "SectionCard-ähnliche Karte mit Titel, Status-Chip und LinearProgress",
    "muiPairing": { "material": "v9", "muiX": "v9" }
}
```

Wichtig: **`muiPairing` setzen.** Ohne diesen Parameter bekommt man v9-Code — was hier passt, weil
`package.json` auf `@mui/material ^9.4.0` pinnt. In einem Projekt auf `@mui/material ^7.x` käme
sonst v9-Code in eine v7-Basis. Die Antwort enthält den effektiv angewandten Pairing-Footer; daran
lässt sich prüfen, was wirklich gelaufen ist.

Der gelieferte Code ist ein Vorschlag, kein Diff: Der Agent verwirft in der Regel die mitgelieferte
Entry-Datei (`App.tsx`), benennt Dateien auf die Projektkonvention um und behält den Komponenten-
Body. Wrapper und Pfade werden angepasst, der React-Code selbst nicht.

### Wann es nicht passt

Für das reine Nachschlagen der MUI-API reicht die Websuche — der MCP-Server lohnt sich vor allem,
wiel Code entsteht oder eine API-Frage über mehr als ein paar Zeilen Code hinausgeht. Bei jedem kleinen
`Stack`-Lookup kostet der zusätzliche Kontext Context-Budget.

## Bekannte Baustellen

Kurzfassung, Details und Verifikation in `AGENTS.md`:

1. **Kein Renderer-State.** Die Views rendern `sample.ts`; der Aggregator liefert noch nicht über IPC.
2. **Preload dünn.** `exposeInMainWorld` ist vorhanden, deckt aber nur `getAppName` ab.
3. **Kein Routing.** Der View-Umschalter ist `useState` in `App.tsx`, kein Deep-Linking.
4. **Bundle-Größe.** ~1,17 MB unkomprimiert (MUI plus Emotion); CI hat ein Budget von 1,5 MB gesetzt.
5. **Kein Packaging und kein Test-Setup.**

## Definition of Done

Eine Änderung gilt als fertig, wenn `bun run tsc --noEmit` und `bun run build` durchlaufen, keine
Sicherheits-Invariante verletzt ist, bei Metrik-Arbeit alle fünf Pipeline-Stationen konsistent sind und
`AGENTS.md` nachvollziehbar bleibt. `/check` bildet genau das ab.
