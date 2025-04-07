// models/Lobby.js
const mongoose = require('mongoose');

const LobbySchema = new mongoose.Schema({
    lobbyCode: { type: String, required: true, unique: true },
    host: { type: String, required: true },
    players: { type: [String], default: [] },
    settings: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lobby', LobbySchema);
