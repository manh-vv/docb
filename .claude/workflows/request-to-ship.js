export const meta = {
  name: 'request-to-ship',
  description: 'Take an agreed spec to a GitHub issue, implementation, independent test and a PR',
  whenToUse:
    'After the /ship-request interview has produced a confirmed spec. Agents cannot talk to the user, so the interview happens before this runs.',
  phases: [
    { title: 'Ticket', detail: 'file (or reuse) the GitHub issue' },
    { title: 'Implement', detail: 'branch, code, tests, commits' },
    { title: 'Test', detail: 'independent verification against the acceptance criteria' },
    { title: 'Ship', detail: 'push, PR, CI, optional merge and deploy' },
  ],
}

// args: {
//   title: string,              short issue title
//   type: 'feat' | 'fix' | 'refactor' | 'docs' | 'chore',
//   request: string,            the user's original words
//   spec: string,               markdown agreed in the interview (context, behaviour, out of scope)
//   acceptance: string[],       testable acceptance criteria
//   labels?: string[],          existing repo labels, e.g. ['enhancement']
//   autoMerge?: boolean,        merge and deploy once CI is green (default false)
//   issue?: number,             reuse an existing issue instead of filing one
// }
if (!args || !args.title || !args.spec || !Array.isArray(args.acceptance) || !args.acceptance.length) {
  throw new Error('request-to-ship needs args {title, type, request, spec, acceptance[]}')
}

const MAX_FIX_ROUNDS = 2
const type = args.type || 'feat'
const criteria = args.acceptance.map((c, i) => `${i + 1}. ${c}`).join('\n')
const slug = args.title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 40)
  .replace(/-+$/, '')

const BRIEF = `## Request (user's words)
${args.request || args.title}

## Agreed spec
${args.spec}

## Acceptance criteria
${criteria}`

const COMMIT_RULES = `Commit rules: conventional commit with a gitmoji, matching the repo history (e.g. "feat: :sparkles: ...", "fix: :bug: ...", "test: :white_check_mark: ..."), subject line only unless a body is needed. Use the repo's local git identity as configured (do not change it). End every commit message with a blank line and then:
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Never use em dashes, en dashes or arrows in commit messages, issue or PR text.`

const ISSUE = {
  type: 'object',
  properties: {
    number: { type: 'integer' },
    url: { type: 'string' },
    reused: { type: 'boolean' },
  },
  required: ['number', 'url', 'reused'],
}

const IMPL = {
  type: 'object',
  properties: {
    branch: { type: 'string' },
    summary: { type: 'string', description: 'what changed and why, for the PR body' },
    commits: { type: 'array', items: { type: 'string' } },
    filesChanged: { type: 'array', items: { type: 'string' } },
    concerns: { type: 'array', items: { type: 'string' } },
  },
  required: ['branch', 'summary', 'commits', 'filesChanged', 'concerns'],
}

const VERDICT = {
  type: 'object',
  properties: {
    pass: { type: 'boolean' },
    checks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          ok: { type: 'boolean' },
          detail: { type: 'string' },
        },
        required: ['name', 'ok', 'detail'],
      },
    },
    unmetCriteria: { type: 'array', items: { type: 'string' } },
    problems: { type: 'array', items: { type: 'string' } },
  },
  required: ['pass', 'checks', 'unmetCriteria', 'problems'],
}

const SHIP = {
  type: 'object',
  properties: {
    prNumber: { type: 'integer' },
    prUrl: { type: 'string' },
    ciPassed: { type: 'boolean' },
    merged: { type: 'boolean' },
    deploy: { type: 'string', description: 'deploy run result and URL, or "not merged"' },
    notes: { type: 'string' },
  },
  required: ['prNumber', 'prUrl', 'ciPassed', 'merged', 'deploy', 'notes'],
}

// Ticket
phase('Ticket')
let issue
if (args.issue) {
  issue = await agent(
    `Fetch GitHub issue #${args.issue} in this repo with \`gh issue view ${args.issue} --json number,url,body\`. If its body does not already contain the agreed spec below, add it as a comment with \`gh issue comment\`. Return number, url and reused=true.\n\n${BRIEF}`,
    { label: `issue #${args.issue}`, schema: ISSUE, effort: 'low' },
  )
} else {
  issue = await agent(
    `File a GitHub issue for this work in the current repo with the gh CLI.

First run \`gh issue list --state open --limit 50\` and check for an existing issue that clearly covers the same work. If one does, comment the agreed spec on it and return it with reused=true instead of filing a duplicate.

Otherwise create it with \`gh issue create\`:
- title: ${JSON.stringify(args.title)}
- labels: ${JSON.stringify(args.labels || [])} (only labels that exist, check \`gh label list\`)
- body (pass it with --body-file from a temp file so markdown survives): sections "Request", "Spec", "Acceptance criteria" (as a checklist "- [ ] ..."), copied faithfully from below. Do not invent requirements.

${BRIEF}`,
    { label: 'file issue', schema: ISSUE, effort: 'low' },
  )
}
if (!issue) throw new Error('Could not file or find the GitHub issue')
log(`Issue #${issue.number}${issue.reused ? ' (reused)' : ''}: ${issue.url}`)

const branch = `${type}/${issue.number}-${slug}`

