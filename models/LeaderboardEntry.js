// models/LeaderboardEntry.js
const mongoose = require('mongoose');

const LeaderboardEntrySchema = new mongoose.Schema({
    lobbyCode: { type: String, required: true },
    username:  { type: String, required: true },
    score:     { type: Number, default: 0 },
    updatedAt: { type: Date,   default: Date.now }
});

module.exports = mongoose.model(
    'LeaderboardEntry',
    LeaderboardEntrySchema
);
