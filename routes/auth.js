// routes/auth.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// In a production environment, you would import your User model here
// const User = require('../models/User');

// Secret key for JWT signing. For production, store this in an environment variable.
const SECRET_KEY = 'YOUR_SECRET_KEY_HERE';

// Registration Endpoint
router.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const userId = 'user_id_here'; // Replace with newUser._id when using a DB

        // Generate a JWT token for auto-login
        const token = jwt.sign({ userId: userId }, SECRET_KEY, { expiresIn: '1h' });

        // Respond with the registration success message, user info, and token
        return res.status(201).json({
            message: `Registration successful! Welcome, ${username}!`,
            user: {
                id: userId,
                username: username
            },
            token: token
        });
    } catch (error) {
        return res.status(500).json({ error: 'Something went wrong' });
    }
});

// Login Endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // For demonstration, assume the user is found with these details:
        const userId = 'user_id_here';       // Replace with user._id
        const username = 'host_username';     // Replace with user.username
        const userEmail = 'host_email@example.com'; // Replace with user.email

        // Generate a JWT token
        const token = jwt.sign({ userId: userId }, SECRET_KEY, { expiresIn: '1h' });

        // Respond with the login success structure
        return res.json({
            token: token,
            user: {
                id: userId,
                username: username,
                email: userEmail
            }
        });
    } catch (error) {
        return res.status(500).json({ error: 'Error logging in' });
    }
});

module.exports = router;
