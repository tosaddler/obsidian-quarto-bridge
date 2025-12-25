import { App, Editor, MarkdownView, Modal, Notice, Plugin, TFile, WorkspaceLeaf } from 'obsidian';
import { DEFAULT_SETTINGS, QuartoPluginSettings, QuartoSettingTab } from "./settings";
import { QuartoRunner } from './quarto-runner';
import { QuartoPreviewView, VIEW_TYPE_QUARTO_PREVIEW } from './views/quarto-preview-view';
import { findQuartoProjectRoot } from './utils/project-detector';
import { CreateProjectModal } from './modals/create-project-modal';

export default class QuartoBridgePlugin extends Plugin {
	settings: QuartoPluginSettings;
	quartoRunner: QuartoRunner;

	async onload() {
		await this.loadSettings();

		this.quartoRunner = new QuartoRunner();

		// Register the custom view
		this.registerView(
			VIEW_TYPE_QUARTO_PREVIEW,
			(leaf) => new QuartoPreviewView(leaf)
		);

		// Command: Preview Quarto Project
		this.addCommand({
			id: 'quarto-preview-project',
			name: 'Preview Project',
			checkCallback: (checking: boolean) => {
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile) {
					if (!checking) {
						this.previewProject(activeFile);
					}
					return true;
				}
				return false;
			}
		});

		// Command: Stop Quarto Preview
		this.addCommand({
			id: 'quarto-stop-preview',
			name: 'Stop Preview Server',
			callback: () => {
				this.quartoRunner.stopAll();
				new Notice("Stopped all Quarto preview servers.");
			}
		});

		// Command: Render Active File
		this.addCommand({
			id: 'quarto-render-file',
			name: 'Render Active File',
			checkCallback: (checking: boolean) => {
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile) {
					if (!checking) {
						this.renderFile(activeFile);
					}
					return true;
				}
				return false;
			}
		});

		// Command: Render Project
		this.addCommand({
			id: 'quarto-render-project',
			name: 'Render Project',
			checkCallback: (checking: boolean) => {
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile) {
					if (!checking) {
						this.renderProject(activeFile);
					}
					return true;
				}
				return false;
			}
		});

		// Command: Create Quarto Project
		this.addCommand({
			id: 'quarto-create-project',
			name: 'Create New Project',
			callback: () => {
				new CreateProjectModal(this.app, (result) => {
					this.createProject(result);
				}).open();
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new QuartoSettingTab(this.app, this));
	}

	onunload() {
		this.quartoRunner.stopAll();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<QuartoPluginSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

    getAbsolutePath(relativePath: string): string {
        // @ts-ignore - adapter.getBasePath is internal API but widely used.
        const adapter = this.app.vault.adapter as any;
        const vaultRoot = adapter.getBasePath();
        // Handle root path case where relativePath is empty or '/'
        if (!relativePath || relativePath === '/') return vaultRoot;
        return `${vaultRoot}/${relativePath}`;
    }

	async previewProject(file: TFile) {
		const projectRoot = findQuartoProjectRoot(this.app, file);
		
		if (!projectRoot) {
			new Notice("No _quarto.yml found in parent directories. Is this a Quarto project?");
			return;
		}

		const projectPath = this.getAbsolutePath(projectRoot.path);

		this.quartoRunner.startPreview(projectPath, async (url) => {
			await this.activateView(url);
		}, this.settings.quartoBinary);
	}

    async renderFile(file: TFile) {
        const parentPath = file.parent ? file.parent.path : '';
        const workingDir = this.getAbsolutePath(parentPath);
        await this.quartoRunner.render(workingDir, file.name, this.settings.quartoBinary);
    }

    async renderProject(file: TFile) {
        const projectRoot = findQuartoProjectRoot(this.app, file);
        if (!projectRoot) {
            new Notice("No _quarto.yml found. Cannot render project.");
            return;
        }
        const workingDir = this.getAbsolutePath(projectRoot.path);
        await this.quartoRunner.render(workingDir, '.', this.settings.quartoBinary);
    }

    async createProject(result: { type: string; name: string; engine: string }) {
        const activeFile = this.app.workspace.getActiveFile();
        // If active file is in a folder, use that. If root, use root.
        // If no active file, use root.
        const parentPath = activeFile && activeFile.parent ? activeFile.parent.path : '/';
        const absoluteParentPath = this.getAbsolutePath(parentPath);

        await this.quartoRunner.createProject(absoluteParentPath, result.name, result.type, result.engine, this.settings.quartoBinary);
    }

	async activateView(url: string) {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_QUARTO_PREVIEW);

		if (leaves.length > 0) {
			// A leaf with our view already exists, use that
			leaf = leaves[0] ?? null;
		} else {
			// Our view could not be found in the workspace, create a new leaf
			// in the right sidebar for now, or split the active leaf
			leaf = workspace.getRightLeaf(false);
			if (!leaf) {
                 // Fallback if right leaf isn't available
                 leaf = workspace.getLeaf(true);
            }
			await leaf.setViewState({ type: VIEW_TYPE_QUARTO_PREVIEW, active: true });
		}

        if (leaf) {
            // "Reveal" the leaf in case it is in a collapsed sidebar
            workspace.revealLeaf(leaf);

            // Update the view with the URL
            if (leaf.view instanceof QuartoPreviewView) {
                leaf.view.setUrl(url);
            }
        }
	}
}
