# Skills

Persönliche Claude-Code-Skill-Bibliothek.

Sammelt eigene und externe Claude-Code-Skills an einem Ort. Skills werden
projekt-lokal in jedes Projekt installiert (`<projekt>/.claude/skills/`),
nie global — so deklariert jedes Projekt selbst, welche Skills es nutzt.

## Verfügbare Skills

| Skill | Beschreibung | Quelle |
|---|---|---|
| [`excalidraw-diagram`](./excalidraw-diagram) | Erzeugt Excalidraw-Diagramme, die visuell argumentieren statt nur darzustellen — mit Brand-Farben, Code-Snippets und Playwright-Render-Validierung. | [coleam00/excalidraw-diagram-skill](https://github.com/coleam00/excalidraw-diagram-skill) |

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
└── README.md                    ← du bist hier
```
