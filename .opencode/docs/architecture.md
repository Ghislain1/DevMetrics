# Architektur — DevMetrics

Stand: Scaffolding. Dieses Dokument beschreibt den **Zielzustand**, nicht den Ist-Stand.
Abweichungen sind in `AGENTS.md` unter *Bekannte Baustellen* festgehalten.

## 1. Prozessmodell

DevMetrics ist eine klassische Electron-Dreiteilung. Jede Station hat exklusiven Zugriff
auf bestimmte Node-Fähigkeiten — das ist die Sicherheitsarchitektur.

```
┌──────────────────────┐   contextBridge   ┌───────────┐   ipcRenderer   ┌──────────────────┐
│  Renderer            │ ────────────────► │  Preload  │ ──────────────► │  Main            │
│  React 19, kein Node │ ◄──────────────── │  schmal   │ ◄────────────── │  fs, child_      │
│  src/renderer/       │   serialisierbar  │  1 API    │   serialisierbar │  process, net    │
└──────────────────────┘                   └───────────┘                 └──────────────────┘
                                                     │                            │
                                                     └──── window.electronAPI ───┘
```

Regeln, die daraus folgen:

- Der Renderer kennt keine Node-Builtins. Was er nicht braucht, darf er nicht sehen.
- Der Preload ist ein **Deklarationsblatt**, keine Logikschicht. Er übersetzt
  `window.electronAPI` in `ipcRenderer.invoke(...)` und zurück.
- Der Main ist die einzige Stelle, die Dateisystem, Prozesse und Netz nutzt. Er validiert
  jeden Pfad, bevor er ihn öffnet.

## 2. Metrik-Pipeline

Jede Metrik durchläuft dieselben fünf Stationen. Eine neue Metrik, die eine Station
überspringt, ist ein Bug — nicht eine Abkürzung.

```
Provider ──► Normalizer ──► Aggregator ──► IPC (preload) ──► View
   │             │             │              │                │
 roht          einheitliche  Kennzahlen    contextBridge    Darstellung
   │           Typen+Einheit  über Zeit    serialisierbar    in der Sidebar-View
   │             │             │              │                │
 lokale Datei   keine Domänen-  keine UI-    kein fs, kein    erbt CSS-Klassen
 CI-Provider    logik          Logik        ipcRenderer      aus style.css
```

### Provider

Ein Provider liest Rohdaten und gibt sie unverändert weiter. Er weiß **nichts** über
Interpretation, Schwellwerte oder Darstellung.

```ts
interface MetricProvider {
    readonly id: string;                  // "local-fs" | "ci-github-actions" | …
    readonly label: string;               // Anzeigename in der UI
    supports(domain: MetricDomain): boolean;
    collect(target: AnalysisTarget): Promise<RawMetric[]>;
}
```

Geplante Provider, in dieser Reihenfolge sinnvoll:

| ID | Quelle | liefert |
| --- | --- | --- |
| `local-fs` | Verzeichnis auf Platte | Zeilen, Dateigrößen, Struktur, lokale Analyseergebnisse |
| `local-git` | `.git` eines analysierten Repos | Historie, Hotspots, Autor-Verteilung |
| `ci-github-actions` | CI-Runs via API | Build-Zeiten, Erfolgsquote, Flaky-Rate |
| `benchmark-runner` | Ergebnisdatei lokaler Benchmarks | Zeitmessungen pro Iteration |

Neue Provider erben von einem Adapter, der Caching, Timeouts und Fehlerisolation kapselt —
damit ein langsamer oder toter Provider nie die UI blockiert.

### Normalizer

Der Normalizer macht Daten verschiedener Provider vergleichbar. Er ist der einzige Ort, an
dem Einheiten entstehen.

```ts
type MetricUnit = "count" | "percent" | "score" | "milliseconds" | "bytes" | "ratio";

interface RawMetric {
    provider: string;
    domain: MetricDomain;
    key: string;                 // "complexity.cyclomatic"
    value: number | string | boolean;
    unit: MetricUnit;            // Einheit IMMER angeben
    sampledAt: string;           // ISO-8601, mit Zeitzone
    scope?: string;              // Datei, Modul oder Repo
}
```

Regeln:

- Prozentwerte immer als Zahl `0…100`, nie als `"87%"`.
- `sampledAt` ist ISO-8601 mit Offset. Ohne Zeitzone ist ein Vergleich über Provider
  hinweg unmöglich.
- Ein Provider, der eine Metrik nicht kennt, liefert sie **nicht** — er erfindet keinen Wert.
  Fehlende Daten sind ein eigener Zustand, kein `0`.

### Aggregator

Der Aggregator rechnet über Zeit und über Scopes. Er ist **rein** — gleiche Eingabe,
gleiches Ergebnis, keine I/O, keine Uhrzeitabhängigkeit.

