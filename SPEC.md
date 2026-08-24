# Sage — Specification & Acceptance Criteria

Sage is a local-first desktop app: an LLM console, a Markdown note vault, and a
force-directed knowledge graph ("Cosmos"), built on Electron + React + TypeScript.
This document is the single source of truth for what "done" means. Every
criterion below has a shell command that proves it. Status is updated as each
phase lands; "Result" is filled in with the actual command output once verified.

Run `npm run verify` for the umbrella check (`lint && lint:tokens && typecheck
&& test && build && e2e`). All e2e runs with `SAGE_PROVIDERS=mock` so no GPU,
Ollama install, or microphone is required.

---

## Phase 0 — Scaffold

1. **SPEC.md exists and is tracked.**
   `test -f SPEC.md && git ls-files SPEC.md`
   Result: ✅ tracked as of commit `ab85b50`.

2. **Electron 33 is a project dependency.**
   `node -p "require('./package.json').devDependencies.electron"` → matches `^33`
   Result: ✅ `^33.0.2` (installed 33.4.11).

3. **React 18 is a project dependency.**
   `node -p "require('./package.json').dependencies.react"` → matches `^18`
   Result: ✅ `^18.3.1`.

4. **TypeScript strict mode is enabled** in both project configs.
   `grep -l '"strict": true' tsconfig.node.json tsconfig.web.json`
   Result: ✅ both files matched.

5. **Vite (via electron-vite) is the build tool.**
   `node -p "require('./package.json').devDependencies.vite"` and
   `node -p "require('./package.json').devDependencies['electron-vite']"`
   Result: ✅ `^5.4.8` / `^2.3.0`.

6. **Tailwind is wired for the renderer.**
   `test -f tailwind.config.js && grep -q tailwindcss postcss.config.js`
   Result: ✅ both present; renderer imports `@tailwind base/components/utilities`.

7. **Zustand is a project dependency.**
   `node -p "require('./package.json').dependencies.zustand"`
   Result: ✅ `^4.5.5`.

8. **Vitest runs unit tests.**
   `npx vitest run --reporter=basic`
   Result: ✅ `tests/unit/lintTokens.test.ts (4 tests) — 1 passed (1), 4 passed (4)`.

9. **Playwright drives Electron via the `_electron` fixture.**
   `grep -rl "_electron" tests/e2e`
   Result: ✅ `tests/e2e/fixtures.ts`.

10. **`npm run verify` exists and is the full gate.**
    `node -p "require('./package.json').scripts.verify"` →
    `lint && lint:tokens && typecheck && test && build && e2e`
    Result: ✅ matches exactly.

11. **The app builds and boots to a window titled "Sage".**
    `npm run build && npx playwright test tests/e2e/app.spec.ts`
    Result: ✅ build emits `out/main`, `out/preload`, `out/renderer`;
    `tests/e2e/app.spec.ts › launches and shows the Sage window` — 1 passed.

**Phase 0 `npm run verify`: exit 0** (lint clean, lint:tokens clean, typecheck
clean, 4/4 unit tests, build clean, 1/1 e2e). Committed as `ab85b50`; push to
`origin/main` blocked — see NOTES.md.

---

## Phase 1 — Design tokens & app shell

12. **`tokens.ts` defines the near-black background `#04070d`.**
    `grep -q "#04070d" src/renderer/theme/tokens.ts`

13. **`tokens.ts` defines a cyan accent and an amber accent.**
    `grep -q accentCyan src/renderer/theme/tokens.ts && grep -q accentAmber src/renderer/theme/tokens.ts`

14. **`tokens.ts` defines a monospace numeral font stack.**
    `grep -q "fonts.numeric\|numeric:" src/renderer/theme/tokens.ts`

15. **Concentric-arc and scanline visual tokens/components exist and are original (no third-party or trademarked art).**
    `test -f src/renderer/components/ConcentricArcs.tsx && test -f src/renderer/components/Scanlines.tsx && ! find src/renderer -iname "*.png" -o -iname "*.jpg" -o -iname "*.ttf" | grep .`

16. **The app shell has a left rail that switches Console / Vault / Cosmos.**
    `npx playwright test tests/e2e/appShell.spec.ts -g "left rail"`

17. **The active view persists across a full app restart.**
    `npx playwright test tests/e2e/persistence.spec.ts -g "persists across restart"`

18. **`lint:tokens` fails on a raw hex literal in a component.**
    `npx vitest run tests/unit/lintTokens.test.ts -t "flags a raw hex"`

19. **`lint:tokens` fails on a raw px literal in a component.**
    `npx vitest run tests/unit/lintTokens.test.ts -t "flags a raw px"`

20. **`lint:tokens` passes against the actual current source tree.**
    `npm run lint:tokens`

---

## Phase 2 — LLM console

21. **`LlmProvider` interface exists with `Ollama` and `Mock` implementations.**
    `grep -q "interface LlmProvider" src/renderer/lib/llm/types.ts && test -f src/renderer/lib/llm/OllamaProvider.ts && test -f src/renderer/lib/llm/MockLlmProvider.ts`

22. **Provider selection is controlled by `SAGE_PROVIDERS`.**
    `grep -rq "SAGE_PROVIDERS" src/renderer/lib/llm`

23. **`OllamaProvider` lists models via `GET /api/tags` and streams via `POST /api/chat` against `localhost:11434`.**
    `grep -q "/api/tags" src/renderer/lib/llm/OllamaProvider.ts && grep -q "/api/chat" src/renderer/lib/llm/OllamaProvider.ts && grep -q "11434" src/renderer/lib/llm/OllamaProvider.ts`

24. **Console streams assistant tokens incrementally and exposes a stop control.**
    `npx playwright test tests/e2e/console.spec.ts -g "streams tokens and can be stopped"`

