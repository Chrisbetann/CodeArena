// routes/lobby.js
// ─────────────────────────────────────────────────────────────────────────────
// Handles lobby creation, joining, and retrieval (game “rooms”).
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();
const Lobby   = require('../models/Lobby');

/**
 * POST /api/lobby/create
 * Body: { lobbyCode, host, playerLimit?, timeLimit? }
 *
 * Creates a new Lobby document with the given settings.
 * - lobbyCode: unique identifier for this lobby
 * - host: username of the creator
 * - playerLimit: optional max number of players
 * - timeLimit: optional time limit per question (in seconds)
 *
 * Responds with 201 and the created lobby on success, or 500 on error.
 */
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
        return res.status(201).json(newLobby);
    } catch (err) {
        console.error('Could not create lobby:', err);
        return res.status(500).json({ error: 'Could not create lobby' });
    }
});

/**
 * POST /api/lobby/:lobbyCode/join
 * Body: { username }
 *
 * Adds the given username to the players array of the specified lobby,
 * if they aren’t already present.
 * Responds with the updated lobby document or an error.
 */
router.post('/:lobbyCode/join', async (req, res) => {
    const { username } = req.body;
    try {
        const lobby = await Lobby.findOne({ lobbyCode: req.params.lobbyCode });
        if (!lobby) {
            return res.status(404).json({ error: 'Lobby not found' });
        }
        if (!lobby.players.includes(username)) {
            lobby.players.push(username);
            await lobby.save();
        }
        return res.json(lobby);
    } catch (err) {
        console.error('Could not join lobby:', err);
        return res.status(500).json({ error: 'Could not join lobby' });
    }
});

/**
 * GET /api/lobby/:lobbyCode
 *
 * Retrieves the lobby data (host, players, settings) for the given code.
 * Useful for clients to refresh lobby state.
 */
router.get('/:lobbyCode', async (req, res) => {
    try {
        const lobby = await Lobby.findOne({ lobbyCode: req.params.lobbyCode });
        if (!lobby) {
            return res.status(404).json({ error: 'Lobby not found' });
        }
        return res.json(lobby);
    } catch (err) {
        console.error('Could not fetch lobby:', err);
        return res.status(500).json({ error: 'Could not fetch lobby' });
    }
});

module.exports = router;
