// routes/questions.js
// ─────────────────────────────────────────────────────────────────────────────
// Exposes the question bank (coding challenges) to clients.
// ─────────────────────────────────────────────────────────────────────────────

const express  = require('express');
const router   = express.Router();
const Question = require('../models/Question');

/**
 * GET /api/questions
 *
 * Fetches all coding questions from the database, including:
 * - id (stringified ObjectId)
 * - title, level, description
 * - content frames, hints, complexity info
 * - testCases for automated judging
 *
 * Returns an array of question objects.
 */
router.get('/', async (req, res, next) => {
    try {
        // Get raw Mongo documents as plain JS objects (lean => better perf)
        const docs = await Question.find({}).lean();

        // Transform each document into the shape the frontend expects
        const questions = docs.map(q => ({
            id:                   q._id.toString(),
            title:                q.title,
            level:                q.level,
            description:          q.description,
            content:              q.content,
            hint:                 q.hint,
            ans_space_complexity: q.ans_space_complexity,
            ans_time_complexity:  q.ans_time_complexity,
            testCases:            q.testCases || []
        }));

        return res.json(questions);
    } catch (err) {
        console.error('Error loading questions:', err);
        return next(err);
    }
});

module.exports = router;
