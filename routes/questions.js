// routes/questions.js
const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// GET /api/questions
router.get('/', async (req, res) => {
    try {
        const questions = await Question.find({});
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: "Error retrieving questions", details: err.message });
    }
});

module.exports = router;