---
description: Browse and install skills from the aibrain71-art/Skills library into the current project.
argument-hint: [skill-name | nummer | leer für Liste]
---

You are helping the user install a Claude Code skill from https://github.com/aibrain71-art/Skills into the current project's `.claude/skills/` folder.

User input: $ARGUMENTS

## Two modes

### Browse mode (input is empty or "list" or "ls")

1. **Fetch the catalog.** Download the default-branch tarball:
   ```
   curl -sL https://api.github.com/repos/aibrain71-art/Skills/tarball -o /tmp/skills-lib.tar.gz
   mkdir -p /tmp/skills-lib && tar -xzf /tmp/skills-lib.tar.gz -C /tmp/skills-lib --strip=1
   ```
   Note the SHA from the top-level extracted folder name (or `git ls-remote`) for later reporting.

2. **Parse every top-level folder containing `SKILL.md`.** For each one extract:
   - **Name** — `name:` from frontmatter (fallback: folder name).
   - **Description** — `description:` from frontmatter (truncate to ~140 chars for display).
   - **Key Features** — read the rest of `SKILL.md`. Look for sections titled "Features", "Key Features", "What it does", "Capabilities", or distinctive workflow bullets. Distill 2-4 short bullets, each ≤80 characters. If the SKILL.md has no obvious feature section, infer them from the workflow / sections present.

3. **Render the catalog** exactly like this (numbered, indented bullets, blank line between entries):

   ```
   Verfügbare Skills (aibrain71-art/Skills @ <short-sha>):

   [1] excalidraw-diagram
       Create Excalidraw diagram JSON files that make visual arguments...
       • Brand-customizable color palette in one file
       • Evidence artifacts: real code snippets and JSON payloads
       • Built-in visual validation via Playwright render loop

   [2] another-skill
       …

   Welchen Skill installieren? (Nummer oder Name, oder "abbrechen")
   ```

4. Wait for the user's reply. When they answer with a number or name, switch to install mode using that as the argument.

### Install mode (input is a number, name, or partial name)

1. **Fetch the tarball** as above (skip if already extracted in this turn).

2. **Resolve the target.**
   - Number → skill at that index in the alphabetically-sorted list.
   - Exact name → that folder.
   - Partial name → if exactly one match, use it; if multiple, show the matches and ask.
   - No match → show the catalog and ask again.

3. **Find the project root.** Walk up from `pwd` looking for (in order): `.git`, `CLAUDE.md`, `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`. If none found within 5 levels, ask the user to confirm the install target before proceeding.

4. **Refuse global installs.** If the resolved root is `~` or `/`, abort and explain that this library is project-level only.

5. **Prepare the target.** `mkdir -p <project-root>/.claude/skills/`. If `<project-root>/.claude/skills/<skill-name>/` already exists, ask: overwrite / skip / cancel. On overwrite, remove the old folder first.

6. **Copy the skill folder** from `/tmp/skills-lib/<skill-name>/` into `<project-root>/.claude/skills/<skill-name>/`.

7. **Write `.skill-version`** inside the installed skill folder:
   ```
   source: aibrain71-art/Skills
   commit: <SHA from step 1>
   installed_at: <ISO-8601 UTC>
   ```

8. **Cleanup** `/tmp/skills-lib.tar.gz` (keep `/tmp/skills-lib/` for the rest of this session in case of follow-up installs).

9. **Report** in 3-4 lines:
   - ✓ Installed `<skill-name>` to `.claude/skills/<skill-name>/`
   - Source: `aibrain71-art/Skills@<short-sha>`
   - One-liner: the skill's `description` field
   - Setup hint if the SKILL.md or a `README.md` mentions deps (Node, Python, Playwright, etc.) — otherwise omit

## Constraints
- **Never** install to `~/.claude/skills/` — strictly project-level.
- **Never** modify files outside `<project-root>/.claude/skills/<skill-name>/`.
- If the GitHub API returns a rate-limit error, fall back to `git clone --depth=1 https://github.com/aibrain71-art/Skills /tmp/skills-lib` and continue.
