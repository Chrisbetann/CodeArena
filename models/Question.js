// models/Question.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─── TestCase Schema ─────────────────────────────────────────────
const TestCaseSchema = new Schema(
    {
        input: {
            type: String,
            required: true
        },
        expectedOutput: {
            type: String,
            required: true
        }
    },
    { _id: false }
);

// ─── Content Entry Schema ────────────────────────────────────────
const ContentEntrySchema = new Schema(
    {
        language: {
            type: String,
            enum: ['Python', 'Java', 'C++', 'python', 'java', 'cpp'],
            required: true
        },
        frame: {
            type: String,
            required: true
        },
        answer: {
            type: String,
            required: true
        }
    },
    { _id: false }
);

// ─── Correct Answer Schema ───────────────────────────────────────
const CorrectAnswerSchema = new Schema(
    {
        python: { type: String, required: true },
        java:   { type: String, required: true },
        cpp:    { type: String, required: true }
    },
    { _id: false }
);

// ─── Question Schema ─────────────────────────────────────────────
const QuestionSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        level: {
            type: String,
            enum: ['Easy', 'Medium', 'Hard'],
            required: true
        },
        description: {
            type: String,
            required: true
        },
        content: {
            type: [ContentEntrySchema],
            default: []
        },
        hint: {
            type: String,
            default: ''
        },
        ans_space_complexity: {
            type: String,
            default: ''
        },
        ans_time_complexity: {
            type: String,
            default: ''
        },
        correctAnswer: {
            type: CorrectAnswerSchema,
            required: true
        },
        // ─── New testCases field ────────────────────────────────────
        testCases: {
            type: [TestCaseSchema],
            default: []
        }
    },
    {
        timestamps: true,     // adds createdAt & updatedAt fields
        versionKey: '__v'     // matches your Atlas dump
    }
);

module.exports = mongoose.model('Question', QuestionSchema);
