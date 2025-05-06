// public/code-arena/script.js

// ─── GLOBAL STATE ─────────────────────────────────────────────
// Track loaded questions and which one is current
let questions = [];
let currentQuestionIndex = 0;
// Record the time when the page was loaded to calculate time spent on a question
window.pageLoadTimestamp = Date.now();

// ─── DOM HELPERS ──────────────────────────────────────────────
// Simple helper to select a single DOM element by CSS selector
function $(sel) { return document.querySelector(sel); }

// ─── LANGUAGE SELECTION & DISPLAY ────────────────────────────
// Mapping of language keys to display names
const LANG_DISPLAY = { python: 'Python', cpp: 'C++', java: 'Java' };
// Grab all the language buttons and the label element
const langButtons  = document.querySelectorAll('.lang-btn');
const langLabel    = document.getElementById('lang-label');

/**
 * setLanguage
 *  - Saves the chosen language to localStorage
 *  - Updates the label in the UI to reflect the selection
 */
function setLanguage(langKey) {
    localStorage.setItem('selectedLanguage', langKey);
    const pretty = LANG_DISPLAY[langKey] || langKey;
    if (langLabel) langLabel.textContent = pretty;
}

// Initialize language from localStorage on page load
;(function initLanguage() {
    const saved = localStorage.getItem('selectedLanguage') || 'python';
    setLanguage(saved);
    langButtons.forEach(btn => {
        if (btn.dataset.lang === saved) btn.classList.add('active');
    });
})();

// Add click handlers to each language button
langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        langButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        setLanguage(btn.dataset.lang);
    });
});

// ─── AUTH & LOAD QUESTIONS ───────────────────────────────────
/**
 * checkLoginStatus
 *  - Verifies that a valid token and user info exist in localStorage
 *  - Redirects to login page if not authenticated
 *  - Updates the avatar’s speech bubble with a welcome message
 */
function checkLoginStatus() {
    const token   = localStorage.getItem('token'),
        userRaw = localStorage.getItem('user');
    if (!token || !userRaw) {
        window.location.href = '/login.html';
        return false;
    }
    try {
        const user   = JSON.parse(userRaw),
            bubble = $('#avatarSpeech');
        if (bubble && user.username) {
            bubble.innerText = `⚔️ Welcome back, ${user.username} the Bold!`;
        }
    } catch {}
    return true;
}

/**
 * loadQuestions
 *  - Fetches the list of questions from the backend API
 *  - Starts a session on the server for this lobby
 *  - Calls displayQuestion to show the first question
 */
async function loadQuestions() {
    if (!checkLoginStatus()) return;
    try {
        const res = await fetch('/api/questions', { credentials: 'include' });
        if (!res.ok) throw new Error(res.statusText);
        questions = await res.json();

        const lobbyCode = localStorage.getItem('lobbyCode');
        if (lobbyCode) {
            const qIDs = questions.map(q => q.id);
            await fetch('/api/session/start', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ lobbyCode, questions: qIDs })
            });
        }
        displayQuestion();
    } catch (err) {
        console.error('Failed loading questions:', err);
        $('#question').innerText = 'Error loading questions.';
    }
}

// ─── DISPLAY & NAVIGATION ────────────────────────────────────
/**
 * displayQuestion
 *  - Renders the current question’s title and hides/shows its description
 */
function displayQuestion() {
    const el = $('#question');
    if (!el) return;
    if (!questions.length) return el.innerText = 'No questions available.';
    const q = questions[currentQuestionIndex];
    el.innerHTML = `
    <span id="title" style="color:gold; cursor:pointer; text-decoration:underline;">
      ${q.id}. ${q.title}
    </span>
    <div id="desc" style="display:none; margin-top:8px; color:white;">
      <pre style="white-space:pre-wrap;">${q.description}</pre>
    </div>`;
    $('#title').onclick = () => {
        const d = $('#desc');
        d.style.display = d.style.display === 'none' ? 'block' : 'none';
    };
}

/**
 * nextQuestion
 *  - Advances to the next question in the array (wraps around)
 *  - Calls displayQuestion to update the UI
 */
function nextQuestion() {
    if (!questions.length) return;
    currentQuestionIndex = (currentQuestionIndex + 1) % questions.length;
    displayQuestion();
}

// ─── ENTRY‑POINT DETECTION ───────────────────────────────────
/**
 * hasMain
 *  - Checks if the user’s code already defines a main entry point
 *    (so we know whether to wrap it in our harness)
 */
