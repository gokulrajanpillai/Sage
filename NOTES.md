# NOTES

Running log of blockers encountered during the build, the workaround taken, and follow-up needed. Newest first.

## 2026-08-24 — push authentication

`gh auth status` shows the active GitHub CLI/credential-manager identity as `gokulrajan-sdc`, not `gokulrajanpillai` (the owner of github.com/gokulrajanpillai/Sage). Local `git config user.name`/`user.email` are already `gokulrajanpillai`, so commit authorship is correct regardless.

Workaround: continue committing locally after every phase as instructed. Attempt `git push` each time; if it is rejected for auth/permission reasons, note the failure here and keep building rather than stopping, then retry the push once the account issue is resolved (user is switching `gh auth login` to the `gokulrajanpillai` account).

Follow-up: once push succeeds, confirm `git rev-parse HEAD origin/main` match for every phase's commit, not just the latest.
