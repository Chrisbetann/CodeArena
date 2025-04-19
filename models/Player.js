// models/Player.js

const mongoose = require('mongoose');

const QuizDetailSchema = new mongoose.Schema({
    questions_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    question_answer:{ type: String, default: '' },
    question_score: { type: Number, default: 0 },
    time_begin:     { type: Date, default: Date.now },
    time_end:       { type: Date, default: Date.now }
}, { _id: false });

const PlayerSchema = new mongoose.Schema({
    name:          { type: String, required: true },
    rank:          { type: Number, default: 0 },
    quiz_details:  { type: [QuizDetailSchema], default: [] },
    rooms_id:      { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    score_total:   { type: Number, default: 0 },
    createdAt:     { type: Date, default: Date.now }
});

module.exports = mongoose.model('Player', PlayerSchema);