function hasMain(code, language) {
    if (language === 'python') {
        return /if\s+__name__\s*==\s*['"]__main__['"]/.test(code);
    }
    // C++ or Java
    return /int\s+main\s*\(/.test(code) || /class\s+Main/.test(code);
}

// ─── RUN → EXECUTE → SUBMIT ──────────────────────────────────
/**
 * runAndSubmit
 *  1) Sends code to /api/execute (with or without harness)
 *  2) Displays raw program output
 *  3) Submits output for scoring to /api/session/submit
 *  4) Alerts the user and refreshes the leaderboard
 */
async function runAndSubmit() {
    const outputEl = $('#output');
    outputEl.innerText = '⏳ Running your code…';

    const code      = $('#codeInput').value.trim();
    const language  = localStorage.getItem('selectedLanguage') || 'python';
    const q         = questions[currentQuestionIndex];
    const lobbyCode = localStorage.getItem('lobbyCode');
    const user      = JSON.parse(localStorage.getItem('user') || '{}');
    const username  = user.username || 'guest';
    const timeTaken = Math.floor((Date.now() - window.pageLoadTimestamp) / 1000);

    if (!code) {
        alert('⚠️ Please write some code first!');
        return;
    }

    // Determine whether to bypass harness (user has their own main)
    const raw = hasMain(code, language);

    let execResult;
    try {
        // Call the execution endpoint
        const execResp = await fetch('/api/execute', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ code, language, questionId: q.id, raw })
        });
        if (!execResp.ok) throw new Error(await execResp.text());
        execResult = await execResp.json();
    } catch (err) {
        outputEl.innerText = `❌ Execution failed:\n${err.message}`;
        return console.error('Execution error:', err);
    }

    // 2) Show runtime output exactly as returned
    const programOutput = String(execResult.output || '').trim();
    outputEl.innerText = programOutput || '(no output)';

    // 3) Submit for scoring (only harnessed runs will actually score)
    let submission;
    try {
        const subResp = await fetch('/api/session/submit', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ lobbyCode, username, questionId: q.id, code, timeTaken, language })
        });
        submission = await subResp.json();
        if (!subResp.ok) throw new Error(submission.error || subResp.statusText);
    } catch (err) {
        alert('❌ Submission failed: ' + err.message);
        return console.error('Submission error:', err);
    }

    // 4) Alert result and update leaderboard
    if (submission.correct) {
        alert(`✅ Correct! +${submission.scoreIncrement} pts\nTotal: ${submission.totalScore}`);
    } else {
        alert('❌ Incorrect!');
    }
    try {
        const up = await fetch(`/api/session/${lobbyCode}`, { credentials: 'include' });
        const { session } = await up.json();
        renderLeaderboard(session.scores || {});
    } catch (err) {
        console.warn('Could not refresh leaderboard:', err);
    }
}

// ─── RENDER LEADERBOARD ─────────────────────────────────────
/**
 * renderLeaderboard
 *  - Populates the #leaderboard element with usernames and scores
 */
function renderLeaderboard(scores) {
    const container = $('#leaderboard');
    if (!container) return;
    container.innerHTML = '';
    Object.entries(scores)
        .sort((a, b) => b[1] - a[1])
        .forEach(([user, pts]) => {
            const p = document.createElement('p');
            p.textContent = `${user}: ${pts} pts`;
            container.appendChild(p);
        });
}

// ─── MUSIC & LOGOUT ─────────────────────────────────────────
/** toggleMusic: plays or pauses background arena music */
function toggleMusic() {
    const audio = $('#arenaMusic');
    if (audio) audio.paused ? audio.play() : audio.pause();
}
/** logout: clear storage and redirect to login page */
function logout() {
    localStorage.clear();
    window.location.href = '/login.html';
}

// ─── PAGE INIT ───────────────────────────────────────────────
/**
 * On DOMContentLoaded:
 *  - Ensure lobbyCode / user are set in localStorage
 *  - Check auth, load questions, and wire up UI handlers
 */
window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('code')) {
        localStorage.setItem('lobbyCode', params.get('code'));
    } else if (!localStorage.getItem('lobbyCode')) {
        localStorage.setItem('lobbyCode', '123456');
    }
    if (!localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify({ username: 'guest' }));
    }
    checkLoginStatus();
    loadQuestions();

    // Leaderboard button opens the modal and fetches scores
    $('#leaderboardBtn').onclick = async () => {
        $('#leaderboardModal').style.display = 'flex';
        const lobbyCode = localStorage.getItem('lobbyCode');
        try {
            const resp = await fetch(
                `/api/leaderboard?lobbyCode=${encodeURIComponent(lobbyCode)}`,
                { credentials: 'include' }
            );
            if (!resp.ok) throw new Error(resp.statusText);
            const { scores } = await resp.json();
            renderLeaderboard(scores);
        } catch {
            $('#leaderboard').innerHTML = '<p>⚠️ Failed to load leaderboard.</p>';
        }
    };
    $('#closeLeaderboard').onclick = () => $('#leaderboardModal').style.display = 'none';
    window.onclick = e => {
        if (e.target === $('#leaderboardModal')) {
            $('#leaderboardModal').style.display = 'none';
        }
    };

    document.querySelector('.execute-button').onclick = runAndSubmit;
    window.nextQuestion  = nextQuestion;
    window.toggleMusic   = toggleMusic;
    window.logout        = logout;
});
