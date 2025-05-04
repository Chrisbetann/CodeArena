// routes/questions.js
const express  = require('express');
const router   = express.Router();
const Question = require('../models/Question');

/**
 * GET /api/questions
 * Returns an array of all questions with testCases included.
 */
router.get('/', async (req, res, next) => {
    try {
        // Fetch plain JS objects for efficiency
        const docs = await Question.find({}).lean();

        // Map _id to id and include all needed fields
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

        res.json(questions);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
