# uv-Startcheck (SessionStart-Hook)

Einige Skills dieser Library (z. B. [`garch-method`](../garch-method)) führen ihre
Python-Scripts mit [uv](https://docs.astral.sh/uv/) aus. Dieser Hook zeigt beim
Start jeder Claude-Code-Session einen Hinweis, falls uv auf dem Gerät fehlt —
und bleibt still, wenn alles da ist.

## Einrichten (einmalig pro Gerät)

In `~/.claude/settings.json` (bzw. `%USERPROFILE%\.claude\settings.json`) den
folgenden Block in das Top-Level-Objekt einfügen. Falls dort schon ein
`"hooks"`-Schlüssel existiert, nur den `SessionStart`-Eintrag ergänzen.

**Windows (PowerShell-Variante, funktioniert ohne Git Bash):**

```json
"hooks": {
  "SessionStart": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "if (-not (Get-Command uv -ErrorAction SilentlyContinue)) { Write-Output '{\"systemMessage\":\"uv fehlt - wird u.a. vom garch-method-Skill gebraucht. Installation: winget install astral-sh.uv (danach Terminal neu starten)\"}' }",
          "shell": "powershell",
          "timeout": 15,
          "statusMessage": "Prüfe uv-Installation"
        }
      ]
    }
  ]
}
```

**Mac / Linux (Bash-Variante):**

```json
"hooks": {
  "SessionStart": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "command -v uv >/dev/null 2>&1 || echo '{\"systemMessage\":\"uv fehlt - wird u.a. vom garch-method-Skill gebraucht. Installation: curl -LsSf https://astral.sh/uv/install.sh | sh\"}'",
          "timeout": 15,
          "statusMessage": "Prüfe uv-Installation"
        }
      ]
    }
  ]
}
```

Der Hook greift ab der **nächsten** Session (Hooks werden beim Start geladen).

## Abkürzung

Wer den Hinweis nie sehen will, installiert uv einfach direkt:

- **Windows:** `winget install astral-sh.uv`
- **Mac/Linux:** `curl -LsSf https://astral.sh/uv/install.sh | sh`
