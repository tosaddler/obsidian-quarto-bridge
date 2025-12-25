import { ItemView, WorkspaceLeaf } from 'obsidian';

export const VIEW_TYPE_QUARTO_PREVIEW = 'quarto-preview-view';

export class QuartoPreviewView extends ItemView {
    private url: string = '';
    private iframe: HTMLIFrameElement | null = null;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPE_QUARTO_PREVIEW;
    }

    getDisplayText() {
        return 'Quarto Preview';
    }

    async onOpen() {
        const container = this.contentEl;
        container.empty();
        container.addClass('quarto-preview-container');

        this.iframe = container.createEl('iframe');
        this.iframe.addClass('quarto-preview-iframe');
        
        // Basic styling to ensure it fills the pane
        this.iframe.style.width = '100%';
        this.iframe.style.height = '100%';
        this.iframe.style.border = 'none';
        this.iframe.style.backgroundColor = 'white'; // Quarto output is usually white

        // Security: Sandbox attributes
        // allow-scripts: required for Quarto interactivity
        // allow-forms: required for search etc.
        // allow-same-origin: required for some local resources
        // allow-popups: maybe needed for external links
        this.iframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin allow-popups');
        
        if (this.url) {
            this.iframe.setAttribute('src', this.url);
        }
    }

    setUrl(url: string) {
        this.url = url;
        if (this.iframe) {
            this.iframe.setAttribute('src', this.url);
        }
    }
}
