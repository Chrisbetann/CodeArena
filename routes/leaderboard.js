// routes/leaderboard.js
// ─────────────────────────────────────────────────────────────────────────────
// Provides a simple API endpoint to fetch the current leaderboard for a lobby.
// ─────────────────────────────────────────────────────────────────────────────

const express = require('express');
const router  = express.Router();
const Session = require('../models/Session');

/**
 * GET /api/leaderboard?lobbyCode=XYZ
 * Query Params:
 *   - lobbyCode: string identifying which game session’s leaderboard to fetch
 *
 * Response:
 *   - 200: { scores: { username1: points1, username2: points2, … } }
 *   - 400: { error: 'lobbyCode query param required' }
 *   - 404: { error: 'Session not found' }
 */
router.get('/', async (req, res) => {
    const { lobbyCode } = req.query;
    // Ensure a lobbyCode was provided
    if (!lobbyCode) {
        return res.status(400).json({ error: 'lobbyCode query param required' });
    }

    try {
        // Look up the session in the database
        const session = await Session.findOne({ lobbyCode }).lean();
        if (!session) {
            // No session with that lobbyCode
            return res.status(404).json({ error: 'Session not found' });
        }
        // `session.scores` is a plain JS object here thanks to `.lean()`
        const scores = session.scores || {};
        // Return the scores map
        return res.json({ scores });
    } catch (err) {
        console.error('Error loading leaderboard:', err);
        // Database or other error
        return res.status(500).json({ error: 'Could not fetch leaderboard' });
    }
});

module.exports = router;
