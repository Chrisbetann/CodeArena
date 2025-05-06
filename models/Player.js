// models/Player.js

const mongoose = require('mongoose');
const { Schema } = mongoose; // Destructure Schema constructor from Mongoose

/**
 * QuizDetailSchema (sub‐schema)
 * Stores details of an individual quiz attempt:
 * - questions_id:   reference to the Question document
 * - question_answer: the answer provided by the player
 * - question_score:  score earned for this question
 * - time_begin:      when the player started this question
 * - time_end:        when the player submitted this question
 * Note: _id is disabled to avoid separate document IDs for each entry.
 */
const QuizDetailSchema = new Schema(
    {
        questions_id: {
            type: Schema.Types.ObjectId,
            ref: 'Question',
            required: true
        },
        question_answer: {
            type: String,
            required: true
        },
        question_score: {
            type: Number,
            required: true
        },
        time_begin: {
            type: Date,
            required: true
        },
        time_end: {
            type: Date,
            required: true
        }
    },
    { _id: false } // Prevent an automatic _id for each quiz detail subdocument
);

/**
 * PlayerSchema
 * Represents a player in the system:
 * - name:         display name of the player
 * - username:     unique identifier for login and leaderboard
 * - rank:         current rank or level of the player
 * - quiz_details: array of QuizDetailSchema entries for past attempts
 * - rooms_id:     reference to the Room (lobby) the player belongs to
 * - score_total:  cumulative score across all sessions
 * Additionally, timestamps are enabled to record when each Player doc is created/updated, and versionKey is set.
 */
const PlayerSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        rank: {
            type: Number,
            required: true,
            default: 0
        },
        quiz_details: {
            type: [QuizDetailSchema],
            default: []
        },
        rooms_id: {
            type: Schema.Types.ObjectId,
            ref: 'Room',
            required: true,
            index: true
        },
        score_total: {
            type: Number,
            required: true,
            default: 0
        }
    },
    {
        timestamps: true,   // Automatically add createdAt and updatedAt fields
        versionKey: '__v'   // Use __v to track document version (matches existing dumps)
    }
);

// Export the Player model for use in authentication, scoring, and session management
module.exports = mongoose.model('Player', PlayerSchema);