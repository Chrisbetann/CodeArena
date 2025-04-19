// public/code-arena/script.js
// ────────────────────────────────────────────
// 1) Mark this file as an ES module so browsers allow top‑level await
export {};

//
// ─── GLOBAL STATE ──────────────────────────────────────────────────────────────
//
let questions = [];
let currentQuestionIndex = 0;

//
// ─── UTILITY SELECTOR ──────────────────────────────────────────────────────────
//
function $(sel) {
    return document.querySelector(sel);
}

//
// ─── LANGUAGE SELECTION ────────────────────────────────────────────────────────
//
const langButtons = document.querySelectorAll('.lang-btn');
for (const btn of langButtons) {
    btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        localStorage.setItem('selectedLanguage', lang);
        langButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
}
// initialize highlight on page load
{
    const stored = localStorage.getItem('selectedLanguage');
    if (stored) {
        const found = [...langButtons].find(b => b.dataset.lang === stored);
        if (found) found.classList.add('active');
    }
}

//
// ─── MUSIC TOGGLE ──────────────────────────────────────────────────────────────
//
export function toggleMusic() {
    const audio = $('#arenaMusic');
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
}

//
// ─── LOGIN CHECK & WELCOME ─────────────────────────────────────────────────────
//
export function checkLoginStatus() {
    const token   = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');
    if (!token || !userRaw) {
        window.location.href = '/login.html';
        return false;
    }
    // Show welcome if on game page
    try {
        const user   = JSON.parse(userRaw);
        const speech = $('#avatarSpeech');
        if (speech && user.username) {
            speech.innerText = `⚔️ Welcome back, ${user.username} the Bold!`;
        }
    } catch { /* ignore */ }
    return true;
}

//
// ─── QUESTION HANDLING ─────────────────────────────────────────────────────────
//
export async function loadQuestions() {
    if (!checkLoginStatus()) return;

    try {
        const resp = await fetch('/api/questions', { credentials: 'include' });
        if (!resp.ok) throw new Error(resp.statusText);
        questions = await resp.json();
        displayQuestion();
    } catch (err) {
        const el = $('#question');
        if (el) el.innerText = 'Failed to load questions.';
        console.error('loadQuestions Error:', err);
    }
}

export function displayQuestion() {
    const el = $('#question');
    if (!el) return;
    if (!questions.length) {
        el.innerText = 'No questions available.';
        return;
    }

    const q = questions[currentQuestionIndex];
    el.innerHTML = `
    <span id="questionTitle"
          style="cursor:pointer; color: gold; text-decoration: underline;">
      ${q.id}. ${q.title}
    </span>
    <div id="questionDesc"
         style="display: none; margin-top: 1em; color: white;">
      <pre style="white-space: pre-wrap; font-family:inherit">
${q.description}
      </pre>
    </div>`;

    // toggle description on click
    const titleSpan = document.getElementById('questionTitle');
    const descDiv   = document.getElementById('questionDesc');
    titleSpan.addEventListener('click', () => {
        const hidden = descDiv.style.display === 'none';
        descDiv.style.display = hidden ? 'block' : 'none';
    });
}

export function nextQuestion() {
    if (!questions.length) return;
    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
    displayQuestion();
}

//
// ─── CODE EXECUTION ────────────────────────────────────────────────────────────
//
/**
 * executeCode()
 *   Calls /api/execute
 *   Expects JSON { success: boolean, output: string }
 *   Returns that object to caller
 */
export async function executeCode() {
    const codeInput = $('#codeInput');
    const outputEl  = $('#output');
    if (!codeInput || !outputEl) return { success: false, output: '' };

    const code = codeInput.value.trim();
    const lang = localStorage.getItem('selectedLanguage') || 'python';

    if (!code) {
        outputEl.innerText = '⚠️ Please write some code first.';
        return { success: false, output: '' };
    }

    try {
        const resp = await fetch('/api/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, language: lang,
                // pass which question ID so backend picks tests
                questionId: questions[currentQuestionIndex].id
            })
        });
        if (!resp.ok) throw new Error(resp.statusText);
        const data = await resp.json();
        return {
            success: data.success ?? false,
            output:  data.output  ?? ''
        };
    } catch (err) {
        console.error('executeCode Error:', err);
        return { success: false, output: `❌ Error: ${err.message}` };
    }
}

/**
 * runAndSubmit()
 *   1) run executeCode()
 *   2) Always display the output
 *   3) If success, auto-call submitAnswer()
 */
export async function runAndSubmit() {
    const outEl = $('#output');
    const { success, output } = await executeCode();
    // display output
    outEl.innerText = output;

    if (success) {
        // collect lobbyCode, user, answer, timeTaken
        const lobbyCode = localStorage.getItem('lobbyCode');
        const userRaw   = localStorage.getItem('user');
        if (!lobbyCode || !userRaw) return;
        const user = JSON.parse(userRaw);

        // timeTaken placeholder (ms since page load)
        const timeTaken = Date.now() - (window.pageLoadTimestamp || Date.now());

        // Actual answer can be the code or just question ID:
        const answer = questions[currentQuestionIndex].id;

        // auto–submit
        try {
            await submitAnswer(lobbyCode, user.username, answer, timeTaken);
        } catch (err) {
            console.error('Auto submitAnswer failed:', err);
        }
    }
}

//
// ─── LEADERBOARD (SESSION) ──────────────────────────────────────────────────
export async function submitAnswer(lobbyCode, username, answer, timeTaken) {
    const resp = await fetch('/api/session/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lobbyCode, username, answer, timeTaken })
    });
    if (!resp.ok) throw new Error('session/submit failed');
    const data = await resp.json();
    // handle feedback
    alert(data.correct
        ? `✅ Correct! +${data.scoreIncrement} pts`
        :  `❌ Incorrect`
    );
    // refresh leaderboard listing (if shown)
    fetchLeaderboard(lobbyCode);
}

export async function fetchLeaderboard(lobbyCode) {
    const resp = await fetch(`/api/session/${lobbyCode}`);
    if (!resp.ok) throw new Error('session fetch failed');
    const { session } = await resp.json();
    const scores = session.scores||{};
    const container = $('#leaderboard');
    container.innerHTML = '';
    Object.entries(scores)
        .sort((a,b) => b[1] - a[1])
        .forEach(([u,score]) => {
            container.innerHTML += `<p>${u}: ${score}</p>`;
        });
}

//
// ─── LOGOUT ────────────────────────────────────────────────────────────────────
export function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}

//
// ─── ATTACH GLOBALS ────────────────────────────────────────────────────────────
window.toggleMusic     = toggleMusic;
window.checkLoginStatus= checkLoginStatus;
window.loadQuestions   = loadQuestions;
window.displayQuestion = displayQuestion;
window.nextQuestion    = nextQuestion;
// switch your Run Code button to call runAndSubmit()
window.runAndSubmit    = runAndSubmit;
window.executeCode     = executeCode;  // kept for parity
window.logout          = logout;

//
// ─── PAGE INITIALIZATION ───────────────────────────────────────────────────────
//
window.pageLoadTimestamp = Date.now();   // track when page loaded
window.addEventListener('DOMContentLoaded', () => {
    // login & initial questions
    checkLoginStatus();
    loadQuestions();

    // Leaderboard modal
    const btn   = $('#leaderboardBtn');
    const modal = $('#leaderboardModal');
    const close = $('#closeLeaderboard');
    if (btn && modal && close) {
        btn.onclick = () => modal.style.display = 'flex';
        close.onclick = () => modal.style.display = 'none';
        window.onclick = e => {
            if (e.target === modal) modal.style.display = 'none';
        };
    }
});
