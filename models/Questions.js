// models/Question.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    correctAnswer: { type: String, required: true },
    title: { type: String },
    url: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', QuestionSchema);