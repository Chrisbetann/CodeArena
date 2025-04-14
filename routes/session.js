// routes/session.js
const express = require('express');
const router = express.Router();

// In-memory store for game sessions (for demonstration purposes)
let sessions = {};

/**
 * Start a game session for a given lobby.
 * Expects a request body with:
 *  - lobbyCode: string
 *  - questions: array of objects (each including at least a 'question' and 'correctAnswer' field)
 */
router.post('/start', (req, res) => {
    const { lobbyCode, questions } = req.body;
    if (!lobbyCode || !questions || !Array.isArray(questions)) {
        return res.status(400).json({ error: "lobbyCode and an array of questions are required" });
    }

    // Create a new game session for the lobby, including an isPaused flag.
    sessions[lobbyCode] = {
        lobbyCode: lobbyCode,
        questions: questions, // each question should include a 'correctAnswer' field
        currentQuestionIndex: 0,
        answers: {},  // Stores players' answers: { username: { answer, isCorrect, timeTaken, score } }
        scores: {},   // Stores players' cumulative scores: { username: totalScore }
        isPaused: false // Added for pause/resume functionality
    };

    res.status(201).json({
        message: "Game session started",
        session: sessions[lobbyCode]
    });
});

/**
 * Submit an answer for the current question.
 * Expects a request body with:
 *  - lobbyCode: string
 *  - username: string
 *  - answer: any
 *  - timeTaken: number (seconds taken to answer)
 */
router.post('/submit', (req, res) => {
    const { lobbyCode, username, answer, timeTaken } = req.body;
    if (!lobbyCode || !username || answer === undefined || timeTaken === undefined) {
        return res.status(400).json({ error: "lobbyCode, username, answer, and timeTaken are required" });
    }

    const session = sessions[lobbyCode];
    if (!session) {
        return res.status(404).json({ error: "Game session not found" });
    }

    // Check if session is paused
    if (session.isPaused) {
        return res.status(400).json({ error: "Game session is paused" });
    }

    // Retrieve the current question based on the session's index
    const currentIndex = session.currentQuestionIndex;
    const currentQuestion = session.questions[currentIndex];
    if (!currentQuestion) {
        return res.status(400).json({ error: "No current question available" });
    }

    // Validate the answer (case-insensitive for strings)
    let isCorrect = false;
    if (typeof currentQuestion.correctAnswer === 'string') {
        isCorrect = (currentQuestion.correctAnswer.trim().toLowerCase() === answer.trim().toLowerCase());
    } else {
        isCorrect = (currentQuestion.correctAnswer == answer);
    }

    // Calculate score if the answer is correct
    let scoreIncrement = 0;
    if (isCorrect) {
        const baseScore = 100; // Base score for a correct answer
        const maxTime = 30;    // Maximum time allotted (in seconds)
        const timeBonus = Math.max(0, maxTime - timeTaken); // Bonus for faster answers
        scoreIncrement = baseScore + timeBonus;

        // Update player's cumulative score in the session
        session.scores[username] = (session.scores[username] || 0) + scoreIncrement;
    }

    // Record the player's answer details in the session
    session.answers[username] = {
        answer: answer,
        isCorrect: isCorrect,
        timeTaken: timeTaken,
        score: scoreIncrement
    };

    // Broadcast updated leaderboard using Socket.IO
    const io = req.app.get('io');
    if (io) {
        io.to(lobbyCode).emit('leaderboardUpdate', { scores: session.scores });
    }

    res.status(200).json({
        message: "Answer submitted",
        correct: isCorrect,
        scoreIncrement: scoreIncrement,
        session: session
    });
});

/**
 * Advance to the next question in the game session.
 * Expects a request body with:
 *  - lobbyCode: string
 */
router.post('/nextQuestion', (req, res) => {
    const { lobbyCode } = req.body;
    const session = sessions[lobbyCode];

    if (!session) {
        return res.status(404).json({ error: "Game session not found" });
    }

    // Check if there is another question
    if (session.currentQuestionIndex < session.questions.length - 1) {
        session.currentQuestionIndex++;
        // Clear previous answers for the new question
        session.answers = {};

        // Broadcast new question event using Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.to(lobbyCode).emit('newQuestion', {
                currentQuestion: session.questions[session.currentQuestionIndex],
                currentQuestionIndex: session.currentQuestionIndex
            });
        }

        return res.status(200).json({
            message: "Advanced to next question",
            currentQuestionIndex: session.currentQuestionIndex,
            currentQuestion: session.questions[session.currentQuestionIndex]
        });
    } else {
        return res.status(200).json({ message: "Game session complete" });
    }
});

/**
 * Pause the game session.
 * Expects a request body with:
 *  - lobbyCode: string
 */
router.post('/pause', (req, res) => {
    const { lobbyCode } = req.body;
    if (!lobbyCode) {
        return res.status(400).json({ error: "lobbyCode is required" });
    }

    const session = sessions[lobbyCode];
    if (!session) {
        return res.status(404).json({ error: "Game session not found" });
    }

    session.isPaused = true;
    res.status(200).json({ message: "Game session paused", session });
});

/**
 * Resume the game session.
 * Expects a request body with:
 *  - lobbyCode: string
 */
router.post('/resume', (req, res) => {
    const { lobbyCode } = req.body;
    if (!lobbyCode) {
        return res.status(400).json({ error: "lobbyCode is required" });
    }

    const session = sessions[lobbyCode];
    if (!session) {
        return res.status(404).json({ error: "Game session not found" });
    }

    session.isPaused = false;
    res.status(200).json({ message: "Game session resumed", session });
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
    res.json({ session });
});

module.exports = router;
