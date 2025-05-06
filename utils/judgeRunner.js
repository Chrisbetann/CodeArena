// utils/judgeRunner.js
// ─────────────────────────────────────────────────────────────────────────────
// Wraps compiling/running code for supported languages by spawning child processes.
// Returns stdout/stderr and success flag.
// ─────────────────────────────────────────────────────────────────────────────

const fs        = require('fs').promises;
const path      = require('path');
const { spawn } = require('child_process');

/**
 * run({ language, source, stdin })
 *
 * - Writes `source` to a temp file with the appropriate extension
 * - Invokes the language’s compiler or interpreter
 * - Pipes in `stdin` if provided
 * - Captures stdout and stderr
 * - Cleans up temp files
 *
 * Returns a Promise<{ output: string, success: boolean }>
 */
async function run({ language, source, stdin = '' }) {
    // 1) Choose file extension & command
    const extMap = { python: '.py', cpp: '.cpp', java: '.java' };
    const tmpName = `submission-${Date.now()}-${Math.random().toString(36).substr(2)}`;
    const filename = tmpName + (extMap[language] || '');
    const filepath = path.join(__dirname, '..', 'tmp', filename);

    // 2) Ensure tmp directory exists
    await fs.mkdir(path.dirname(filepath), { recursive: true });

    // 3) Write source code to file
    await fs.writeFile(filepath, source);

    // 4) Build command array
    let cmd, args;
    if (language === 'python') {
        cmd  = 'python3';
        args = [filepath];
    } else if (language === 'cpp') {
        // compile to an executable, then run
        const exePath = filepath + '.out';
        await new Promise((res, rej) => {
            const compile = spawn('g++', ['-std=c++17', filepath, '-o', exePath]);
            compile.on('exit', code => code === 0 ? res() : rej(new Error('Compile error')));
        });
        cmd  = exePath;
        args = [];
    } else if (language === 'java') {
        // write to Main.java, compile, then run
        const javaFile = path.join(path.dirname(filepath), 'Main.java');
        await fs.writeFile(javaFile, source);
        await new Promise((res, rej) => {
            const compile = spawn('javac', [javaFile]);
            compile.on('exit', code => code === 0 ? res() : rej(new Error('Compile error')));
        });
        cmd  = 'java';
        args = ['-cp', path.dirname(javaFile), 'Main'];
    } else {
        throw new Error(`Unsupported language: ${language}`);
    }

    // 5) Spawn process, capture output
    return new Promise(resolve => {
        const proc = spawn(cmd, args);
        let output = '';
        proc.stdout.on('data', d => (output += d.toString()));
        proc.stderr.on('data', d => (output += d.toString()));
        if (stdin) proc.stdin.write(stdin);
        proc.stdin.end();
        proc.on('close', code => {
            resolve({ output, success: code === 0 });
            // 6) Optional: cleanup temp files...
        });
    });
}

module.exports = { run };
