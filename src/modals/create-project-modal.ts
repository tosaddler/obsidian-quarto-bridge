import { App, Modal, Setting, Notice } from 'obsidian';

export class CreateProjectModal extends Modal {
    result: { type: string; name: string; engine: string } = {
        type: 'default',
        name: '',
        engine: 'markdown'
    };
    onSubmit: (result: { type: string; name: string; engine: string }) => void;

    constructor(app: App, onSubmit: (result: { type: string; name: string; engine: string }) => void) {
        super(app);
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl('h2', { text: 'Create New Quarto Project' });

        new Setting(contentEl)
            .setName('Project Type')
            .setDesc('Select the type of project to create')
            .addDropdown(dropdown => dropdown
                .addOption('default', 'Default Project')
                .addOption('website', 'Website')
                .addOption('blog', 'Blog')
                .addOption('book', 'Book')
                .addOption('manuscript', 'Manuscript')
                .setValue('default')
                .onChange(value => this.result.type = value));

        new Setting(contentEl)
            .setName('Project Name')
            .setDesc('Name of the project folder')
            .addText(text => text
                .onChange(value => this.result.name = value));

        new Setting(contentEl)
            .setName('Engine')
            .setDesc('Select the computation engine')
            .addDropdown(dropdown => dropdown
                .addOption('markdown', 'Markdown (standard)')
                .addOption('jupyter', 'Jupyter (python)')
                .addOption('knitr', 'Knitr (R)')
                .setValue('markdown')
                .onChange(value => this.result.engine = value));

        new Setting(contentEl)
            .addButton(btn => btn
                .setButtonText('Create')
                .setCta()
                .onClick(() => {
                    if (!this.result.name) {
                        new Notice('Please enter a project name');
                        return;
                    }
                    this.close();
                    this.onSubmit(this.result);
                }));
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}
