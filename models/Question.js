// models/Question.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * TestCaseSchema
 * Defines the shape of a single test case for a coding question:
 * - input:          the stdin string to feed into the user's program
 * - expectedOutput: the exact stdout we expect back (string)
 * _id is disabled because we don’t need individual ObjectIds for each test.
 */
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

/**
 * ContentEntrySchema
 * Stores a code scaffold / starter snippet for each supported language:
 * - language: one of Python, Java, C++ (case variations allowed)
 * - frame:    the code template or prompt text
 * - answer:   the canonical solution snippet in that language
 * _id is disabled since these are embedded sub‐documents.
 */
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

/**
 * CorrectAnswerSchema
 * Bundles the fully correct solution for each language:
 * - python: solution code in Python
 * - java:   solution code in Java
 * - cpp:    solution code in C++
 * _id disabled as it’s part of the parent Question document.
 */
const CorrectAnswerSchema = new Schema(
    {
        python: { type: String, required: true },
        java:   { type: String, required: true },
        cpp:    { type: String, required: true }
    },
    { _id: false }
);

/**
 * QuestionSchema
 * The main document for each coding challenge:
 * - title:               the question’s title
 * - level:               difficulty (Easy/Medium/Hard)
 * - description:         problem statement in Markdown/text
 * - content:             optional starter code per language
 * - hint:                an optional textual hint
 * - ans_space_complexity: declared space complexity
 * - ans_time_complexity:  declared time complexity
 * - correctAnswer:       embeds the CorrectAnswerSchema
 * - testCases:           array of TestCaseSchema, used by judgeRunner
 *
 * Timestamps adds createdAt/updatedAt; versionKey tracks schema version.
 */
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
        // New testCases field for automated testing harness
        testCases: {
            type: [TestCaseSchema],
            default: []
        }
    },
    {
        timestamps: true,     // auto‐adds createdAt & updatedAt
        versionKey: '__v'     // matches existing collection dumps
    }
);

// Export the Question model for use in routes and judgeRunner
module.exports = mongoose.model('Question', QuestionSchema);
