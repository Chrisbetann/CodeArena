// routes/session.js
const express = require('express');
const router = express.Router();

// In-memory store for game sessions (for demonstration purposes)
let sessions = {};

/**
 * Start a game session for a given lobby.
 * Expects: { lobbyCode: string, questions: array }
 */
router.post('/start', (req, res) => {
    const { lobbyCode, questions } = req.body;
    if (!lobbyCode || !questions || !Array.isArray(questions)) {
        return res.status(400).json({ error: "lobbyCode and an array of questions are required" });
    }

    // Create a new game session for the lobby
    sessions[lobbyCode] = {
        lobbyCode: lobbyCode,
        questions: questions,
        currentQuestionIndex: 0,
        answers: {},  // Stores answers for the current question: { username: answer }
        scores: {}    // Stores players' scores: { username: score }
    };

    res.status(201).json({
        message: "Game session started",
        session: sessions[lobbyCode]
    });
});

/**
 * Submit an answer for the current question.
 * Expects: { lobbyCode: string, username: string, answer: any }
 */
router.post('/submit', (req, res) => {
    const { lobbyCode, username, answer } = req.body;
    if (!lobbyCode || !username || answer === undefined) {
        return res.status(400).json({ error: "lobbyCode, username, and answer are required" });
    }

    const session = sessions[lobbyCode];
    if (!session) {
        return res.status(404).json({ error: "Game session not found" });
    }

    // For now, simply store the answer.
    // Later, add logic to check correctness, update scores, and move to the next question.
    session.answers[username] = answer;

    res.status(200).json({
        message: "Answer submitted",
        session: session
    });
});

/**
 * Get the status of a game session.
 * URL parameter: lobbyCode
 */
router.get('/:lobbyCode', (req, res) => {
    const lobbyCode = req.params.lobbyCode;
    const session = sessions[lobbyCode];
    if (!session) {
        return res.status(404).json({ error: "Game session not found" });
    }

    res.json({ session: session });
});

module.exports = router;
