---
name: devmetrics-metric
description: Use when adding, changing, displaying or reviewing a metric in DevMetrics — neue Metrik, Kennzahl, Dashboard-Karte, Provider, Aggregator, Normalizer, Zeitreihe, Trend, Schwellwert, Ampel. Also for complexity, security findings, code smells, benchmarks and quality score. Enforces the five pipeline stations and the shared metric contract.
---

# DevMetrics-Metrik-Pipeline

Eine Metrik in DevMetrics ist nie ein Wert — sie ist eine Kette. Diese Skill beschreibt die
Konventionen, an die sich jede Metrik hält.

## Die fünf Stationen

```
Provider ──► Normalizer ──► Aggregator ──► IPC (preload) ──► View
```

Bricht eine Station ab, ist die Metrik kaputt. Findest du eine Berechnung, die im
Aggregator steht, obwohl sie im Provider gehört — oder eine Ampel, die die View selbst
auswertet — ist das ein Befund, kein Detail.

Die vollständigen Typ-Verträge stehen in `.opencode/docs/architecture.md` (Abschnitt 2).
Lies die Datei, bevor du Verträge erfindest.

## Station 1 — Provider

Liest Rohdaten. Gibt sie unverändert weiter.

- **Keine** Interpretation, keine Schwellwerte, keine UI-Begriffe. Ein Provider weiß nicht,
  was "kritisch" bedeutet.
- Rückgabe ist `RawMetric` mit `domain`, `key`, `value`, `unit`, `sampledAt`.
- `sampledAt` ist ISO-8601 **mit Zeitzone**. Ohne Offset sind Werte zwischen Providern
  nicht vergleichbar.
- Kann der Provider die Metrik nicht liefern, liefert er sie nicht. Erfinde keinen Wert,
  ersetze nichts durch `0`.

## Station 2 — Normalizer

Macht Daten verschiedener Provider vergleichbar. Einheit für alle.

- Prozent als Zahl `0…100`. Niemals `"87%"`.
- Einheit pro Metrik fix. `MetricUnit` ist eine Union — erweitere sie, statt
  `string` zu nehmen.
- Rohtypen (`string`, `boolean`) hier in Zahlen übersetzen, nicht erst in der View.

## Station 3 — Aggregator

Rechnet über Zeit und Scopes. Rein.

- **Deterministisch**: gleiche Eingabe, gleiches Ergebnis. Kein `Date.now()`, kein
  `new Date()`, kein `Math.random()`, keine I/O, keine `await` im Rechenpfad. Zeit und
  Zufall sind Parameter.
- **Division prüfen**: Nenner `0` abfangen. `0/0` wird nie `NaN` in der UI.
- **Leere Eingabe prüfen**: `Math.max(...[]) === -Infinity`, `Math.min(...[]) === Infinity`.
- **Keine Mittelwert-der-Mittelwerte**. Durchschnitt über Scopes wird aus Summe und
  Grundgesamtheit gebildet, nicht aus Durchschnitten.
- `threshold` wird **hier** gesetzt, mit `unit`. Die View liest nur noch den Status.

## Station 4 — IPC

- `ipcRenderer.invoke` / `ipcMain.handle`, nicht `send`/`on`.
- Eingabevalidierung im **Main**. Der Preload ist vom Renderer aus manipulierbar, der Main
  nicht. Validierung im Preload ist eine Lücke, keine Schicht.
- Jede neue Fähigkeit braucht eine Funktion in `contextBridge` in `src/preload/preload.ts`.
  Braucht die View etwas Neues und steht es nicht dort, ist die Grenze gebrochen.
- Nutzlast plain JSON. Keine Klassen, keine `Map`, keine `Buffer`, kein `NaN`.

## Station 5 — View

- Kennt keine Provider-Namen, keine Dateipfade, keine Rohformate.
- Rendert drei Zustände: **Daten**, **leer** (nichts ausgewählt/analysiert), **Fehler**
  (Provider nicht erreichbar). Alle drei. Im Projekt existiert bislang keiner — jede neue
  Metrik bringt alle drei mit.
- Formatiert Einheit und Prozent über die gemeinsame Hilfsfunktion, nicht inline.
- CSS flach und BEM-lite in `src/renderer/style.css`. Kein Framework, keine CSS-in-JS.

## Definition of Done

- [ ] Provider liefert `RawMetric` inklusive `unit` und `sampledAt`
- [ ] Normalizer-Mapping vorhanden, keine Interpretation im Provider
- [ ] Aggregator berechnet Wert, `delta`, ggf. `threshold` — deterministisch
- [ ] `ipcMain.handle` + Funktion in `contextBridge`
- [ ] View rendert Wert, Ampel, Leerzustand und Fehlerzustand
- [ ] Renderer importiert nichts aus `src/main` oder `src/preload`
- [ ] `unit` und `threshold` in der Domänen-Tabelle in `architecture.md` dokumentiert
- [ ] `bun run tsc --noEmit` zeigt nur den bekannten `TS2882`-Fehler in `src/renderer/main.tsx:5`

## Häufige Fehler

| Fehler | Warum er auffällt |
| --- | --- |
| Schwellwert in der View | Dashboard und Report zeigen verschiedene Ampeln |
| Fehlender Wert als `0` | verfälscht jeden Durchschnitt nach unten |
| `sampledAt` ohne Zeitzone | Serien springen bei Providerwechsel |
| Aggregator liest die Uhr | zwei Läufe, zwei Ergebnisse, kein Test möglich |
| Provider liefert Einheit mit | Aggregator muss es nicht kennen — aber die View schon |
| Nur zwei von drei Zuständen | leere Karten bei Provider-Ausfall, keine Fehlermeldung |

## Vorhandene Views

`Dashboard`, `Projects`, `Security`, `Complexity`, `Code Smells`, `Benchmarks`, `Reports` —
definiert durch die Sidebar in `src/renderer/App.tsx`. Eine neue Metrik ohne eigene View
landet auf dem Dashboard; eine eigene View braucht einen Sidebar-Eintrag.

Wird eine View ergänzt, `AGENTS.md` aktualisieren.
