import { ChildProcess, spawn } from 'child_process';
import { Notice } from 'obsidian';

export class QuartoRunner {
    // Map of project path -> ChildProcess
    private activeProcesses: Map<string, ChildProcess> = new Map();

    /**
     * Starts a Quarto preview server for the given project directory.
     * @param projectDir Absolute path to the project directory
     * @param onUrlReady Callback function that receives the localhost URL when ready
     * @param quartoBinary Path to the quarto executable (default: 'quarto')
     */
    async startPreview(projectDir: string, onUrlReady: (url: string) => void, quartoBinary: string = 'quarto') {
        // 1. Terminate existing process for this project to avoid port conflicts
        this.stopPreview(projectDir);

        new Notice(`Starting Quarto preview...`);

        // 2. Spawn the Quarto process
        // --no-browser: Don't open Chrome/Safari automatically
        // --no-watch-inputs: We might want Quarto to watch, or Obsidian. 
        // Letting Quarto watch is usually safer for consistency.
        const quarto = spawn(quartoBinary, ['preview', '.', '--no-browser', '--no-watch-inputs'], {
            cwd: projectDir,
            shell: true, // Required for Windows compatibility
            env: process.env // Inherit system PATH for R/Python. Note: macOS GUI apps might not inherit .zshrc PATH.
        });

        // 3. Listen for the Server URL in stdout
        quarto.stdout?.on('data', (data: Buffer) => {
            const output = data.toString();
            console.log(`[Quarto]: ${output}`);
            
            // Regex to find http://localhost:PORT
            // Quarto output examples:
            // "Browsing at http://localhost:4200/"
            // "Listening on http://localhost:4200/"
            const match = output.match(/Browsing at (http:\/\/localhost:\d+)/) || output.match(/Listening on (http:\/\/localhost:\d+)/);
            if (match && match[1]) {
                const url = match[1];
                // Trigger the Obsidian View to load this URL via callback
                onUrlReady(url); 
                new Notice("Quarto Preview Ready!");
            }
        });

        // 4. Handle Errors via stderr
        quarto.stderr?.on('data', (data: Buffer) => {
            const errorMsg = data.toString();
            // Quarto prints some status info to stderr too, so we don't always want to show an error notice.
            console.log(`[Quarto Stderr]: ${errorMsg}`);
        });
        
        quarto.on('error', (err) => {
             new Notice(`Quarto process error: ${err.message}`);
             console.error('Quarto spawn error', err);
        });

        quarto.on('close', (code) => {
            console.log(`Quarto process exited with code ${code}`);
            if (this.activeProcesses.get(projectDir) === quarto) {
                this.activeProcesses.delete(projectDir);
            }
        });

        // 5. Register Process for cleanup
        this.activeProcesses.set(projectDir, quarto);
    }
    
    stopPreview(projectDir: string) {
        if (this.activeProcesses.has(projectDir)) {
            const child = this.activeProcesses.get(projectDir);
            child?.kill();
            this.activeProcesses.delete(projectDir);
            new Notice(`Stopped Quarto preview`);
        }
    }

    stopAll() {
        for (const [path, child] of this.activeProcesses) {
            child.kill();
        }
        this.activeProcesses.clear();
    }
}
