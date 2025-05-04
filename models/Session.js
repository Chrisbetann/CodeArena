// models/Session.js

const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    username:       String,
    questionId:     mongoose.Types.ObjectId,
    code:           String,
    output:         String,     // ← new: capture the program’s stdout
    language:       String,
    timeTaken:      Number,
    scoreIncrement: Number,
    isCorrect:      Boolean,
    createdAt:      { type: Date, default: Date.now }
});

const SessionSchema = new mongoose.Schema({
    lobbyCode:            { type: String, required: true, index: true },
    questions:            [{ type: mongoose.Types.ObjectId, ref: 'Question' }],
    currentQuestionIndex: { type: Number, default: 0 },
    submissions:          [SubmissionSchema],
    scores:               { type: Map, of: Number, default: {} },
    isPaused:             { type: Boolean, default: false },
    createdAt:            { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', SessionSchema);
