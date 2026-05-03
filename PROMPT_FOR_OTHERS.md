# Prompt: Slash Commands für eine eigene Skill-Library bauen

Dieser Prompt erstellt zwei globale Claude-Code-Slash-Commands —
`/skill-add` und `/skill-install` — die den Lifecycle einer persönlichen
Skill-Library abdecken: externe Skills aus GitHub vendoren, und Skills
aus der Library in einzelne Projekte installieren.

## TL;DR

Ersetze im Prompt-Block unten zweimal `<OWNER>/<REPO>` durch deinen eigenen
GitHub-Pfad (z. B. `meinuser/Skills`) und paste das Ganze in eine Claude-
Code-Session, die in deinem Skills-Repo geöffnet ist. Claude legt die zwei
Command-Dateien an, committet sie auf einen Feature-Branch, pusht und gibt
dir den Einzeiler zum globalen Aktivieren auf jedem Gerät zurück. Mehr
musst du nicht tun.

## Wie nutzen

1. Forke oder lege dein eigenes Skills-Repo auf GitHub an. Struktur: jedes
   Skill liegt in einem eigenen Top-Level-Ordner mit einer `SKILL.md`,
   deren YAML-Frontmatter mindestens `name` und `description` enthält.
2. Öffne eine Claude-Code-Session in **deinem** Skills-Repo (lokal mit
   `claude` oder auf claude.com/code mit dem Repo verbunden).
3. Ersetze in dem Prompt unten zweimal `<OWNER>/<REPO>` durch deinen
   GitHub-Pfad (z. B. `meinuser/Skills`).
4. Paste den ganzen Block in die Session.

---

