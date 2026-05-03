# Slash Commands in Claude Code on the web

`/skill-add` und `/skill-install` sind globale Slash Commands. In **Claude
Code (CLI / IDE-Extensions)** liest Claude sie aus `~/.claude/commands/`,
also reicht der einmalige curl-Einzeiler aus dem Repo-Root README.

In **Claude Code on the web** läuft jede Session in einer frischen Sandbox —
das `~/.claude/commands/` deines lokalen Rechners ist dort nicht da.
Lösung: ein SessionStart-Hook im jeweiligen Projekt-Repo, der die zwei
Command-Dateien beim Session-Start in die Sandbox kopiert.

---

## A) Im Skills-Repo selbst

Dieses Repo hat den Hook bereits:

- `.claude/hooks/session-start.sh` — kopiert die Commands aus `commands/`
  ins Sandbox-`~/.claude/commands/`.
- `.claude/settings.json` — registriert den Hook für `SessionStart`.

Sobald du dieses Repo in einer Web-Session öffnest, sind beide Commands
sofort verfügbar.

---

## B) In jedem anderen Projekt (Skills aus diesem Repo nutzen)

Andere Projekte haben die Command-Dateien nicht auf der Platte — sie müssen
sie beim Session-Start aus GitHub holen. Hier das Drop-in:

### 1. Datei `.claude/hooks/install-skill-commands.sh`

```bash
#!/bin/bash
set -euo pipefail

# Skip outside Claude Code on the web — local CLI users manage their own commands.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Branch tracking the skill commands.
BRANCH="main"
BASE="https://raw.githubusercontent.com/aibrain71-art/Skills/${BRANCH}/commands"
DST="$HOME/.claude/commands"

mkdir -p "$DST"
for cmd in skill-add.md skill-install.md; do
  curl -fsSL --max-time 5 "${BASE}/${cmd}" -o "${DST}/${cmd}" || true
done
```

Ausführbar machen: `chmod +x .claude/hooks/install-skill-commands.sh`.

### 2. In `.claude/settings.json` (anlegen oder mergen)

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/install-skill-commands.sh"
          }
        ]
      }
    ]
  }
}
```

Falls dein Projekt schon ein `SessionStart`-Array hat, häng den `hooks`-
Block einfach an die existierende Liste an statt sie zu ersetzen.

### 3. Committen und pushen

Sobald der Hook in deinem Default-Branch liegt, sind `/skill-add` und
`/skill-install` in jeder neuen Web-Session dieses Projekts ab Sekunde 1
verfügbar.

---

## Hinweise

- **Branch:** Die URL zeigt auf `main` (Default-Branch des Skills-Repos).
  Falls du eine andere Branch willst (z. B. zum Testen einer Vorab-Version),
  änder den `BRANCH=`-Wert im Script.
- **Idempotent:** Der Hook überschreibt die Dateien einfach — mehrfaches
  Ausführen ist sicher.
- **Nur Web:** Der `$CLAUDE_CODE_REMOTE`-Check stellt sicher, dass dein
  lokales Setup nie überschrieben wird.
- **Performance:** Zwei kleine `curl`-Calls (~5 KB total). Bei
  Netzwerkproblemen schluckt das `|| true` den Fehler — die Session startet
  trotzdem, nur ohne die Commands.
