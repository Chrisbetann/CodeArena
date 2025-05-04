// routes/leaderboard.js
const express = require('express');
const router  = express.Router();
const Session = require('../models/Session');

/**
 * GET /api/leaderboard?lobbyCode=XYZ
 * Returns the current scores map for that lobbyCode.
 */
router.get('/', async (req, res) => {
    const { lobbyCode } = req.query;
    if (!lobbyCode) {
        return res.status(400).json({ error: 'lobbyCode query param required' });
    }

    try {
        const session = await Session.findOne({ lobbyCode }).lean();
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }
        // session.scores is already a plain JS object when using .lean()
        const scores = session.scores || {};
        return res.json({ scores });
    } catch (err) {
        console.error('Error loading leaderboard:', err);
        return res.status(500).json({ error: 'Could not fetch leaderboard' });
    }
});

module.exports = router;