// Implement
phase('Implement')
let impl = await agent(
  `Implement GitHub issue #${issue.number} (${issue.url}) in this repo.

${BRIEF}

Steps:
1. \`git status\` must be clean. Update main (\`git checkout main && git pull --ff-only\`), then create and switch to branch \`${branch}\`.
2. Read the code the change touches before editing. Follow CLAUDE.md (absolute imports, CSS tokens only, React Router links, slice/saga conventions) and match the surrounding code's style.
3. Implement exactly the spec. Do not expand scope; list anything you think is missing under concerns instead.
4. Add or update Vitest tests that cover the acceptance criteria where they are testable.
5. Run \`yarn checkTs\`, \`yarn lint\` and \`yarn test --run\` and fix what fails.
6. Commit in small logical commits on the branch. Do not push. ${COMMIT_RULES}
   Reference the issue in the last commit subject or body ("refs #${issue.number}").

Return the branch, a PR-ready summary, the commit subjects, files changed and any concerns.`,
  { label: `implement #${issue.number}`, schema: IMPL },
)
if (!impl) throw new Error('Implementation agent failed')

// Test, with fix rounds
phase('Test')
let verdict = null
for (let round = 0; round <= MAX_FIX_ROUNDS; round++) {
  verdict = await agent(
    `You are an independent tester. Someone else implemented GitHub issue #${issue.number} on branch \`${impl.branch}\`. Do not trust their summary; verify it yourself. Do not edit or commit anything.

${BRIEF}

Do all of these on branch \`${impl.branch}\` (check it out if needed):
1. \`git diff main...${impl.branch}\`: read the full diff. Note bugs, missed edge cases, scope creep, CLAUDE.md violations (raw <a href> app links, literal colors, missing RootState keys, sagas that can throw and kill docViewerSaga).
2. Run \`yarn checkTs\`, \`yarn lint\`, \`yarn test --run\`, \`yarn build\`. Record each as a check with the relevant failing output.
3. Judge each acceptance criterion as met or unmet from the code and tests, with evidence. If a criterion is user-visible and not covered by a test, use the \`run\` skill to see it in the running app; keep GitHub API calls few (anonymous limit is 60/hour).

pass=true only if every command succeeds, every criterion is met and there are no real bugs. Style nits are not problems.`,
    { label: `test round ${round + 1}`, phase: 'Test', schema: VERDICT },
  )
  if (!verdict) throw new Error('Test agent failed')
  if (verdict.pass) break
  log(`Round ${round + 1}: ${verdict.unmetCriteria.length} unmet criteria, ${verdict.problems.length} problems`)
  if (round === MAX_FIX_ROUNDS) break

  const fix = await agent(
    `Fix the problems an independent tester found on branch \`${impl.branch}\` for GitHub issue #${issue.number}.

${BRIEF}

Failed checks:
${verdict.checks.filter(c => !c.ok).map(c => `- ${c.name}: ${c.detail}`).join('\n') || '- none'}

Unmet criteria:
${verdict.unmetCriteria.map(c => `- ${c}`).join('\n') || '- none'}

Problems:
${verdict.problems.map(p => `- ${p}`).join('\n') || '- none'}

Stay on the branch, verify each problem is real before changing code, fix the real ones, rerun \`yarn checkTs\`, \`yarn lint\`, \`yarn test --run\`, and commit. Do not push. ${COMMIT_RULES}`,
    { label: `fix round ${round + 1}`, phase: 'Test', schema: IMPL },
  )
  if (fix) {
    impl = {
      ...impl,
      commits: impl.commits.concat(fix.commits),
      filesChanged: [...new Set(impl.filesChanged.concat(fix.filesChanged))],
      concerns: impl.concerns.concat(fix.concerns),
    }
  }
}

if (!verdict.pass) {
  log(`Not shipping: tests still failing after ${MAX_FIX_ROUNDS} fix rounds. Branch ${impl.branch} is local and unpushed.`)
  return { shipped: false, issue, impl, verdict }
}

// Ship
phase('Ship')
const ship = await agent(
  `Ship branch \`${impl.branch}\` for GitHub issue #${issue.number}. It has passed independent testing.

1. \`git push -u origin ${impl.branch}\`.
2. Open a PR into main with \`gh pr create --base main --head ${impl.branch}\`, body from a temp file via --body-file:
   - title: conventional style, e.g. "${type}: ${args.title}"
   - body: "Closes #${issue.number}", a short summary, the acceptance criteria as a checked list, how it was tested, then a final line:
     🤖 Generated with [Claude Code](https://claude.com/claude-code)
   Summary to adapt: ${JSON.stringify(impl.summary)}
   Tested: ${JSON.stringify(verdict.checks.map(c => c.name))}
3. Wait for CI: \`gh pr checks <number> --watch --fail-fast\` (Bash timeout 600000). If it fails, read the log with \`gh run view <id> --log-failed\`, report it in notes, set ciPassed=false and stop.
4. ${
    args.autoMerge
      ? `CI is green, so merge: \`gh pr merge <number> --squash --delete-branch\`, then \`git checkout main && git pull --ff-only\`. Find the deploy run for the merge commit with \`gh run list --branch main --workflow deploy.yml --limit 1\` and wait for it with \`gh run watch <id> --exit-status\` (Bash timeout 600000). Report the result and https://manh-vv.github.io/docb/ in deploy.`
      : `Do NOT merge. The user merges after reviewing. Set merged=false and deploy="not merged".`
  }`,
  { label: `ship #${issue.number}`, schema: SHIP },
)

return { shipped: Boolean(ship && ship.ciPassed), issue, impl, verdict, ship }
