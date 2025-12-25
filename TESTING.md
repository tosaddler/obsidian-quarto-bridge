# Manual Test Plan for Obsidian Quarto Bridge

This document outlines the manual testing procedures to verify the functionality of the Obsidian Quarto Bridge plugin.

## 1. Environment Setup
- [ ] **OS**: Test on macOS (primary), Windows (if available), Linux (if available).
- [ ] **Dependencies**: Ensure Quarto CLI is installed (`quarto --version`).
- [ ] **Vault**: Create a fresh Obsidian vault or use a test vault.
- [ ] **Project**: Create a sample Quarto project structure:
    ```
    Vault/
    ├── QuartoProject/
    │   ├── _quarto.yml
    │   ├── index.qmd
    │   └── chapter1.qmd
    └── NonProject/
        └── note.md
    ```

## 2. Core Functionality Tests

### 2.1 Project Detection
- [ ] **Scenario**: Open `QuartoProject/index.qmd` and run "Preview Project".
    - **Expected**: Plugin detects `_quarto.yml` in the parent folder and starts the preview.
- [ ] **Scenario**: Open `QuartoProject/chapter1.qmd` (nested file) and run "Preview Project".
    - **Expected**: Plugin recursively finds `_quarto.yml` in the parent folder.
- [ ] **Scenario**: Open `NonProject/note.md` and run "Preview Project".
    - **Expected**: Plugin shows a Notice: "No _quarto.yml found...".

### 2.2 Preview Orchestration
- [ ] **Scenario**: Start Preview for `QuartoProject`.
    - **Expected**: 
        - Notice "Starting Quarto preview..." appears.
        - A new pane opens with the title "Quarto Preview".
        - The content of `index.qmd` (rendered HTML) is visible in the iframe.
        - Notice "Quarto Preview Ready!" appears once the server is listening.
- [ ] **Scenario**: Edit `index.qmd` and save.
    - **Expected**: The preview pane auto-refreshes (handled by Quarto's internal watcher/socket, verified if iframe allows it). *Note: Quarto's default socket might need `allow-same-origin`.*

### 2.3 Process Management
- [ ] **Scenario**: Run "Stop Preview Server".
    - **Expected**: Notice "Stopped all Quarto preview servers." appears. The preview pane might stop updating or show a connection error if refreshed.
- [ ] **Scenario**: Start Preview, then close Obsidian completely.
    - **Expected**: The `quarto` process should be terminated by the OS or plugin's unload hook (check Activity Monitor/Task Manager).
- [ ] **Scenario**: Start Preview, then disable the plugin in Settings.
    - **Expected**: The `quarto` process should be killed.

### 2.4 Settings & Configuration
- [ ] **Scenario**: Change "Quarto Binary Path" to an invalid path (e.g., `/bin/fakequarto`).
    - **Expected**: Running "Preview Project" shows an error notice (e.g., "spawn /bin/fakequarto ENOENT").
- [ ] **Scenario**: Change "Quarto Binary Path" to a valid absolute path (e.g., `/usr/local/bin/quarto`).
    - **Expected**: Preview starts successfully.

## 3. Edge Cases & Error Handling

### 3.1 Path Handling
- [ ] **Scenario**: Create a project in a folder with spaces: `Vault/My Quarto Project/_quarto.yml`.
    - **Expected**: Preview starts correctly (paths are quoted/escaped properly).
- [ ] **Scenario**: Create a project deep in the vault: `Vault/A/B/C/Project/_quarto.yml`.
    - **Expected**: Recursive detection finds the root correctly.

### 3.2 Server Conflicts
- [ ] **Scenario**: Start Preview for Project A. Then open Project B and start Preview.
    - **Expected**: Project A's server stops (or plugin manages multiple ports if implemented, currently v1 stops previous for same path). The view updates to Project B.
- [ ] **Scenario**: Manually run `quarto preview` in a terminal on port 4200. Try to start preview in Obsidian.
    - **Expected**: Quarto CLI usually picks a random free port, so it should work without conflict.

### 3.3 CSP & Iframe
- [ ] **Scenario**: Check Developer Console (Cmd+Opt+I) during preview.
    - **Expected**: No "Refused to load..." CSP errors for the localhost URL.
