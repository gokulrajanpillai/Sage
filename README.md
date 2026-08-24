# Sage

A local-first desktop app: an LLM console, a Markdown note vault, and a
force-directed knowledge graph ("Cosmos"), built on Electron, React, and
TypeScript. Everything runs on your machine — the LLM (via
[Ollama](https://ollama.com)) and speech-to-text (via
[whisper.cpp](https://github.com/ggml-org/whisper.cpp)) are both local
processes; nothing is sent to a remote API.

See [`SPEC.md`](./SPEC.md) for the full, numbered acceptance criteria this
app is built against, and [`NOTES.md`](./NOTES.md) for a running log of
blockers and the workarounds taken along the way.

## Prerequisites

- **Node.js 20+** and **npm** — for building and running the app.
- **[Ollama](https://ollama.com)** — for the LLM console (optional if you only
  want to explore with the mock provider — see [Quickstart](#quickstart)).
- **A whisper.cpp build and a `ggml` model** — for real push-to-talk
  transcription (also optional with the mock provider).
- A working microphone — only needed for real speech-to-text; not required
  for the mock provider or for running the test suite.

## Quickstart (clean clone)

```bash
git clone https://github.com/gokulrajanpillai/Sage.git
cd Sage
npm install
npm run dev
```

This launches the app with whatever `SAGE_PROVIDERS` is set to in your shell.
With no providers installed yet, run with the mock backends instead so you
can explore the UI immediately:

```bash
SAGE_PROVIDERS=mock npm run dev
```

To build a production bundle and run the full verification gate (lint,
token-lint, typecheck, unit tests, build, and end-to-end tests — all e2e runs
force `SAGE_PROVIDERS=mock`, so this works without Ollama, a whisper model,
or a microphone):

```bash
npm run verify
```

## Ollama setup (real LLM console)

1. Install Ollama from [ollama.com](https://ollama.com) and make sure it's
   running (it listens on `http://localhost:11434` by default).
2. Pull at least one model, e.g.:
   ```bash
   ollama pull llama3.2
   ```
3. Run Sage **without** `SAGE_PROVIDERS=mock` (or with a value that doesn't
   contain `mock`). The Console's model picker will list every model Ollama
   reports from `GET /api/tags`, and chat streams token-by-token from
   `POST /api/chat`.
4. If Ollama isn't running, the Console shows a recoverable error banner
   with a **Retry** button instead of crashing — start Ollama and retry.

## whisper.cpp setup (real speech-to-text)

1. Build [whisper.cpp](https://github.com/ggml-org/whisper.cpp) (or install a
   prebuilt `whisper-cli`/`main` binary) and make sure it's on your `PATH`,
   or point Sage at it explicitly:
   ```bash
   export SAGE_WHISPER_BIN=/path/to/whisper-cli
   ```
2. Download a `ggml` model (the base English model is a good default) into
   this repo's `models/` directory:
   ```bash
   curl -L -o models/ggml-base.en.bin \
     https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin
   ```
   (`models/` is gitignored except for a `.gitkeep`, so downloaded models
   never get committed.)
3. Run Sage without the mock provider and hold the push-to-talk button in
   the Console to record; release to transcribe and auto-send.
4. Without a model present, the real-whisper unit test
   (`tests/unit/whisperCpp.test.ts`) skips itself with a message telling you
   where it looked and how to fix it — this is the only test allowed to
   skip.

## Provider selection

Both the LLM and speech-to-text backends are selected by the single
`SAGE_PROVIDERS` environment variable:

- Unset, or any value **not** containing `mock` → real backends
  (`OllamaProvider`, `WhisperCppProvider`).
- Contains `mock` (e.g. `SAGE_PROVIDERS=mock`) → deterministic in-memory
  mocks (`MockLlmProvider`, `MockAudioCapture`/`MockSttProvider`) — no
  network, GPU, model file, or microphone required. This is what the entire
  end-to-end suite runs under.

## Vault location

Notes live as Markdown files with YAML frontmatter in `~/SageVault` by
default. Override it with `SAGE_VAULT_DIR` (used throughout the test suite
to keep tests on temp directories instead of your real notes).

## Project structure

```
src/
  main/       Electron main process — window creation, IPC handlers,
              STT (src/main/stt) and vault (src/main/vault) logic that
              needs Node's fs/child_process, unavailable in the sandboxed
              renderer.
  preload/    contextBridge surface exposed to the renderer as window.sage.
  renderer/   React app — theme tokens, the Console/Vault/Cosmos views,
              Zustand stores, and provider clients that only need fetch
              (LLM) or the bridge (STT/vault).
  shared/     Dependency-free logic needed by both tsc project boundaries
              (currently just the graph index).
scripts/      lint:tokens — fails the build on raw hex/px literals outside
              theme/tokens.ts.
tests/
  unit/       Vitest.
  e2e/        Playwright, driving the built app via the _electron fixture.
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Launch the app in development (electron-vite, HMR). |
| `npm run build` | Production build to `out/`. |
| `npm run lint` | ESLint. |
| `npm run lint:tokens` | Rejects raw hex/px literals in renderer components. |
| `npm run typecheck` | `tsc -b --noEmit` across both TS projects. |
| `npm run test` | Vitest unit tests. |
| `npm run e2e` | Playwright end-to-end tests against the built app. |
| `npm run verify` | The full gate: all of the above, in order. |
