// routes/lobby.js
const express = require('express');
const router = express.Router();
const Lobby = require('../models/Lobby'); // Step 1: Import the Lobby model

// Remove in-memory store: let lobbies = {};

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
router.post('/create', async (req, res) => {
    try {
        const hostUsername = req.body.hostUsername || "Host";
        const settings = req.body.settings || {}; // Optional game settings

        // Generate a unique lobby code by checking the database
        let lobbyCode = generateLobbyCode();
        while (await Lobby.findOne({ lobbyCode })) {
            lobbyCode = generateLobbyCode();
        }

        // Create the lobby document in the database
        const lobby = await Lobby.create({
            lobbyCode,
            host: hostUsername,
            players: [], // Players will join later
            settings: settings
        });

        res.status(201).json({
            message: "Lobby created successfully",
            lobbyCode: lobby.lobbyCode
        });
    } catch (error) {
        res.status(500).json({ error: "Error creating lobby", details: error.message });
    }
});

// Endpoint for a guest to join a lobby
// POST /api/lobby/join
router.post('/join', async (req, res) => {
    try {
        const { lobbyCode, username } = req.body;
        if (!lobbyCode || !username) {
            return res.status(400).json({ error: "Lobby code and username are required" });
        }

        const lobby = await Lobby.findOne({ lobbyCode });
        if (!lobby) {
            return res.status(404).json({ error: "Lobby not found" });
        }

        // Prevent duplicate joins
        if (lobby.players.includes(username)) {
            return res.status(400).json({ error: "User already in lobby" });
        }

        lobby.players.push(username);
        await lobby.save();

        res.status(200).json({
            message: "Joined lobby successfully",
            lobby: lobby
        });
    } catch (error) {
        res.status(500).json({ error: "Error joining lobby", details: error.message });
    }
});

// Endpoint to update game configuration for a lobby (Host Controls)
// POST /api/lobby/:lobbyCode/config
router.post('/:lobbyCode/config', async (req, res) => {
    try {
        const lobbyCode = req.params.lobbyCode;
        const newSettings = req.body.settings; // Expected object: e.g., { difficulty: 'hard', language: 'Python' }

        const lobby = await Lobby.findOne({ lobbyCode });
        if (!lobby) {
            return res.status(404).json({ error: "Lobby not found" });
        }

        // Update lobby settings by merging existing settings with the new ones
        lobby.settings = { ...lobby.settings, ...newSettings };
        await lobby.save();

        res.status(200).json({
            message: "Lobby configuration updated successfully",
            settings: lobby.settings
        });
    } catch (error) {
        res.status(500).json({ error: "Error updating lobby configuration", details: error.message });
    }
});

// Endpoint to get lobby details
// GET /api/lobby/:lobbyCode
router.get('/:lobbyCode', async (req, res) => {
    try {
        const lobbyCode = req.params.lobbyCode;
        const lobby = await Lobby.findOne({ lobbyCode });
        if (!lobby) {
            return res.status(404).json({ error: "Lobby not found" });
        }
        res.json({ lobby: lobby });
    } catch (error) {
        res.status(500).json({ error: "Error retrieving lobby", details: error.message });
    }
});

module.exports = router;
