---
description: Neue Metrik end-to-end durch alle fünf Pipeline-Stationen scaffolden
agent: build
---

Scaffolde die Metrik **$ARGUMENTS** durch alle fünf Stationen der Pipeline.

Lies zuerst `.opencode/docs/architecture.md` (Abschnitt 2 und 4) und
`.opencode/skills/devmetrics-metric/SKILL.md`. Beide enthalten die Verträge — rate nicht.

## Schritt 0 — Klären, bevor du schreibst

Beantworte diese Fragen schriftlich. Wenn eine davon aus der Anfrage nicht hervorgeht,
**frage nach**, statt eine Annahme still einzubauen:

| Frage | Beispiel |
| --- | --- |
| Domäne | `complexity`? `benchmarks`? |
| Key | exakter Punkt-Key, z. B. `complexity.cyclomatic` |
| Einheit | `count` / `percent` / `score` / `milliseconds` / `bytes` / `ratio` |
| Quelle | welcher Provider liefert das? Existiert der schon? |
| Zeitverlauf | braucht die Metrik eine Serie, oder reicht ein Momentanwert? |
| Schwellwerte | `warn` / `critical` in derselben Einheit — bekannt oder Annahme? |

## Schritt 1 — Provider

Erweitere den Provider, der die Daten kennt. Regeln:

- Der Provider liest nur. Keine Interpretation, keine Schwellwerte, keine UI-Begriffe.
- Rückgabe ist `RawMetric` aus `architecture.md` — inklusive `unit` und `sampledAt` (ISO-8601
  **mit** Zeitzone).
- Fehlt der Provider, lege eine Datei nach dem Muster der bestehenden an, statt die Logik
  in den Aggregator zu quetschen.

## Schritt 2 — Normalizer

- Mapping von Rohformat auf `NormalizedMetric`/`MetricSeries`.
- Prozent als Zahl `0…100`, nie als String mit `%`.
- Eine Metrik, die der Provider nicht kennt, wird **nicht** erfunden. Fehlende Daten sind ein
  eigener Zustand, kein `0`.

## Schritt 3 — Aggregator

- Berechnung rein und deterministisch: gleiche Eingabe, gleiches Ergebnis.
- **Keine I/O, kein `Date.now()`, kein `Math.random()` im Rechenpfad.** Zeit kommt als
  Parameter herein.
- Wird dividiert: Nenner auf `0` prüfen. `0/0` darf nicht als `NaN` in die UI.
- Der Aggregator setzt `threshold` und `delta` — die View wertet das **nicht** selbst aus.

## Schritt 4 — IPC

In `src/main/main.ts` den Handler anlegen, in `src/preload/preload.ts` die Funktion:

```ts
ipcMain.handle("metrics:series", async (_event, key: string) => {
    // Eingabe im Main validieren, NICHT im Preload
});
```

- `invoke`, nicht `send`.
- Eingabevalidierung im Main. Der Preload ist vom Renderer aus manipulierbar, der Main nicht.
- Rückgabe plain JSON. Keine Klassen, keine `Map`, keine `Buffer`.
- Alles, was der Renderer braucht, braucht eine Funktion in `contextBridge`. Kommt etwas
  Neues in die View und nicht hier hinein, ist die Grenze gebrochen.

## Schritt 5 — View

- In `App.tsx` die passende Sidebar-View öffnen und die Metrik einhängen.
- Drei Zustände müssen rendern: **Daten**, **leer** (kein Repo ausgewählt), **Fehler**
  (Provider nicht erreichbar). Aktuell existiert keiner davon im Projekt — die neuen drei
  gehören zu dieser Änderung.
- Einheit und Prozent über die gemeinsame Hilfsfunktion formatieren, nicht inline.
- CSS-Klassen flach und BEM-lite, ergänzt in `src/renderer/style.css`. Kein Framework,
  keine CSS-in-JS.

## Schritt 6 — Dokumentieren

- `unit` und `threshold` in die Domänen-Tabelle in `.opencode/docs/architecture.md`.
- Metrik in die Checkbox-Liste in Abschnitt 4 dort abhaken, wenn Stationen fehlen.
- Falls eine neue View oder ein neuer Provider dazukommt: `AGENTS.md` anpassen.

## Schritt 7 — Verifizieren

```bash
bun run tsc --noEmit
```

Erwartet ist aktuell genau ein Fehler (`TS2882` in `src/renderer/main.tsx:5`, bekannt). Jeder
andere Fehler gehört zu dieser Änderung.

Prüfe danach mit dem `grep`-Tool, dass der Renderer nichts aus `src/main` oder `src/preload`
importiert und weiterhin ausschließlich über `window.electronAPI` geht.

## Ausgabe

Schließe mit der Abhakliste aus `architecture.md` Abschnitt 4 ab: fünf Stationen, plus
Einheit, Schwellwert, Leer- und Fehlerzustand. Markiere ehrlich, was noch fehlt.
