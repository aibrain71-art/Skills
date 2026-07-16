---
name: karpathy
description: Apply Andrej Karpathy's four coding principles — Think Before Coding, Simplicity First, Surgical Changes, Goal-Driven Execution. Invoke when the user says "/karpathy", when reviewing a plan before implementation, or when work has grown complicated and needs a discipline reset.
---

# Karpathy Skill — Four Coding Principles

Source: https://github.com/forrestchang/andrej-karpathy-skills

Apply these four principles to the current task. They bias toward caution over speed — use judgment for trivial tasks.

## Before writing code, run this checklist

**1. Think Before Coding**
- What assumption am I about to make silently? Name it.
- Are there multiple valid interpretations of the ask? If yes, present them.
- Is there a simpler approach than what I'm planning? If yes, propose it.
- Is anything unclear? If yes, stop and ask — don't guess.

**2. Simplicity First**
- Am I adding anything beyond what was asked? Remove it.
- Am I building an abstraction for a single caller? Inline it.
- Am I adding "flexibility" or config nobody requested? Delete it.
- Am I handling errors that can't actually happen? Delete that too.
- Could 200 lines be 50? Rewrite.

Self-test: "Would a senior engineer say this is overcomplicated?" If yes → simplify.

**3. Surgical Changes**
- Am I touching code not strictly required by the request? Don't.
- Am I "improving" adjacent code, comments, or formatting? Stop.
- Am I refactoring something that isn't broken? Stop.
- Does every changed line trace directly to the user's request? It must.
- If I notice unrelated dead code, mention it — don't delete it unless asked.

Orphan rule: remove imports/variables/functions that *my* changes made unused. Don't remove pre-existing dead code unless asked.

**4. Goal-Driven Execution**
- Rewrite the task as a verifiable goal before coding:
  - "Add validation" → "Tests for invalid inputs fail, then pass"
  - "Fix the bug" → "Reproduction test fails, then passes"
  - "Refactor X" → "Tests pass before and after"
- For multi-step work, state a brief plan with verify steps:

  ```
  1. [Step] → verify: [check]
  2. [Step] → verify: [check]
  3. [Step] → verify: [check]
  ```

- Strong success criteria enable independent iteration; weak criteria ("make it work") create churn.

## How to invoke

When this skill fires:

1. Read the user's request and the surrounding context (file diffs, plan, prior messages).
2. Run through the four checklists above. Surface anything that fails: unstated assumptions, hidden complexity, touches outside scope, missing verify criteria.
3. Propose the smallest viable change set. If clarification is needed, ask *before* implementing.
4. If implementing: write the minimum code, verify against the stated goal, stop.

## Conflict resolution

Project-level `CLAUDE.md` rules win over these principles. For example, a project may require defensive validation at boundaries — follow that even if "Simplicity First" would suggest otherwise. Use judgment.
