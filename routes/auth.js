// routes/auth.js

const express  = require('express');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const router   = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_SECRET';

// POST /api/auth/register
// Body: { username, password }
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'username & password required' });
    }
    try {
        const user = new User({ username });
        await user.setPassword(password);
        await user.save();
        return res.status(201).json({ message: 'User created' });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(400).json({ error: 'Username already taken' });
    }
});

// POST /api/auth/login
// Body: { username, password }
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'username & password required' });
    }
    try {
        const user = await User.findOne({ username });
        if (!user || !(await user.validatePassword(password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Create a JWT for future authenticated requests
        const token = jwt.sign(
            { sub: user._id.toString(), username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        return res.json({ token, username: user.username });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Login failed' });
    }
});

module.exports = router;
