// models/Lobby.js

const mongoose = require('mongoose'); // Import Mongoose for MongoDB object modeling

/**
 * LobbySchema
 * Represents a game lobby where multiple players can join and play together.
 * Fields:
 * - lobbyCode: unique identifier for the lobby
 * - host:      username of the player who created the lobby
 * - players:   array of usernames currently in the lobby
 * - settings:  arbitrary configuration options for the lobby (e.g., time limits)
 * - createdAt: timestamp marking when the lobby was created
 */
const LobbySchema = new mongoose.Schema({
    lobbyCode: { type: String, required: true, unique: true }, // Unique lobby code
    host:      { type: String, required: true },               // Creator of the lobby
    players:   { type: [String], default: [] },                // List of players in the lobby
    settings:  { type: Object, default: {} },                  // Lobby settings (customizable)
    createdAt: { type: Date,   default: Date.now }             // Creation timestamp
});

// Export the Lobby model for use in routes and business logic
module.exports = mongoose.model('Lobby', LobbySchema);