// routes/auth.js
// ─────────────────────────────────────────────────────────────────────────────
// This file handles user registration and login, issuing JWTs for auth.
// ─────────────────────────────────────────────────────────────────────────────

const express  = require('express');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const router   = express.Router();

// Secret key for signing JWTs (should be set in environment)
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_SECRET';

/**
 * POST /api/auth/register
 * Registers a new user:
 *  - Expects { username, password } in body
 *  - Hashes password, stores user in MongoDB
 *  - Returns 201 on success or 400 if username already taken / missing fields
 */
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    // Validate input
    if (!username || !password) {
        return res.status(400).json({ error: 'username & password required' });
    }
    try {
        // Create user, hash password, save to DB
        const user = new User({ username });
        await user.setPassword(password);
        await user.save();
        // Respond with success message
        return res.status(201).json({ message: 'User created' });
    } catch (err) {
        console.error('Register error:', err);
        // Likely a duplicate-username error
        return res.status(400).json({ error: 'Username already taken' });
    }
});

/**
 * POST /api/auth/login
 * Authenticates a user:
 *  - Expects { username, password } in body
 *  - Validates credentials against stored hash
 *  - On success, issues a JWT valid for 7 days
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    // Validate input
    if (!username || !password) {
        return res.status(400).json({ error: 'username & password required' });
    }
    try {
        // Find user and verify password
        const user = await User.findOne({ username });
        if (!user || !(await user.validatePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Sign a JWT payload with user ID & username
        const token = jwt.sign(
            { sub: user._id.toString(), username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        // Return JWT and username for client storage
        return res.json({ token, username: user.username });
    } catch (err) {
        console.error('Login error:', err);
        // Unexpected error during login
        return res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
