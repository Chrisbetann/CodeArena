// utils/judgeRunner.js
const { writeFile, mkdtemp, rm } = require('fs').promises;
const { spawn } = require('child_process');
const os   = require('os');
const path = require('path');

/**
 * Executes the given command with args, feeding stdin, collecting stdout/stderr.
 */
function execProcess(command, args, stdin = '') {
    return new Promise(resolve => {
        const proc = spawn(command, args);
        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', chunk => { stdout += chunk; });
        proc.stderr.on('data', chunk => { stderr += chunk; });

        // feed stdin and close
        if (stdin) proc.stdin.write(stdin);
        proc.stdin.end();

        proc.on('close', code => {
            resolve({
                success: code === 0,
                stdout,
                stderr,
                code
            });
        });
    });
}

/**
 * run({ language, source, stdin })
 *   - language: 'python' | 'cpp' | 'java'
 *   - source:   the user’s code as a string
 *   - stdin:    optional string to feed as STDIN
 *
 * Returns Promise<{ success, output, raw: { code, stdout, stderr } }>
 */
async function run({ language, source, stdin = '' }) {
    // 1) make a temp dir
    const tmpdir = await mkdtemp(path.join(os.tmpdir(), 'runner-'));

    try {
        if (language === 'python') {
            // write script.py
            const script = path.join(tmpdir, 'script.py');
            await writeFile(script, source, 'utf8');

            // run python3 script.py
            const result = await execProcess('python3', [script], stdin);
            return {
                success: result.success,
                output:  result.success ? result.stdout : result.stderr,
                raw:     result
            };
        }

        if (language === 'cpp') {
            // write main.cpp
            const src = path.join(tmpdir, 'main.cpp');
            const exe = path.join(tmpdir, 'main');
            await writeFile(src, source, 'utf8');

            // compile
            const compile = await execProcess('g++', ['-std=c++17', src, '-O2', '-o', exe]);
            if (!compile.success) {
                return {
                    success: false,
                    output:  compile.stderr,
                    raw:     compile
                };
            }

            // run the binary
            const runRes = await execProcess(exe, [], stdin);
            return {
                success: runRes.success,
                output:  runRes.success ? runRes.stdout : runRes.stderr,
                raw:     runRes
            };
        }

        if (language === 'java') {
            // we expect class name "Solution" or infer from source?
            // For simplicity, assume the user’s code declares `public class Solution { ... }`
            const className = 'Main';
            const src  = path.join(tmpdir, `${className}.java`);
            await writeFile(src, source, 'utf8');

            // compile
            const compile = await execProcess('javac', [src]);
            if (!compile.success) {
                return {
                    success: false,
                    output:  compile.stderr,
                    raw:     compile
                };
            }

            // run
            const runRes = await execProcess('java', ['-cp', tmpdir, className], stdin);
            return {
                success: runRes.success,
                output:  runRes.success ? runRes.stdout : runRes.stderr,
                raw:     runRes
            };
        }

        throw new Error(`Unsupported language: ${language}`);
    } finally {
        // clean up the temp folder
        await rm(tmpdir, { recursive: true, force: true });
    }
}

module.exports = { run };
