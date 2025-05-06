// utils/execute.js

/**
 * executeCode
 * Sends the user’s code and chosen language to the server’s /api/execute endpoint.
 * Displays the raw output or error in the #output element.
 * Returns an object { success, output } to indicate pass/fail status.
 */
export async function executeCode() {
    const codeInput = document.querySelector('#codeInput');
    const outputEl  = document.querySelector('#output');
    if (!codeInput || !outputEl) return { success: false };

    const code = codeInput.value.trim();
    const lang = localStorage.getItem('selectedLanguage') || 'python';

    if (!code) {
        // Prompt user to enter code before running
        outputEl.innerText = '⚠️ Please write some code first.';
        return { success: false };
    }

    try {
        // POST to our execute endpoint with code + language
        const resp = await fetch('/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language: lang })
        });
        if (!resp.ok) {
            // Show HTTP error status/text
            const text = await resp.text();
            outputEl.innerText = `❌ Execution error: ${resp.status} ${text}`;
            return { success: false };
        }

        // Parse JSON { output, success }
        const data = await resp.json();
        // Display returned stdout or a fallback message
        outputEl.innerText = data.output ?? 'No output returned.';

        return {
            success: Boolean(data.success),
            output:  data.output ?? ''
        };
    } catch (err) {
        // Network or unexpected errors
        outputEl.innerText = '❌ Error executing code.';
        console.error('executeCode Error:', err);
        return { success: false };
    }
}