```
Ich pflege eine zentrale Sammlung von Claude-Code-Skills in einem GitHub-Repo
und möchte zwei Slash Commands haben, die den Lifecycle meiner Library
abbilden — Skills aus externen GitHub-Quellen aufnehmen, und Skills aus
meiner Library in Projekte installieren.

## Mein Setup

- **Mein Skills-Repo:**   <OWNER>/<REPO>     (z. B. `meinuser/Skills`)
- **Repo-Struktur:** Jedes Skill liegt in einem eigenen Top-Level-Ordner mit
  einer `SKILL.md`. Frontmatter enthält mindestens `name` und `description`.
  Optional: `references/`, `scripts/`.
- **Constraint:** Skills werden NIE global installiert (`~/.claude/skills/`),
  immer nur projekt-lokal in `<projekt>/.claude/skills/`. Slash Commands
  selbst dürfen global liegen (`~/.claude/commands/`), das sind keine Skills.

## Lieferumfang

Lege im aktuellen Repo zwei Dateien unter `commands/` an:

### `commands/skill-add.md`

Slash Command `/skill-add <github-url> [--subpath <pfad>] [--name <override>]`,
der einen externen Skill in MEIN Repo vendoriert.

Verhalten:
1. Erkennt, ob das aktuelle Verzeichnis das Skills-Repo ist; sonst klont er es
   nach /tmp/skills-lib.
2. Default-Branch ermitteln. Existiert er, neuen Feature-Branch
   `vendor/<name>-<timestamp>` anlegen. Existiert nur ein Feature-Branch,
   dort weiterarbeiten und am Ende warnen.
3. Source-Repo flach klonen (`--depth=1`), Upstream-SHA festhalten.
4. SKILL.md finden (`--subpath`, sonst Root, sonst rekursiv suchen; bei
   mehreren Treffern interaktiv fragen; bei keinem abbrechen).
5. Skill-Name ermitteln (Priorität: `--name` > `name:` aus Frontmatter >
   Repo-Name). In lowercase-with-dashes normalisieren.
6. Skill-Ordner ohne `.git/` ins Repo kopieren. Bei Konflikt fragen.
7. `.upstream`-Datei im neuen Skill-Ordner schreiben:
       source_url, source_commit (full SHA), source_path, vendored_at (ISO-8601 UTC)
8. Falls Source-Repo `LICENSE` oder `LICENSE.md` hat, als
   `<skill-name>/LICENSE.upstream` mitkopieren.
9. Commit (Body referenziert source_url + full SHA), push, draft-PR via
   GitHub MCP gegen Default-Branch öffnen.
10. /tmp/skill-source aufräumen.
11. Kurzer Report: Name, Source, SHA, PR-URL, Notable (Lizenz, Runtime-Deps).

Constraints: nie direkt auf main pushen; keine anderen Skills modifizieren;
keinen Skill-Namen erfinden, wenn SKILL.md fehlt — dann abbrechen.

### `commands/skill-install.md`

Slash Command `/skill-install [name|nummer]`, der Skills in das aktuelle
Projekt installiert.

Zwei Modi:

**Browse Mode** (kein Argument oder `list`/`ls`):
1. Default-Branch-Tarball laden:
       curl -sL https://api.github.com/repos/<OWNER>/<REPO>/tarball -o /tmp/skills-lib.tar.gz
       mkdir -p /tmp/skills-lib && tar -xzf /tmp/skills-lib.tar.gz -C /tmp/skills-lib --strip=1
2. Für jeden Top-Level-Ordner mit SKILL.md parsen:
   - Name (aus Frontmatter, Fallback: Ordnername)
   - Beschreibung (aus Frontmatter, auf ~140 Zeichen kürzen)
   - Key Features: Rest der SKILL.md analysieren, 2–4 prägnante Bullet
     Points (≤80 Zeichen) destillieren. Suche nach Sections wie "Features",
     "Capabilities", "What it does"; sonst aus Workflow ableiten.
3. Liste alphabetisch sortiert ausgeben:
       Verfügbare Skills (<OWNER>/<REPO> @ <short-sha>):

       [1] excalidraw-diagram
           Create Excalidraw diagram JSON files...
           • Bullet 1
           • Bullet 2
           • Bullet 3

       Welchen Skill installieren? (Nummer oder Name, oder "abbrechen")
4. Auf Antwort warten, dann in Install Mode wechseln.

**Install Mode** (Argument ist Nummer, Name oder Teilname):
1. Tarball laden (Reuse falls schon entpackt in dieser Turn).
2. Target auflösen: Nummer → alphabetischer Index; exakter Name →
   direkt; partiell → bei Eindeutigkeit ja, sonst Matches zeigen; kein
   Match → Liste zeigen und nochmal fragen.
3. Projekt-Root finden (Walk-up nach: .git, CLAUDE.md, package.json,
   pyproject.toml, Cargo.toml, go.mod). Max 5 Levels. Sonst beim User
   nachfragen.
4. Globale Installs ablehnen: ist der Root `~` oder `/`, abbrechen.
5. `<root>/.claude/skills/` anlegen. Bei existierendem Skill-Folder fragen
   (overwrite/skip/cancel).
6. Skill-Folder aus /tmp/skills-lib/<name>/ ins Ziel kopieren.
7. `.skill-version` schreiben: source, commit (SHA), installed_at (ISO-8601).
8. /tmp/skills-lib.tar.gz löschen, /tmp/skills-lib/ behalten für
   Folge-Installs in derselben Session.
9. Report (3–4 Zeilen): Pfad, Source-Commit, One-Liner-Beschreibung, Setup-
   Hinweis falls Deps (Node, Python, Playwright, etc.) erwähnt.

Constraints:
- NIE in `~/.claude/skills/` installieren — strikt projekt-lokal.
- Keine Dateien außerhalb `<root>/.claude/skills/<name>/` und der
  `.skill-version` modifizieren.
- Bei GitHub-API-Rate-Limit: Fallback auf
  `git clone --depth=1 https://github.com/<OWNER>/<REPO> /tmp/skills-lib`.

## Frontmatter beider Dateien

Setze YAML-Frontmatter mit `description:` und `argument-hint:`. Das ist das
Claude-Code-Slash-Command-Format.

## Nach dem Anlegen

- Dateien committen mit klarer Message.
- Auf Feature-Branch pushen (nicht direkt auf main).
- Mir den Einzeiler ausgeben, mit dem ich (oder andere User) die Commands
  einmalig auf einem Gerät installiere:
      mkdir -p ~/.claude/commands && \
        curl -sL https://raw.githubusercontent.com/<OWNER>/<REPO>/<branch>/commands/skill-add.md -o ~/.claude/commands/skill-add.md && \
        curl -sL https://raw.githubusercontent.com/<OWNER>/<REPO>/<branch>/commands/skill-install.md -o ~/.claude/commands/skill-install.md
  Setz `<branch>` automatisch auf den Branch, auf dem du gepusht hast.

Beginne mit einem 3-Bullet-Plan, bevor du Code schreibst.
```

---

## Was der Empfänger danach hat

| Aktion | Befehl |
|---|---|
| Externen Skill ins eigene Repo aufnehmen | `/skill-add https://github.com/foo/bar` |
| Verfügbare Skills anzeigen | `/skill-install` |
| Skill ins aktuelle Projekt installieren | `/skill-install <name oder nummer>` |

Die Browse-Liste zeigt pro Skill Nummer, Name, Beschreibung und 2–4 Key
Features.
