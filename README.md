# Skills

Persönliche Claude-Code-Skill-Bibliothek.

Sammelt eigene und externe Claude-Code-Skills an einem Ort. Skills werden
projekt-lokal in jedes Projekt installiert (`<projekt>/.claude/skills/`),
nie global — so deklariert jedes Projekt selbst, welche Skills es nutzt.

## Verfügbare Skills

| Skill | Beschreibung | Quelle |
|---|---|---|
| [`brainstorming`](./brainstorming) | Formt eine Idee vor der Implementierung zu Design und Spec — eine Frage pro Runde, mit Design-Freigabe als Gate. | [obra/superpowers](https://github.com/obra/superpowers) |
| [`context7-cli`](./context7-cli) | Holt aktuelle Bibliotheks-Dokumentation über die `ctx7`-CLI, verwaltet Coding-Skills und konfiguriert Context7 MCP. | [upstash/context7](https://github.com/upstash/context7) |
| [`dispatching-parallel-agents`](./dispatching-parallel-agents) | Verteilt zwei oder mehr voneinander unabhängige Aufgaben auf parallele Subagenten mit je eigenem, gezielt gebautem Kontext. | [obra/superpowers](https://github.com/obra/superpowers) |
| [`excalidraw-diagram`](./excalidraw-diagram) | Erzeugt Excalidraw-Diagramme, die visuell argumentieren statt nur darzustellen — mit Brand-Farben, Code-Snippets und Playwright-Render-Validierung. | [coleam00/excalidraw-diagram-skill](https://github.com/coleam00/excalidraw-diagram-skill) |
| [`executing-plans`](./executing-plans) | Arbeitet einen geschriebenen Implementierungsplan in einer eigenen Session ab, mit Review-Checkpoints. | [obra/superpowers](https://github.com/obra/superpowers) |
| [`feature-dev`](./feature-dev) | Führt Feature-Implementierungen durch einen strukturierten 7-Phasen-Workflow: Codebase-Analyse, Rückfragen, parallele Architektur-Entwürfe, Quality-Review. | [waybarrios/opencode-power-pack](https://github.com/waybarrios/opencode-power-pack) |
| [`finishing-a-development-branch`](./finishing-a-development-branch) | Führt einen fertigen Branch zum Abschluss: Tests prüfen, Umgebung erkennen, Merge/PR/Cleanup zur Auswahl stellen. | [obra/superpowers](https://github.com/obra/superpowers) |
| [`firecrawl-agent`](./firecrawl-agent) | KI-gesteuerte autonome Datenextraktion — navigiert komplexe Sites und liefert strukturiertes JSON nach Schema. ⚿ | [firecrawl/cli](https://github.com/firecrawl/cli) |
| [`firecrawl-cli`](./firecrawl-cli) | Umbrella-Skill: Websuche, Scraping und Seiten-Interaktion über die Firecrawl-CLI. ⚿ | [firecrawl/cli](https://github.com/firecrawl/cli) |
| [`firecrawl-crawl`](./firecrawl-crawl) | Bulk-Extraktion ganzer Websites oder Site-Bereiche, mit Tiefen- und Pfadfiltern. ⚿ | [firecrawl/cli](https://github.com/firecrawl/cli) |
| [`firecrawl-download`](./firecrawl-download) | Lädt ganze Websites als lokale Dateien herunter (Markdown, Screenshots, Multi-Format). ⚿ | [firecrawl/cli](https://github.com/firecrawl/cli) |
| [`firecrawl-interact`](./firecrawl-interact) | Steuert Live-Browser-Sessions: klicken, Formulare, Logins, Pagination, Infinite Scroll. ⚿ | [firecrawl/cli](https://github.com/firecrawl/cli) |
| [`firecrawl-map`](./firecrawl-map) | Listet alle URLs einer Website auf, mit Suchfilter — findet die richtige Seite auf großen Sites. ⚿ | [firecrawl/cli](https://github.com/firecrawl/cli) |
| [`firecrawl-monitor`](./firecrawl-monitor) | Überwacht Webseiten (oder das Web selbst) auf Änderungen — Webhook-/E-Mail-Alerts mit KI-Rauschfilter. ⚿ | [firecrawl/cli](https://github.com/firecrawl/cli) |
| [`firecrawl-parse`](./firecrawl-parse) | Konvertiert lokale Dateien (PDF, DOCX, XLSX …) in sauberes Markdown. ⚿ | [firecrawl/cli](https://github.com/firecrawl/cli) |
| [`firecrawl-scrape`](./firecrawl-scrape) | Extrahiert sauberes Markdown aus beliebigen URLs, inkl. JS-gerenderter SPAs. ⚿ | [firecrawl/cli](https://github.com/firecrawl/cli) |
| [`firecrawl-search`](./firecrawl-search) | Websuche mit Volltext-Extraktion der Ergebnisse statt bloßer Snippets. ⚿ | [firecrawl/cli](https://github.com/firecrawl/cli) |
| [`garch-method`](./garch-method) | Volatilitäts-Forecasting und Position Sizing via Walk-Forward-GARCH(1,1) — Vol-Targeting, Storm/Calm-Regimes, Backtest-Vergleich. Beantwortet "wie viel?", nie "in welche Richtung?". Scripts laufen mit `uv run`. | [milesdeutscher/garchmethod](https://github.com/milesdeutscher/garchmethod) |
| [`grill-me`](./grill-me) | Unerbittliches Interview zum Schärfen eines Plans oder Designs — eine Frage pro Runde (mit empfohlener Antwort), bis jeder Zweig des Entscheidungsbaums geklärt ist. Nur per explizitem Aufruf. | [mattpocock/skills](https://github.com/mattpocock/skills) |
| [`grilling`](./grilling) | Begleit-Skill zu `grill-me` — enthält die eigentliche Interview-Logik der Grilling-Session. Beide zusammen installieren. | [mattpocock/skills](https://github.com/mattpocock/skills) |
| [`karpathy`](./karpathy) | Wendet Andrej Karpathys vier Coding-Prinzipien an: Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution. | [forrestchang/andrej-karpathy-skills](https://github.com/forrestchang/andrej-karpathy-skills) (angepasst) |
| [`markov-hedge-fund-method`](./markov-hedge-fund-method) | Beobachtbares Markov-Regime-Modell für beliebige Ticker: Transitionsmatrix aus 20-Tage-Rolling-Returns, n-Step-Forecast, stationäre Verteilung, Walk-Forward-Backtest (Sharpe, Max Drawdown). Optionales HMM-Upgrade via hmmlearn. | eigener Skill |
| [`notebooklm`](./notebooklm) | Programmatischer Vollzugriff auf Google NotebookLM: Notebooks anlegen, Quellen hinzufügen, Podcasts/Videos/Reports generieren und herunterladen. | [teng-lin/notebooklm-py](https://github.com/teng-lin/notebooklm-py) |
| [`playwright-cli`](./playwright-cli) | Browser-Automatisierung und Web-Tests: navigieren, Formulare ausfüllen, Screenshots erstellen, Playwright-Tests fahren. | [microsoft/playwright-cli](https://github.com/microsoft/playwright-cli) |
| [`receiving-code-review`](./receiving-code-review) | Bewertet Review-Feedback technisch, statt es reflexhaft umzusetzen — erst verifizieren, dann ändern. | [obra/superpowers](https://github.com/obra/superpowers) |
| [`remotion-best-practices`](./remotion-best-practices) | Best Practices für Remotion (Videos programmatisch mit React erzeugen) — Umbrella-Skill mit 7 Unter-Skills: create, render, captions, markup, interactivity, saas, mediabunny. | [remotion-dev/skills](https://github.com/remotion-dev/skills) |
| [`requesting-code-review`](./requesting-code-review) | Schickt einen Reviewer-Subagenten mit gezielt gebautem Kontext los, bevor sich Fehler weiter fortpflanzen. | [obra/superpowers](https://github.com/obra/superpowers) |
| [`subagent-driven-development`](./subagent-driven-development) | Führt einen Plan Task für Task mit je frischem Subagenten aus, danach zweistufiges Review: erst Spec, dann Code-Qualität. | [obra/superpowers](https://github.com/obra/superpowers) |
| [`systematic-debugging`](./systematic-debugging) | Erzwingt Root-Cause-Analyse vor jedem Fix — Symptomfixes gelten als Fehlschlag. | [obra/superpowers](https://github.com/obra/superpowers) |
| [`test-driven-development`](./test-driven-development) | TDD-Disziplin: erst der Test, dann das Scheitern beobachten, dann der minimale Code. | [obra/superpowers](https://github.com/obra/superpowers) |
| [`using-git-worktrees`](./using-git-worktrees) | Sorgt für einen isolierten Workspace — bevorzugt die nativen Worktree-Tools der Umgebung, sonst `git worktree`. | [obra/superpowers](https://github.com/obra/superpowers) |
| [`using-superpowers`](./using-superpowers) | Meta-Skill: verpflichtet Claude, vor jeder Antwort nach passenden Skills zu suchen und sie aufzurufen. | [obra/superpowers](https://github.com/obra/superpowers) |
| [`verification-before-completion`](./verification-before-completion) | Verlangt tatsächlich ausgeführte Verifikationsbefehle, bevor "fertig", "gefixt" oder "grün" behauptet werden darf. | [obra/superpowers](https://github.com/obra/superpowers) |
| [`watch`](./watch) | Schaut Videos (URL oder lokaler Pfad): Download via yt-dlp, Frames via ffmpeg, Transkript aus Captions oder Whisper-Fallback — beantwortet Fragen zum Videoinhalt. | [bradautomates/claude-video](https://github.com/bradautomates/claude-video) |
| [`writing-plans`](./writing-plans) | Schreibt Implementierungspläne für Entwickler ohne Vorkontext: Dateien, Tasks, Tests, Doku — in Häppchen zerlegt. | [obra/superpowers](https://github.com/obra/superpowers) |
| [`writing-skills`](./writing-skills) | Erstellt und überarbeitet Skills nach TDD-Logik, inklusive Test mit Subagenten vor dem Ausrollen. | [obra/superpowers](https://github.com/obra/superpowers) |

⚿ = benötigt die Firecrawl-CLI (`npm i -g firecrawl`) und einen `FIRECRAWL_API_KEY` (Bezahldienst mit Free-Tier).

## Setup

### Slash Commands installieren (einmalig pro Gerät)

Aktiviert die zwei Verwaltungs-Commands `/skill-add` und `/skill-install` in
deinem Claude Code (CLI / VS Code / JetBrains).

**Mac, Linux, WSL, Git Bash:**

```bash
mkdir -p ~/.claude/commands && \
  curl -sL https://raw.githubusercontent.com/aibrain71-art/Skills/main/commands/skill-add.md \
    -o ~/.claude/commands/skill-add.md && \
  curl -sL https://raw.githubusercontent.com/aibrain71-art/Skills/main/commands/skill-install.md \
    -o ~/.claude/commands/skill-install.md && \
  echo "OK"
```

**Windows PowerShell:**

```powershell
$d = "$HOME\.claude\commands"; New-Item -ItemType Directory -Force -Path $d | Out-Null; Invoke-WebRequest "https://raw.githubusercontent.com/aibrain71-art/Skills/main/commands/skill-add.md" -OutFile "$d\skill-add.md"; Invoke-WebRequest "https://raw.githubusercontent.com/aibrain71-art/Skills/main/commands/skill-install.md" -OutFile "$d\skill-install.md"; "OK"
```

### uv-Startcheck einrichten (optional, einmalig pro Gerät)

Einige Skills (z. B. `garch-method`) brauchen [uv](https://docs.astral.sh/uv/).
Ein kleiner SessionStart-Hook zeigt beim Claude-Start einen Hinweis, falls uv
auf dem Gerät fehlt — Anleitung in [`docs/uv-check-hook.md`](./docs/uv-check-hook.md).
Oder uv direkt installieren: `winget install astral-sh.uv` (Windows).

## Nutzung

| Aktion | Befehl in einer Claude-Code-Session |
|---|---|
| Liste aller verfügbaren Skills (mit Beschreibung & Key Features) | `/skill-install` |
| Skill in das aktuelle Projekt installieren | `/skill-install <name oder nummer>` |
| Externen Skill via GitHub-URL in dieses Repo aufnehmen | `/skill-add <github-url>` |

`/skill-install` legt den gewählten Skill in `<aktuelles-projekt>/.claude/skills/<name>/`
an und schreibt eine `.skill-version`-Datei mit Source-Commit für Updates.

`/skill-add` klont die Quelle, vendoriert sie als neuen Top-Level-Ordner, schreibt
`.upstream`-Metadaten und öffnet einen Draft-PR gegen `main`.

## Claude Code on the web

Slash Commands aus `~/.claude/commands/` sind in Web-Sessions nicht
automatisch da. Für **dieses Repo** ist ein SessionStart-Hook konfiguriert
(`.claude/hooks/session-start.sh`), der die Commands beim Session-Start in
die Sandbox kopiert. Für **andere Projekte** ist der Drop-in-Hook unter
[`docs/web-session-snippet.md`](./docs/web-session-snippet.md) dokumentiert.

## Eigene Library bauen

Wenn du dieselbe Setup für dein eigenes Skills-Repo willst (statt dieses zu
forken): [`PROMPT_FOR_OTHERS.md`](./PROMPT_FOR_OTHERS.md) ist ein
self-contained Prompt, den du in eine Claude-Code-Session in deinem eigenen
Repo pasten kannst, um beide Slash Commands automatisch erzeugen zu lassen.

## Repo-Struktur

```
.
├── <skill-name>/                ← jeder Top-Level-Ordner mit SKILL.md ist ein Skill
│   ├── SKILL.md                 ← Frontmatter: name, description (Pflicht)
│   ├── references/              ← optional: Referenz-Docs für den Skill
│   ├── scripts/                 ← optional: Helper-Skripte
│   ├── .upstream                ← Provenance bei vendored Skills
│   └── LICENSE.upstream         ← bei externer Quelle übernommen
├── commands/                    ← Slash Commands (skill-add, skill-install)
├── .claude/
│   ├── hooks/session-start.sh   ← lädt Commands in Web-Sessions
│   └── settings.json            ← registriert den Hook
├── docs/                        ← Snippets & Anleitungen
├── PROMPT_FOR_OTHERS.md         ← teilbarer Setup-Prompt
├── LICENSE                      ← MIT
└── README.md                    ← du bist hier
```

## Lizenz

[MIT](./LICENSE) für eigenen Code in diesem Repo (Slash Commands, Hooks,
Helper-Skripte, Doku).

## Vendoring Policy

Skills aus externen Quellen werden in dieses Repo **kopiert** (vendored), nicht
gelinkt — damit die Library self-contained und ohne Netzwerk nutzbar bleibt.
Damit andere Autor:innen fair behandelt werden, gilt:

1. **Lizenz übernehmen.** Hat das Source-Repo eine `LICENSE`, wird sie als
   `<skill>/LICENSE.upstream` mitkopiert. Sie gilt weiterhin für den Code des
   Skills.
2. **Provenance dokumentieren.** Jedes vendored Skill enthält eine
   `.upstream`-Datei mit Source-URL, exaktem Commit-SHA und Vendor-Datum.
3. **Skills ohne Lizenz** werden mit Attribution vendored, im Bewusstsein, dass
   "keine Lizenz" auf GitHub formal "all rights reserved" bedeutet. Diese
   Library ist klein und persönlich; Verwendung ist Best-Effort. Falls ein:e
   Autor:in widerspricht, wird der entsprechende Skill umgehend entfernt.
4. **Copyleft-Lizenzen** (GPL, AGPL, LGPL) werden grundsätzlich **nicht
   vendored**, um die MIT-Lizenz dieses Repos nicht zu kompromittieren. Falls
   ein solcher Skill gewünscht ist, wird er im README verlinkt statt
   einkopiert.
5. **Kontakt für Lizenz-Anfragen.** Issue im Repo öffnen oder via GitHub
   Profil — Reaktion innerhalb weniger Tage.

`/skill-add` ist so gebaut, dass Punkte 1 und 2 automatisch passieren.
