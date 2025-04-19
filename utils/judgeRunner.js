// utils/judgeRunner.js
const fetch = require('node-fetch');

// Judge0 base URL (we’ll point at your local Docker instance on port 3001)
const JUDGE0_URL = process.env.JUDGE0_URL || 'http://localhost:3001';

// Basic headers (adjust if you need authentication)
const JUDGE0_HEADERS = {
    'Content-Type': 'application/json',
};

/**
 * Runs user code via Judge0:
 * @param {{language: string, source: string}} opts
 * @returns {Promise<{success: boolean, output: string, raw: object}>}
 */
async function run({ language, source }) {
    const languageMap = { python: 71, cpp: 54, java: 62 };
    const langId = languageMap[language];
    if (!langId) {
        throw new Error(`Unsupported language: ${language}`);
    }

    // Create & wait for submission
    const resp = await fetch(
        `${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
        {
            method: 'POST',
            headers: JUDGE0_HEADERS,
            body: JSON.stringify({
                source_code:   source,
                language_id:   langId,
                // You could include tests via `expected_output` here
            }),
        }
    );

    if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Judge0 create failed: ${resp.status} – ${txt}`);
    }

    const result = await resp.json();
    const parts = [];

    if (result.compile_output) parts.push(`Compile Error:\n${result.compile_output}`);
    if (result.stderr)         parts.push(`Runtime Error:\n${result.stderr}`);
    if (result.stdout)         parts.push(`Output:\n${result.stdout}`);
    if (parts.length === 0)     parts.push('No output.');

    return {
        success: result.status?.id === 3,      // 3 = “Accepted” in Judge0
        output:  parts.join('\n').trim(),
        raw:     result,
    };
}

module.exports = { run };
