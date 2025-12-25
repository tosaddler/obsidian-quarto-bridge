import { App, TFile, TFolder } from 'obsidian';

/**
 * Finds the Quarto project root for a given file by searching upwards for a _quarto.yml file.
 * 
 * @param app The Obsidian App instance
 * @param file The active file to start searching from
 * @returns The TFolder containing _quarto.yml, or null if not found
 */
export function findQuartoProjectRoot(app: App, file: TFile): TFolder | null {
    let currentFolder: TFolder | null = file.parent;

    while (currentFolder) {
        // Construct path to _quarto.yml in the current folder
        // If root, path is just "_quarto.yml". Otherwise "path/to/folder/_quarto.yml"
        const configPath = currentFolder.isRoot() 
            ? '_quarto.yml' 
            : `${currentFolder.path}/_quarto.yml`;

        const configFile = app.vault.getAbstractFileByPath(configPath);

        if (configFile instanceof TFile) {
            return currentFolder;
        }

        // If we are at root and didn't find it, stop.
        // (currentFolder.parent will be null if currentFolder is root, so the loop handles it, 
        // but explicit check doesn't hurt if logic changes)
        if (currentFolder.isRoot()) {
            break;
        }

        currentFolder = currentFolder.parent;
    }

    return null;
}
