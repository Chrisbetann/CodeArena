// models/Question.js
const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
    language: String,
    frame:    String,
    answer:   String
}, { _id: false });

const QuestionSchema = new mongoose.Schema({
    title:              String,
    level:              String,
    description:        String,
    content:            [ContentSchema],
    hint:               String,
    ans_space_complexity: String,
    ans_time_complexity: String
});

module.exports = mongoose.model('Question', QuestionSchema);