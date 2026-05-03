---
description: Vendor an external Claude Code skill from a GitHub URL into the aibrain71-art/Skills repo.
argument-hint: <github-url> [--subpath <pfad>] [--name <override>]
---

You are vendoring an externally-developed Claude Code skill into the user's personal skill library at https://github.com/aibrain71-art/Skills.

User input: $ARGUMENTS

If the input is empty, ask the user for the GitHub URL (and optionally a subpath if the skill isn't at the repo root).

## Steps

1. **Locate the Skills repo.**
   - If the current working directory looks like the Skills repo (contains skill folders with `SKILL.md` plus this very `commands/` directory), use it.
   - Otherwise clone it to `/tmp/skills-lib` (refresh if already there) and `cd` into it.

2. **Pick a working branch.**
   - Detect the default branch with `git remote show origin | sed -n 's/.*HEAD branch: //p'`.
   - If a default branch exists, create a new feature branch: `vendor/<skill-name>-$(date +%s)` from it.
   - If only feature branches exist (no `main` yet), stay on the current branch and warn the user at the end.

3. **Clone the source.** Delete `/tmp/skill-source` if present, then `git clone --depth=1 <url> /tmp/skill-source`. Capture the upstream commit: `git -C /tmp/skill-source rev-parse HEAD`.

4. **Find `SKILL.md`.**
   - With `--subpath`: look there.
   - Otherwise: try repo root first.
   - If none at root, search recursively. If multiple are found, list them and ask the user which to vendor.
   - If none anywhere, abort with a clear error.

5. **Resolve skill name.** Priority: explicit `--name` > `name:` from SKILL.md frontmatter > source repo name. Sanitize to lowercase-with-dashes.

6. **Vendor the files.** Copy the skill directory (excluding `.git/`) to `<skills-repo>/<skill-name>/`. If the target already exists, ask: overwrite / use a different name / cancel.

7. **Write `.upstream` metadata** in the new skill folder:
   ```
   source_url: <url>
   source_commit: <full sha>
   source_path: <subpath or empty>
   vendored_at: <ISO-8601 UTC>
   ```

8. **License handling.** If the source repo has `LICENSE` or `LICENSE.md` at root, copy it as `<skill-name>/LICENSE.upstream`.

9. **Commit.** Stage only the new skill folder. Commit message:
   ```
   Add <skill-name> skill from <owner>/<repo>@<short-sha>

   Vendored from <url>
   Upstream commit: <full sha>
   ```

10. **Push** the branch (`git push -u origin <branch>`).

11. **Open a draft PR** against the default branch via the GitHub MCP tools. If no default branch exists, skip and tell the user.

12. **Cleanup** `/tmp/skill-source`.

13. **Report** in 3-5 bullets:
    - skill name
    - source URL + short SHA
    - branch + PR URL (or "no PR — set a default branch first")
    - anything notable (license, runtime deps like Node/Python, special setup steps)

## Constraints
- Never push to `main` directly — always via a feature branch + PR.
- Never delete or modify other skills in the repo.
- Don't invent a skill name if SKILL.md is missing — abort instead.
