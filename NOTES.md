# NOTES

## 2026-08-24 — flaky test found and fixed: "streams tokens and can be stopped"

A post-Phase-6 full re-run caught an intermittent failure in
`tests/e2e/console.spec.ts`: the test clicked Stop immediately after Send,
racing the mock provider's first token (fires after a 40ms interval). If
Stop won the race, the assistant bubble was still empty and the "some
content streamed" assertion failed. Fixed by waiting for the assistant
message to actually contain streamed content *before* clicking Stop
(`expect(...).not.toHaveText('assistant:')` moved ahead of the stop click),
so the test proves "streaming produces visible output" and "stop halts it"
as two ordered facts instead of a race. Re-ran it 5x standalone plus the
full `npm run verify` afterward — stable. Lesson: always re-run the full
suite fresh at the end of a large session rather than trusting only the
per-phase run, since inter-test timing assumptions can hide a race that a
single run won't surface.

## 2026-08-24 — shared pure logic goes in src/shared, not either project

`buildGraph` (Phase 5) needs to be imported by both a `tests/unit` spec
(compiled under the Node-side `tsconfig.node.json`) and `Cosmos.tsx`
(compiled under `tsconfig.web.json`). A raw cross-project relative import
between the two `tsc -b` projects fails with TS6307 ("File X is not listed
within the file list of project Y"). Fix: put dependency-free pure logic in
`src/shared/`, included by both tsconfigs, instead of arbitrarily picking one
side. Same category of fix as the STT/vault process-boundary notes above,
but for logic that has no environment dependency at all rather than one
that's main-only.

## 2026-08-24 — vault filesystem logic also lives in the main process

Same reasoning as the STT note below: `src/main/vault/` (not
`src/renderer/lib/vault/`), because reading/writing/watching `.md` files
needs Node's `fs`. Renderer talks to it via `window.sage.vault.*`. SPEC.md's
Phase 4 criteria 40-41 were corrected to the real paths/commands.

## 2026-08-24 — SttProvider lives in the main process, not the renderer

SPEC.md's Phase 3 criteria originally assumed `src/renderer/lib/stt/...`
(mirroring Phase 2's `LlmProvider`, which works fine in the renderer since it
only needs `fetch`). Speech-to-text's `WhisperCppProvider` needs to spawn a
child process, which requires Node's `child_process` — not available in the
renderer given `contextIsolation: true` / `nodeIntegration: false` (kept as-is
deliberately; weakening those to make the path match would be the wrong
trade). Implementations were placed under `src/main/stt/` instead, exposed to
the renderer via `window.sage.transcribe` (contextBridge + `ipcMain.handle`).
SPEC.md's criteria 28-29 have been corrected to reference the real paths.

Running log of blockers encountered during the build, the workaround taken, and follow-up needed. Newest first.

## 2026-08-24 — push authentication

`gh auth status` shows the active GitHub CLI/credential-manager identity as `gokulrajan-sdc`, not `gokulrajanpillai` (the owner of github.com/gokulrajanpillai/Sage). Local `git config user.name`/`user.email` are already `gokulrajanpillai`, so commit authorship is correct regardless.

Workaround: continue committing locally after every phase as instructed. Attempt `git push` each time; if it is rejected for auth/permission reasons, note the failure here and keep building rather than stopping, then retry the push once the account issue is resolved (user is switching `gh auth login` to the `gokulrajanpillai` account).

Follow-up: once push succeeds, confirm `git rev-parse HEAD origin/main` match for every phase's commit, not just the latest.

**Status at end of Phase 6 (all 7 phases complete locally):** all 7 phase
commits exist on local `main`; `npm run verify` exits 0 with all criteria in
SPEC.md passing except criterion 50 (`HEAD` == `origin/main`), which remains
blocked on the `gokulrajan-sdc` / `gokulrajanpillai` account permission
issue above. No code change can satisfy this — it needs either a `gh auth
login` as `gokulrajanpillai`, an SSH key for that account, or
`gokulrajan-sdc` added as a collaborator on the repo. The instant push
access is granted, `git push -u origin main` from this same local history
should succeed with no further work.

**Resolved 2026-08-24:** rather than waiting on a `gh auth login` account
switch, checked for an existing SSH identity on this machine first —
`ssh -T git@github.com` responded `Hi gokulrajanpillai!`, meaning an SSH key
already authenticated as the right account, entirely independent of the
HTTPS credential manager (which stays pinned to `gokulrajan-sdc`). Switched
`origin` to `git@github.com:gokulrajanpillai/Sage.git` and `git push -u
origin main` succeeded immediately. `git rev-parse HEAD origin/main` now
returns matching hashes (`ec51ec7...`). All 50 SPEC.md criteria, including
50 itself, are now met.

**Confirmed 2026-08-24, end of Phase 0:** `git push -u origin main` failed —
`remote: Permission to gokulrajanpillai/Sage.git denied to gokulrajan-sdc` /
`403`. Local commit `ab85b50` ("feat: scaffold Sage Electron/React/TS app and
verify pipeline") is not yet on `origin/main`; `git rev-parse HEAD origin/main`
does not match. User has chosen to keep building rather than block on this
(decision recorded 2026-08-24: "Keep building, fix push later"). Workaround:
continue committing locally at the end of every phase and retry the push each
time; all local commits are queued and will push as soon as `gh auth login`
(or an equivalent) switches the active account to `gokulrajanpillai`, or
`gokulrajan-sdc` is added as a collaborator on the repo.
