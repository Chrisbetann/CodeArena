// models/Player.js
const mongoose = require('mongoose')
const { Schema } = mongoose

// Sub‐schema for each quiz detail entry
const QuizDetailSchema = new Schema(
    {
        // matches "questions_id" in Atlas
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
    { _id: false } // prevent separate _id for each subdocument
)

// Main Player schema
const PlayerSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        // you did not show "username" in Atlas dump, but if you store it:
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
        // matches your "rooms_id"
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
        timestamps: true, // auto‐adds createdAt & updatedAt
        versionKey: '__v' // your dump shows "__v": 0
    }
)

module.exports = mongoose.model('Player', PlayerSchema)