```ts
interface NormalizedMetric {
    domain: MetricDomain;
    key: string;
    label: string;               // menschenlesbar, für die View
    unit: MetricUnit;
    value: number;
    threshold?: { warn: number; critical: number };   // in derselben Einheit
    delta?: { absolute: number; percent: number };    // gegen Vergleichszeitraum
}

interface MetricSeries {
    key: string;
    unit: MetricUnit;
    points: { sampledAt: string; value: number }[];
}
```

Der Aggregator entscheidet auch den **Ampel-Status** aus `threshold`. Diese Logik liegt
nirgends sonst — Views dürfen nicht selbst Schwellwerte auswerten, sonst zeigt das Dashboard
und der Export unterschiedliche Zahlen.

### IPC

Der Aggregator-Output wandert über `contextBridge`:

```ts
// src/preload/preload.ts
contextBridge.exposeInMainWorld("electronAPI", {
    getAppName: () => "DevMetrics",
    getProjects: (): Promise<Project[]> => ipcRenderer.invoke("projects:list"),
    getMetricSeries: (key: string): Promise<MetricSeries> =>
        ipcRenderer.invoke("metrics:series", key)
});
```

Regeln:

- `invoke` statt `send` — Antworten sind typisiert und Fehler propagieren.
- Nutzlasten sind plain JSON. Keine Klassen, keine `Map`, keine `Buffer`.
- Jeder Channel prüft seine Eingaben **im Main**, nicht im Preload. Der Preload ist vom
  Renderer aus les- und manipulierbar, der Main nicht.
- Rückgabewerte werden typisiert, aber nie als `any` durchgewunken. Fehler werden zu
  `Error`-Objekten normalisiert, die über IPC serialisierbar bleiben.

### View

Die View liest ausschließlich `window.electronAPI` und kennt keine Provider-Namen, keine
Dateipfade und keine Rohformate.

- Eine View pro Sidebar-Eintrag: `Dashboard`, `Projects`, `Security`, `Complexity`,
  `Code Smells`, `Benchmarks`, `Reports`.
- Jede View muss drei Zustände rendern können: **Daten**, **leer** (kein Repo ausgewählt),
  **Fehler** (Provider nicht erreichbar). Aktuell gibt es keinen davon — siehe Baustelle 7.
- Formatierung von Einheiten und Prozenten hat eine gemeinsame Hilfsfunktion, nicht
  sieben Kopien in den Views.

## 3. Metrik-Domänen

| Domäne | View | Typische Metriken | Einheit |
| --- | --- | --- | --- |
| `overview` | Dashboard | Quality Score, aggregierte Kennzahlen | `score` |
| `projects` | Projects | Repo-Liste, letzte Analyse, Commit-Rate | `count` |
| `security` | Security | Findings nach Schweregrad, Vulnerabilities | `count` |
| `complexity` | Complexity | cyclomatic, cognitive, Halstead | `score` |
| `smells` | Code Smells | Duplikate, tote Bedingungen, lange Methoden | `count` |
| `benchmarks` | Benchmarks | Build-Zeit, Bundle-Größe, Regressionen | `milliseconds` / `bytes` |
| `reports` | Reports | Exporte, Trends, Vergleiche | gemischt |

## 4. Abgeleitete Kennzahlen — Definition of Done

Eine neue Metrik gilt als vollständig, wenn **alle fünf** Stationen existieren:

- [ ] Provider liefert `RawMetric` mit `unit` und `sampledAt`
- [ ] Normalizer-Mapping vorhanden, keine Interpretation im Provider
- [ ] Aggregator berechnet Wert, `delta` und ggf. `threshold`
- [ ] Main-Handler + Preload-Funktion in `contextBridge`
- [ ] View rendert Wert, Ampel **und** Leer-/Fehlerzustand
- [ ] Kein Renderer-Code importiert `src/main` oder `src/preload`
- [ ] `unit` und `threshold` in der Domänen-Tabelle dokumentiert

## 5. Offene Architekturfragen

Diese Fragen sind bewusst nicht entschieden. Wer sie beantwortet, dokumentiert es hier.

1. **Persistenz**: Wo liegen Ergebnisse zwischen Sessions? `userData`-JSON, SQLite
   (Bun bringt `bun:sqlite` mit) oder nur im Speicher?
2. **Provider-Konfiguration**: Wo pflegt der Nutzer API-Tokens für CI-Provider? Renderer-
   Formular mit `safeStorage`, oder Konfigurationsdatei?
3. **Cache-Invalidierung**: Wann ist eine Analyse veraltet — Commit-Hash, Zeitfenster
   oder expliziter Refresh?
4. **Vergleichszeitraum**: Zeitreihen brauchen eine Basis. Intervall, Vorperiode oder
   Tag des letzten Releases?
