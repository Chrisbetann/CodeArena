// ─── CODE EXECUTION ────────────────────────────────────────────────────────────
/**
 * Send user code + selected language to the /api/execute endpoint
 * Returns an object { output, success } where:
 *   - output  = raw stdout / stderr from the execution
 *   - success = true if the code passed the challenge’s tests
 */
export async function executeCode() {
    const codeInput = document.querySelector('#codeInput');
    const outputEl  = document.querySelector('#output');
    if (!codeInput || !outputEl) return { success: false };

    const code = codeInput.value.trim();
    const lang = localStorage.getItem('selectedLanguage') || 'python';

    if (!code) {
        outputEl.innerText = '⚠️ Please write some code first.';
        return { success: false };
    }

    try {
        // Hit your execute endpoint
        const resp = await fetch('/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language: lang })
        });
        if (!resp.ok) {
            const text = await resp.text();
            outputEl.innerText = `❌ Execution error: ${resp.status} ${text}`;
            return { success: false };
        }

        // Expect back: { output: "...", success: true|false }
        const data = await resp.json();
        outputEl.innerText = data.output ?? 'No output returned.';

        return {
            success: Boolean(data.success),
            output:  data.output ?? ''
        };
    } catch (err) {
        outputEl.innerText = '❌ Error executing code.';
        console.error('executeCode Error:', err);
        return { success: false };
    }
}
