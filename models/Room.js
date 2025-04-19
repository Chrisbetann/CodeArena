// models/Room.js

const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    name:         { type: String, required: true },
    created_by:   { type: String, required: true },        // or mongoose.Types.ObjectId if you reference User
    code:         { type: Number, required: true, unique: true },
    question_set: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    players:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
    player_limit: { type: Number, default: 0 },
    time_limit_sec: { type: Number, default: 0 },
    createdAt:    { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', RoomSchema);