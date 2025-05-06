// routes/session.js
// ─────────────────────────────────────────────────────────────────────────────
// Manages quiz sessions: starting a session, submitting answers, and fetching session state.
// ─────────────────────────────────────────────────────────────────────────────

const express  = require('express');
const router   = express.Router();
const Session  = require('../models/Session');
const Question = require('../models/Question');
const { run }  = require('../utils/judgeRunner');

// The One Question ID we’re demoing (Two‑Sum)
const TWO_SUM_ID = '67db5a5a84386134e0f8c68f';

// Difficulty → score multiplier mapping
const DIFFICULTY_MULTIPLIER = {
    easy:   1.0,
    medium: 1.5,
    hard:   2.0
};

/**
 * Normalize raw output string:
 * - Trim whitespace
 * - If wrapped in quotes, JSON‑parse once
 */
function normalize(s) {
    const t = s.trim();
    if (/^".*"$/.test(t)) {
        try { return JSON.parse(t); } catch {}
    }
    return t;
}

/**
 * Compare actual vs expected:
 * - Try to parse both as JSON arrays and compare element by element
 * - Otherwise, compare final strings
 */
function compareOutputs(actual, expected) {
    const aNorm = normalize(actual), eNorm = normalize(expected);
    try {
        const aJ = JSON.parse(aNorm), eJ = JSON.parse(eNorm);
        if (Array.isArray(aJ) && Array.isArray(eJ)) {
            return aJ.length === eJ.length && aJ.every((v,i) => v === eJ[i]);
        }
    } catch { /* not arrays */ }
    return String(aNorm) === String(eNorm);
}

/**
 * POST /api/session/start
 * Body: { lobbyCode, questions }
 *
 * Creates or resets a Session document for the given lobbyCode,
 * saving the list of question IDs and unpausing the session.
 */
router.post('/start', async (req, res) => {
    const { lobbyCode, questions } = req.body;
    if (!lobbyCode || !Array.isArray(questions)) {
        return res.status(400).json({ error: 'lobbyCode & questions required' });
    }
    try {
        const qIDs = questions.map(q => typeof q === 'string' ? q : q.id);
        const session = await Session.findOneAndUpdate(
            { lobbyCode },
            { lobbyCode, questions: qIDs, isPaused: false },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        return res.status(201).json({ session });
    } catch (err) {
        console.error('Could not start session:', err);
        return res.status(500).json({ error: 'Could not start session' });
    }
});

/**
 * POST /api/session/submit
 * Body: { lobbyCode, username, questionId, code, timeTaken, language, difficulty }
 *
 * Executes submitted code against each testCase for Two‑Sum,
 * calculates a score (with difficulty multiplier), records the submission,
 * and returns whether it passed and the earned points.
 */
router.post('/submit', async (req, res) => {
    const { lobbyCode, username, questionId, code, timeTaken, language, difficulty } = req.body;
    if (!lobbyCode || !username || !questionId || typeof code !== 'string' ||
        timeTaken == null || !language) {
        return res.status(400).json({ error: 'All fields required' });
    }

    try {
        // 1) Load session & question
        const session = await Session.findOne({ lobbyCode });
        if (!session) return res.status(404).json({ error: 'No active session' });
        if (session.isPaused) return res.status(400).json({ error: 'Session paused' });

        const question = await Question.findById(questionId).lean();
        if (!question) return res.status(400).json({ error: 'Invalid questionId' });

        // 2) Run each testCase through our injected Two‑Sum harness
        let allPassed = true;
        for (const tc of question.testCases || []) {
            let wrapped;
            if (language === 'python') {
                // Python wrapper reads stdin, calls twoSum, prints JSON
                wrapped = `
${code}

import sys, json
if 'two_sum' in globals() and 'twoSum' not in globals():
    twoSum = two_sum
_tokens = sys.stdin.read().strip().split()
nums   = list(map(int, _tokens[:-1]))
target = int(_tokens[-1])
res    = twoSum(nums, target)
print(json.dumps(res, separators=(',',':')))
`;
            } else if (language === 'cpp') {
                // C++ wrapper builds vector, calls twoSum, outputs [i,j]
                wrapped = `
#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

${code}

int main(){
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    vector<int> v; int x;
    while (cin >> x) v.push_back(x);
    int target = v.back(); v.pop_back();
    auto ans = twoSum(v, target);
    cout << "[" << ans[0] << "," << ans[1] << "]";
    return 0;
}
`;
            } else if (language === 'java') {
                // Java wrapper reads ints, calls Solution.twoSum, prints [i,j]
                wrapped = `
import java.util.*;
${code}

public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    List<Integer> nums = new ArrayList<>();
    while (sc.hasNextInt()) nums.add(sc.nextInt());
    int target = nums.remove(nums.size()-1);
    int[] ans = new Solution().twoSum(
      nums.stream().mapToInt(i->i).toArray(), target
    );
    System.out.print("[" + ans[0] + "," + ans[1] + "]");
  }
}
`;
            }

            const result = await run({ language, source: wrapped, stdin: tc.input });
            if (!result.success || !compareOutputs(result.output, tc.expectedOutput)) {
                allPassed = false;
                break;
            }
        }

        // 3) Score calculation
        const BASE_TIME  = 30;
        const BASE_SCORE = 100;
        const bonus      = Math.max(0, BASE_TIME - Number(timeTaken));
        const rawScore   = allPassed ? (BASE_SCORE + bonus) : 0;
        const multiplier = DIFFICULTY_MULTIPLIER[difficulty] || 1.0;
        const scoreIncrement = Math.round(rawScore * multiplier);

        // 4) Record in session
        if (allPassed) {
            const prev = session.scores.get(username) || 0;
            session.scores.set(username, prev + scoreIncrement);
        }
        session.submissions.push({
            username,
            questionId,
            code,
            output:       allPassed ? '✅ Passed all tests' : '❌ Failed tests',
            language,
            timeTaken,
            scoreIncrement,
            isCorrect:    allPassed
        });
        await session.save();

        // 5) Respond with correctness and new total
        return res.json({
            correct:      allPassed,
            scoreIncrement,
            totalScore:   session.scores.get(username) || 0
        });

    } catch (err) {
        console.error('Submission failed:', err);
        return res.status(500).json({ error: 'Submission failed' });
    }
});

/**
 * GET /api/session/:lobbyCode
 *
 * Returns the full Session document (questions, submissions, scores, etc.)
 * for the given lobbyCode, so the frontend can refresh state.
 */
router.get('/:lobbyCode', async (req, res) => {
    try {
        const session = await Session.findOne({ lobbyCode: req.params.lobbyCode });
        if (!session) return res.status(404).json({ error: 'Session not found' });
        return res.json({ session });
    } catch (err) {
        console.error('Could not fetch session:', err);
        return res.status(500).json({ error: 'Could not fetch session' });
    }
});

module.exports = router;
