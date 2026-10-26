---
name: ship-request
description: Take a feature or bug request from idea to shipped code in docb. Interviews the user until the spec is clear, then runs the request-to-ship workflow (GitHub issue, implement, independent test, PR, optional merge and deploy). Use when the user says /ship-request, or asks to take a request "all the way", "end to end", or "from ticket to ship".
argument-hint: <what you want built or fixed>
---

# Request to ship

Pipeline: **request, interview, GitHub issue, implement, test, ship.**

The interview runs here in the main session, because workflow agents cannot ask the user
anything. Everything after it runs in the `request-to-ship` workflow
(`.claude/workflows/request-to-ship.js`).

## 1. Understand before asking

Read the request (`$ARGUMENTS`). If it is empty, ask what they want.

Before any question, read the code the request touches (CLAUDE.md's architecture section
says where things live). Do not ask what the code already answers. Note the files likely to
change and anything that makes the request harder than it sounds (rate limits, Dexie id
scheme, saga error handling, base path routing).

## 2. Interview

Use `AskUserQuestion` for decisions that are genuinely the user's: behaviour, scope edges,
UX choices, what "done" looks like. Offer concrete options with your recommendation first.
At most 4 questions per round, and stop as soon as the remaining unknowns have sensible
defaults (state those defaults in the spec instead of asking).

Also ask, in the last round:

- **Ship mode**: open a PR and stop for review (recommended), or merge and deploy to
  GitHub Pages automatically once CI is green.

Do not ask about things already settled by CLAUDE.md or the repo (commit style, tooling,
test framework).

## 3. Confirm the spec

Write the spec back in chat, short:

- **Title** (becomes the issue title) and **type** (`feat` | `fix` | `refactor` | `docs` | `chore`)
- **Spec**: context, intended behaviour, explicit out of scope, defaults you chose
- **Acceptance criteria**: a numbered list, each one testable
- **Labels**: from the repo's existing labels (`enhancement`, `bug`, `documentation`, ...)
- **Ship mode**

Ask the user to confirm or correct it. Their confirmation is the approval to file the issue,
push a branch and open a PR. Only the ship mode answer authorizes merging.

## 4. Run the workflow

Check `git status` is clean on `main` first (the workflow works in this checkout; if it is
dirty, ask the user to commit or stash). Then:

```
Workflow({
  name: 'request-to-ship',
  args: {
    title, type, request: '<the user's original words>', spec: '<markdown>',
    acceptance: ['...', '...'], labels: ['enhancement'], autoMerge: false,
    // issue: 12,  // when the user points at an existing issue
  },
})
```

Tell the user it is running and that they should not edit this checkout until it finishes
(they can watch it with `/workflows`).

## 5. Report and finish

When the workflow completes, report from its return value: issue link, branch, PR link, CI
result, test verdict, and any `concerns` the implementer raised.

- `shipped: false` with a failing verdict: show the unmet criteria and problems, and ask how
  to proceed. The branch is local and unpushed.
- PR open, not merged: ask whether to merge. On yes, `gh pr merge <n> --squash
--delete-branch`, pull `main`, and wait for the deploy run with the `watch` skill.
- Merged: confirm the deploy result and the live URL `https://manh-vv.github.io/docb/`.
