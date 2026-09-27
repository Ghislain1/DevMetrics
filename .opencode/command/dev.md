---
description: Toolchain prüfen und Dev-Start für DevMetrics vorbereiten
agent: build
---

Bereite die Entwicklungsumgebung von DevMetrics vor und starte sie, wenn das möglich ist.

## Schritt 1 — Toolchain

```bash
bun --version
```

Erwartet: Bun 1.4.x. Weiche Bun-Versionen sind ok, melde sie aber.

Prüfe, ob die Binaries aufgelöst sind. Bun legt Shims als `.bunx`/`.exe` an, nicht als
`.cmd` — ein fehlendes `node_modules/.bin/tsc.cmd` ist **kein** Fehler:

```bash
bun pm ls --all 2>&1 | Select-String "electron-vite|vite|typescript|electron"
```

## Schritt 2 — Abhängigkeiten

```bash
bun install
```

Nur ausführen, wenn `node_modules` fehlt oder veraltet ist.

## Schritt 3 — Build-Konfiguration prüfen

Das ist der kritischste Punkt vor jedem Dev-Start. `package.json` ruft `electron-vite dev`,
im Repo-Root liegt aber nur `vite.config.ts` (reines Vite, `root: "src/renderer"`, kein
Main-/Preload-Build). Prüfe:

```bash
Test-Path electron.vite.config.ts
Test-Path electron.vite.config.js
Test-Path out/main/main.js
```

- `electron.vite.config.*` **fehlt** → `bun run dev` wird den Main-Prozess nicht bauen.
  Melde das als Blocker und schlage die `electron.vite.config.ts` vor (siehe
  `AGENTS.md`, Baustelle 1), statt sie ungefragt zu schreiben.
- `out/main/main.js` **fehlt** → es wurde noch nie gebaut. Erwähne, dass
  `src/main/main.ts` derzeit fest `http://localhost:5173` lädt, also ohne Build ohnehin
  ins Leere zeigt.

## Schritt 4 — Typecheck-Baseline

```bash
bun run tsc --noEmit
```

Der Fehler `TS2882` für `import "./style.css"` ist bekannt und blockiert den Dev-Start nicht
(Vite selbst löst das zur Laufzeit auf). Nenne ihn kurz, arbeite dich nicht daran ab.

## Schritt 5 — Start

```bash
bun run dev
```

Dieser Befehl blockiert. Deshalb:

1. Starte ihn **nicht** im Vordergrund — der Renderer-Dev-Server belegt Port 5173 mit
   `strictPort: true` und lässt sich sonst nicht mehr beenden.
2. Gib stattdessen dem Nutzer den Befehl zum selbst Starten und erkläre, was er sehen
   sollte: Electron-Fenster 1400×900, Sidebar mit sieben Views, Dashboard mit vier
   Platzhalter-Karten.
3. Falls ein Portkonflikt auftaucht: Port 5173 ist durch `strictPort` blockiert. Kein
   `lsof`/`netstat`-Aufräumen ohne Freigabe — erst fragen, welcher Prozess ihn hält.

## Ausgabe

Kurze Statusliste: Bun-Version, Install-Stand, electron-vite-Konfiguration vorhanden ja/nein,
bekannter Typecheck-Bekannter, und der exakte Befehl zum Starten inklusive erwarteter
Port-Belegung.
