const express = require('express');
const router  = express.Router();
const Lobby   = require('../models/Lobby');

// Create a new lobby
router.post('/create', async (req, res) => {
    const { lobbyCode, host, playerLimit, timeLimit } = req.body;
    if (!lobbyCode || !host) {
        return res.status(400).json({ error: 'lobbyCode and host are required' });
    }

    try {
        const newLobby = await Lobby.create({
            lobbyCode,
            host,
            settings: { playerLimit, timeLimit }
        });
        res.status(201).json(newLobby);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not create lobby' });
    }
});

// Join a lobby
router.post('/:lobbyCode/join', async (req, res) => {
    const { username } = req.body;
    try {
        const lobby = await Lobby.findOne({ lobbyCode: req.params.lobbyCode });
        if (!lobby) return res.status(404).json({ error: 'Lobby not found' });

        // Add player if not already in
        if (!lobby.players.includes(username)) {
            lobby.players.push(username);
            await lobby.save();
        }
        res.json(lobby);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not join lobby' });
    }
});

// Get lobby data
router.get('/:lobbyCode', async (req, res) => {
    try {
        const lobby = await Lobby.findOne({ lobbyCode: req.params.lobbyCode });
        if (!lobby) return res.status(404).json({ error: 'Lobby not found' });
        res.json(lobby);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not fetch lobby' });
    }
});

module.exports = router;
