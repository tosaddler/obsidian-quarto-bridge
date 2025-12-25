# Quarto Bridge TODO

## Immediate setup
- [x] Install dependencies (`npm install`) and ensure `quarto` CLI is available on PATH for spawning commands.
- [x] Run `npm run dev` to confirm esbuild pipeline works; fix any TypeScript or lint errors.
- [x] Audit `manifest.json` (trim id whitespace, confirm minAppVersion, desktop/mobile stance) and align with project folder name.

## Discovery & scope
- [x] Summarize current code: sample plugin scaffold in `src/main.ts` and `src/settings.ts`; no Quarto-specific logic yet.
- [x] Extract key requirements from `OVERVIEW.md` into concise user stories / acceptance criteria.
    - **Project Detection**: Automatically find `_quarto.yml` to set execution context.
    - **Live Preview**: Embed `quarto preview` output in a workspace leaf (iframe).
    - **Render**: Trigger `quarto render` for the active file.
    - **Process Management**: Robustly spawn/kill background CLI processes.
- [x] Identify which features must ship in v1 (preview, render, project detection, syntax filters, cleanup) vs later.
    - **v1**: Project detection, Preview orchestration, Iframe view, Basic commands, Cleanup.
    - **v2**: Lua filters (syntax compat), Create Project wizard, Image path fixing.

## Architecture & design
- [x] Design process orchestration layer for `quarto preview/render` (spawn, log parsing for localhost URL, cleanup on unload).
    - Use `child_process.spawn`.
    - Map project roots to processes.
    - Regex parse stdout for localhost URL.
- [x] Define project detection & caching strategy for `_quarto.yml` roots.
    - Recursive up-search from active file.
- [x] Plan UI surfaces: ribbon/status indicators, preview view (iframe sandbox), commands, settings tab (binary paths, toggles).
    - `QuartoPreviewView` (ItemView) with iframe.
    - Status bar for active server indication.
- [x] Specify Lua filter bundling approach for wikilinks/callouts and how to inject them into CLI calls.
    - (Deferred to v2)

## Implementation steps (v1 draft)
- [x] Replace scaffold commands with Quarto-focused commands (preview current project/file, stop server, render, create project).
- [x] Implement `QuartoRunner`/process registry with cleanup hooks; add status UI for active port.
- [x] Implement `QuartoPreviewView` (iframe) that loads detected preview URL; handle CSP fallbacks.
- [x] Add recursive `_quarto.yml` project root resolver and image path resolver hooks.
- [x] Add settings tab for binary overrides and feature toggles; persist with `loadData/saveData`.

## Quality & release
- [x] Add lint/type checks to CI (or local scripts) and ensure `tsconfig` strictness is appropriate.
- [x] Update `README.md` with usage, commands, permissions, mobile/desktop notes.
- [x] Ensure `versions.json` aligns with `manifest.json`; plan SemVer bumps.
- [x] Draft manual test plan (spawn preview, render failure paths, unload cleanup, cross-platform path normalization).
