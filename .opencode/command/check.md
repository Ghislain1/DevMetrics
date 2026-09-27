---
description: Vollständiger Gate-Check für DevMetrics (Typecheck, Build, Security-Scan)
agent: build
---

Führe den kompletten Pre-Commit-Gate-Check für DevMetrics aus und berichte das Ergebnis
als Liste `PASS` / `FAIL` / `SKIP` mit Begründung. Behebe **nichts** eigenmächtig —
melde Befunde und schlage Fixes vor.

## Schritt 1 — Abhängigkeiten

```bash
bun install
```

Wenn `node_modules/.bin/electron-vite` fehlt, ist `package.json` und `bun.lock`
inkonsistent. Das ist ein Befund, kein Fix-Bereich.

## Schritt 2 — Typecheck

```bash
bun run tsc --noEmit
```

**Bekannter Vorzustand**: bricht mit `TS2882` für `import "./style.css"` in
`src/renderer/main.tsx` ab (fehlendes `vite/client`-Typen-Setup). Wenn genau dieser Fehler
allein auftritt, melde ihn als `FAIL (bekannt)` mit dem vorgeschlagenen Fix
`src/renderer/vite-env.d.ts` — nicht als Regression.

## Schritt 3 — Build

```bash
bun run build
```

Prüfe danach, ob die erwarteten Artefakte wirklich entstanden sind:

- `out/main/main.js`
- `out/preload/preload.js`
- `dist/renderer/index.html`

Fehlende Artefakte bei erfolgreichem Exit-Code sind der bekannte electron-vite-Config-Gap
(siehe `AGENTS.md`, Baustelle 1) und gehören als solcher gemeldet.

## Schritt 4 — Security-Scan

Nutze das `grep`-Tool (nicht `rg`, das ist auf dieser Maschine nicht im PATH) mit diesen
Mustern über `src/`. Jeder Treffer ist ein Befund:

| Muster | Schwere |
| --- | --- |
| `nodeIntegration:\s*true` | kritisch — Invariante 1 |
| `contextIsolation:\s*false` | kritisch — Invariante 1 |
| `webSecurity:\s*false` | kritisch |
| `sandbox:\s*false` | hoch |
| `allowRunningInsecureContent` | hoch |
| `exposeInMainWorld` | prüfen: nur serialisierbare Werte, nie `ipcRenderer`/`fs`/`require` |
| `dangerouslySetInnerHTML` | kritisch — Invariante 5 |
| `\beval\s*\(` | kritisch — Invariante 5 |
| `new Function\s*\(` | kritisch — Invariante 5 |
| `shell\.openExternal` | prüfen: Eingabe vorher validiert? |
| `<webview` | kritisch — Invariante 5 |
| `require\s*\(\s*["'\`]node:` | im Renderer verboten |
| `from\s+["'\`]\.\./\.\./(main|preload)` | Renderer darf Main/Preload nicht importieren |

Zusätzlich prüfen, ob der Renderer ausschließlich über `window.electronAPI` geht:
`grep` nach `window.electronAPI` und nach jedem anderen Electron-Zugriff in `src/renderer/`.

## Schritt 5 — Aufgeräumtheit

- `git status --short` — keine Build-Artefakte (`out/`, `dist/`), keine Editor-Artefakte.
- Tote Stellen prüfen: `src/renderer/preload.ts` existiert, ist aber leer und gehört
  gelöscht (Preload ist `src/preload/preload.ts`).

## Ausgabeformat

```
1 Dependencies   PASS
2 Typecheck      FAIL (bekannt) — TS2882 in src/renderer/main.tsx:5
3 Build          FAIL — out/main/main.js fehlt (electron.vite.config.* fehlt)
4 Security       PASS — 0 Treffer
5 Cleanliness    WARN — src/renderer/preload.ts ist leer

Gate: NICHT GRÜN — 1 bekannter Blocker, 1 offene Baustelle
```

Abschließend in einem Satz: Darf der Change committed werden (ja/nein) und warum.