25. **The model picker persists the selected model across restart.**
    `npx playwright test tests/e2e/console.spec.ts -g "model selection persists"`

26. **An offline/unreachable provider surfaces a recoverable error state (not a crash).**
    `npx playwright test tests/e2e/console.spec.ts -g "offline error is recoverable"`

27. **Conversation history is persisted to disk and reloaded on restart.**
    `npx playwright test tests/e2e/console.spec.ts -g "history persists"`

---

## Phase 3 — Speech-to-text

28. **`SttProvider` interface exists with `WhisperCpp` and `Mock` implementations.**
    `grep -q "interface SttProvider" src/renderer/lib/stt/types.ts && test -f src/renderer/lib/stt/WhisperCppProvider.ts && test -f src/renderer/lib/stt/MockSttProvider.ts`

29. **`WhisperCppProvider` spawns `whisper.cpp` against a `ggml` model under `models/`.**
    `grep -q "models" src/renderer/lib/stt/WhisperCppProvider.ts && grep -q "ggml" src/renderer/lib/stt/WhisperCppProvider.ts`

30. **Push-to-talk capture shows a live waveform.**
    `test -f src/renderer/components/Waveform.tsx`

31. **A completed transcript is inserted as the user turn and auto-sent to the LLM.**
    `npx playwright test tests/e2e/stt.spec.ts -g "transcript becomes a user turn and is auto-sent"`

32. **Per-utterance transcription latency is recorded.**
    `grep -rq "transcriptionLatencyMs" src/renderer`

33. **A 3-second WAV fixture is checked in.**
    `test -f tests/fixtures/sample-3s.wav`

34. **The real whisper.cpp test skips with a clear message when the model file is absent (this is the only permitted skip).**
    `npx vitest run tests/unit/whisperCpp.test.ts 2>&1 | grep -qi "skip"`

---

## Phase 4 — Vault (notes)

35. **Notes are Markdown with YAML frontmatter (`title`, `created`, `updated`, `tags`) that round-trips unchanged.**
    `npx vitest run tests/unit/notes.test.ts -t "frontmatter round-trips"`

36. **`[[wikilink]]` parsing reports unresolved links rather than dropping them.**
    `npx vitest run tests/unit/notes.test.ts -t "unresolved wikilinks are reported"`

37. **Extracting notes from a conversation turn writes one file per note, with inferred tags, and never overwrites an existing file.**
    `npx vitest run tests/unit/noteExtraction.test.ts`

38. **The Vault view has a file tree, Markdown preview, tag filter, and backlinks panel.**
    `npx playwright test tests/e2e/vault.spec.ts -g "file tree, preview, tag filter and backlinks"`

39. **The Vault view watches the vault directory and reflects external file changes.**
    `npx playwright test tests/e2e/vault.spec.ts -g "file watcher reflects external changes"`

40. **The default vault location is `~/SageVault`, overridable for tests.**
    `grep -rq "SageVault" src/renderer/lib/vault && grep -rq "SAGE_VAULT_DIR" src/renderer/lib/vault`

41. **All vault tests operate on temp directories, never the real vault.**
    `grep -rLq "SageVault" tests/unit/notes.test.ts tests/unit/noteExtraction.test.ts tests/e2e/vault.spec.ts`

---

## Phase 5 — Cosmos (graph)

42. **A graph index treats notes as nodes and wikilinks + shared tags as edges.**
    `npx vitest run tests/unit/graphIndex.test.ts`

43. **Cosmos renders the graph on canvas via `d3-force`, with pan, zoom, hover labels, and click-to-open-in-Vault.**
    `grep -q "d3-force" src/renderer/views/Cosmos.tsx && npx playwright test tests/e2e/cosmos.spec.ts -g "click opens the note in Vault"`

44. **Cosmos uses original star-field styling (no third-party or trademarked assets).**
    `test -f src/renderer/components/StarField.tsx && ! find src/renderer -iname "*.png" -o -iname "*.jpg" | grep .`

45. **A synthetic 500-node vault renders its first Cosmos frame in under 2000ms.**
    `npx playwright test tests/e2e/cosmosPerf.spec.ts -g "500-node first frame under 2000ms"`

---

## Phase 6 — Telemetry & docs

46. **The Console telemetry strip shows tokens/sec, time-to-first-token, transcription latency, note count, and the selected model.**
    `npx playwright test tests/e2e/telemetry.spec.ts`

47. **README documents prerequisites, Ollama setup, whisper model download, and a clean-clone quickstart.**
    `grep -qi "prerequisites" README.md && grep -qi "ollama" README.md && grep -qi "whisper" README.md && grep -qi "quickstart" README.md`

---

## Whole-project gates (checked every phase)

48. **No skipped tests except the whisper-model guard (criterion 34).**
    `npx vitest run 2>&1 | grep -i skip; npx playwright test 2>&1 | grep -i skip`

49. **No outstanding TODO/FIXME markers in source.**
    `grep -rn "TODO\|FIXME" src/`  → no output

50. **Local `main` equals `origin/main`.**
    `git rev-parse HEAD origin/main`  → both hashes identical

---

## Status log

| Phase | Criteria | Status | Last `npm run verify` result |
|-------|----------|--------|-------------------------------|
| 0 | 1–11 | done (push pending) | exit 0 — see Phase 0 results above |
| 1 | 12–20 | not started | — |
| 2 | 21–27 | not started | — |
| 3 | 28–34 | not started | — |
| 4 | 35–41 | not started | — |
| 5 | 42–45 | not started | — |
| 6 | 46–50 | not started | — |

See `NOTES.md` for blockers and workarounds encountered along the way.
