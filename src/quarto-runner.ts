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

    /**
     * Renders a specific file or the entire project.
     * @param workingDir Absolute path to the working directory (project root or file parent)
     * @param target Relative path to the file to render, or '.' for the whole project
     * @param quartoBinary Path to the quarto executable
     */
    async render(workingDir: string, target: string, quartoBinary: string = 'quarto'): Promise<void> {
        return new Promise((resolve, reject) => {
            new Notice(`Rendering ${target === '.' ? 'project' : target}...`);

            const quarto = spawn(quartoBinary, ['render', target], {
                cwd: workingDir,
                shell: true,
                env: process.env
            });

            quarto.stdout?.on('data', (data) => {
                console.log(`[Quarto Render]: ${data}`);
            });

            quarto.stderr?.on('data', (data) => {
                console.log(`[Quarto Render Err]: ${data}`);
            });

            quarto.on('close', (code) => {
                if (code === 0) {
                    new Notice('Quarto Render Complete!');
                    resolve();
                } else {
                    new Notice(`Quarto Render failed with code ${code}`);
                    reject(new Error(`Exited with code ${code}`));
                }
            });

            quarto.on('error', (err) => {
                new Notice(`Quarto Render error: ${err.message}`);
                reject(err);
            });
        });
    }

    /**
     * Creates a new Quarto project.
     * @param parentDir Absolute path to the parent directory where the project folder will be created
     * @param name Name of the project folder
     * @param type Type of project (default, website, blog, book, manuscript)
     * @param engine Computation engine (markdown, jupyter, knitr)
     * @param quartoBinary Path to the quarto executable
     */
    async createProject(parentDir: string, name: string, type: string, engine: string, quartoBinary: string = 'quarto'): Promise<void> {
        return new Promise((resolve, reject) => {
            new Notice(`Creating Quarto project: ${name}...`);

            // quarto create project <type> <name> --engine <engine> --no-open
            const args = ['create', 'project', type, name, '--engine', engine, '--no-open'];

            const quarto = spawn(quartoBinary, args, {
                cwd: parentDir,
                shell: true,
                env: process.env
            });

            quarto.stdout?.on('data', (data) => {
                console.log(`[Quarto Create]: ${data}`);
            });

            quarto.stderr?.on('data', (data) => {
                console.log(`[Quarto Create Err]: ${data}`);
            });

            quarto.on('close', (code) => {
                if (code === 0) {
                    new Notice('Quarto Project Created!');
                    resolve();
                } else {
                    new Notice(`Quarto Create failed with code ${code}`);
                    reject(new Error(`Exited with code ${code}`));
                }
            });

            quarto.on('error', (err) => {
                new Notice(`Quarto Create error: ${err.message}`);
                reject(err);
            });
        });
    }
}
