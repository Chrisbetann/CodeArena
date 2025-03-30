// routes/lobby.js
const express = require('express');
const router = express.Router();

// In-memory store for lobbies (for demonstration purposes)
let lobbies = {};

// Helper function to generate a random lobby code (6-character alphanumeric)
function generateLobbyCode(length = 6) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Endpoint to create a new lobby
// POST /api/lobby/create
router.post('/create', (req, res) => {
    const hostUsername = req.body.hostUsername || "Host";
    const settings = req.body.settings || {}; // Optional game settings

    // Generate a unique lobby code
    let lobbyCode = generateLobbyCode();
    while (lobbies[lobbyCode]) {
        lobbyCode = generateLobbyCode();
    }

    // Create the lobby object
    lobbies[lobbyCode] = {
        host: hostUsername,
        players: [], // Players will join later
        settings: settings
    };

    res.status(201).json({
        message: "Lobby created successfully",
        lobbyCode: lobbyCode
    });
});

// Endpoint for a guest to join a lobby
// POST /api/lobby/join
router.post('/join', (req, res) => {
    const { lobbyCode, username } = req.body;
    if (!lobbyCode || !username) {
        return res.status(400).json({ error: "Lobby code and username are required" });
    }

    const lobby = lobbies[lobbyCode];
    if (!lobby) {
        return res.status(404).json({ error: "Lobby not found" });
    }

    // Prevent duplicate joins
    if (lobby.players.includes(username)) {
        return res.status(400).json({ error: "User already in lobby" });
    }

    lobby.players.push(username);
    res.status(200).json({
        message: "Joined lobby successfully",
        lobby: lobby
    });
});

// Endpoint to update game configuration for a lobby (Host Controls)
// POST /api/lobby/:lobbyCode/config
router.post('/:lobbyCode/config', (req, res) => {
    const lobbyCode = req.params.lobbyCode;
    const newSettings = req.body.settings; // Expected object: e.g., { difficulty: 'hard', language: 'Python' }

    // Validate the lobby exists
    const lobby = lobbies[lobbyCode];
    if (!lobby) {
        return res.status(404).json({ error: "Lobby not found" });
    }

    // Update lobby settings by merging existing settings with the new ones
    lobby.settings = { ...lobby.settings, ...newSettings };

    res.status(200).json({
        message: "Lobby configuration updated successfully",
        settings: lobby.settings
    });
});

// (Optional) Endpoint to get lobby details
// GET /api/lobby/:lobbyCode
router.get('/:lobbyCode', (req, res) => {
    const lobbyCode = req.params.lobbyCode;
    const lobby = lobbies[lobbyCode];
    if (!lobby) {
        return res.status(404).json({ error: "Lobby not found" });
    }
    res.json({ lobby: lobby });
});

module.exports = router;
