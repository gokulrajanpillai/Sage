# NOTES

Running log of blockers encountered during the build, the workaround taken, and follow-up needed. Newest first.

## 2026-08-24 — push authentication

`gh auth status` shows the active GitHub CLI/credential-manager identity as `gokulrajan-sdc`, not `gokulrajanpillai` (the owner of github.com/gokulrajanpillai/Sage). Local `git config user.name`/`user.email` are already `gokulrajanpillai`, so commit authorship is correct regardless.

Workaround: continue committing locally after every phase as instructed. Attempt `git push` each time; if it is rejected for auth/permission reasons, note the failure here and keep building rather than stopping, then retry the push once the account issue is resolved (user is switching `gh auth login` to the `gokulrajanpillai` account).

Follow-up: once push succeeds, confirm `git rev-parse HEAD origin/main` match for every phase's commit, not just the latest.

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
