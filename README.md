# Obsidian Quarto Bridge

A powerful bridge between [Obsidian](https://obsidian.md) and [Quarto](https://quarto.org), enabling a seamless scientific publishing workflow directly within your vault.

## Features

- **Live Preview**: Run `quarto preview` in the background and view the result in a dedicated Obsidian pane (iframe).
- **Project Detection**: Automatically detects the Quarto project root (`_quarto.yml`) based on the currently active file.
- **Process Management**: Robustly manages background Quarto processes, ensuring ports are cleaned up when you stop the preview or unload the plugin.
- **Configurable Binary**: Specify a custom path to the `quarto` executable if it's not in your system PATH.

## Prerequisites

1.  **Quarto CLI**: You must have Quarto installed and accessible from your terminal.
    -   [Download Quarto](https://quarto.org/docs/get-started/)
    -   Verify installation by running `quarto --version` in your terminal.

## Usage

### Previewing a Project

1.  Open any `.qmd` or `.md` file inside your Quarto project folder.
2.  Open the Command Palette (`Cmd/Ctrl + P`).
3.  Run **"Quarto Bridge: Preview Project"**.
4.  The plugin will:
    -   Find the project root (looking for `_quarto.yml`).
    -   Start the Quarto preview server in the background.
    -   Open a new pane displaying the rendered output.

### Stopping the Server

To save system resources or restart a stuck process:
1.  Open the Command Palette.
2.  Run **"Quarto Bridge: Stop Preview Server"**.

## Settings

Go to **Settings > Quarto Bridge** to configure:

-   **Quarto Binary Path**: If the plugin cannot find `quarto`, enter the absolute path to the executable here (e.g., `/usr/local/bin/quarto` or `C:\Program Files\Quarto\bin\quarto.exe`). Default is `quarto`.

## Installation

### From Community Plugins (Coming Soon)
*Once approved, you will be able to install this directly from Obsidian.*

### Manual Installation
1.  Download the latest release from the [GitHub Releases](https://github.com/tosaddler/obsidian-quarto-bridge/releases) page.
2.  Extract the `main.js`, `manifest.json`, and `styles.css` files into your vault's plugin folder: `<Vault>/.obsidian/plugins/obsidian-quarto-bridge/`.
3.  Reload Obsidian and enable the plugin in **Settings > Community Plugins**.

## Troubleshooting

-   **"No _quarto.yml found"**: Ensure your file is inside a folder (or subfolder) that contains a `_quarto.yml` configuration file.
-   **Preview is blank**: This might be due to Content Security Policy (CSP) restrictions. The plugin uses a sandboxed iframe. If you see errors in the console (Ctrl+Shift+I), please report them on GitHub.
-   **"spawn quarto ENOENT"**: The plugin cannot find the Quarto executable. Go to Settings and provide the absolute path to your Quarto binary.

## Development

1.  Clone the repository.
2.  Run `npm install`.
3.  Run `npm run dev` to start the compiler in watch mode.
4.  Reload Obsidian to see changes.
