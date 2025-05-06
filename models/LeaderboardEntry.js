// models/LeaderboardEntry.js

const mongoose = require('mongoose'); // Mongoose for MongoDB object modeling

/**
 * LeaderboardEntrySchema
 * Defines the structure for a single leaderboard entry:
 * - lobbyCode: identifies which game lobby this score belongs to
 * - username:  the player’s username
 * - score:     the player’s current score in that lobby
 * - updatedAt: timestamp for when this entry was last updated
 */
const LeaderboardEntrySchema = new mongoose.Schema({
    lobbyCode: { type: String, required: true },    // Lobby identifier
    username:  { type: String, required: true },    // Player’s username
    score:     { type: Number, default: 0 },        // Player’s score (defaults to 0)
    updatedAt: { type: Date,   default: Date.now }  // When this entry was last modified
});

// Export the model so it can be used in other parts of the application
module.exports = mongoose.model(
    'LeaderboardEntry',
    LeaderboardEntrySchema
);



// models/Lobby.js

const mongoose = require('mongoose'); // Mongoose for MongoDB object modeling

/**
 * LobbySchema
 * Represents a game lobby where players can join:
 * - lobbyCode: unique code for the lobby
 * - host:      username of the lobby creator
 * - players:   list of usernames currently in the lobby
 * - settings:  configuration options (e.g., time limit, player limit)
 * - createdAt: timestamp for when the lobby was created
 */
const LobbySchema = new mongoose.Schema({
    lobbyCode: { type: String, required: true, unique: true }, // Unique lobby code
    host:      { type: String, required: true },               // Lobby host’s username
    players:   { type: [String], default: [] },                // Array of player usernames
    settings:  { type: Object, default: {} },                  // Miscellaneous lobby settings
    createdAt: { type: Date,   default: Date.now }             // Creation timestamp
});

// Export the model for use in lobby-related routes and logic
module.exports = mongoose.model('Lobby', LobbySchema);
