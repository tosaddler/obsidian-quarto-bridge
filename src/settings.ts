import { App, PluginSettingTab, Setting } from "obsidian";
import QuartoBridgePlugin from "./main";

export interface QuartoPluginSettings {
	quartoBinary: string;
}

export const DEFAULT_SETTINGS: QuartoPluginSettings = {
	quartoBinary: 'quarto'
}

export class QuartoSettingTab extends PluginSettingTab {
	plugin: QuartoBridgePlugin;

	constructor(app: App, plugin: QuartoBridgePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Quarto binary path')
			.setDesc('Path to the quarto executable. Leave as "quarto" if it is in your system PATH.')
			.addText(text => text
				.setPlaceholder('Quarto')
				.setValue(this.plugin.settings.quartoBinary)
				.onChange(async (value) => {
					this.plugin.settings.quartoBinary = value;
					await this.plugin.saveSettings();
				}));
	}
}
