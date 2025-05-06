// app.js
// ─────────────────────────────────────────────────────────────────────────────
// Entry point for the Express server: connects to MongoDB Atlas, wires up middleware,
// mounts all route handlers, serves static files, and handles errors.
// ─────────────────────────────────────────────────────────────────────────────

require('dotenv').config();            // Load .env into process.env

const createError   = require('http-errors');
const express       = require('express');
const path          = require('path');
const cookieParser  = require('cookie-parser');
const logger        = require('morgan');
const cors          = require('cors');
const mongoose      = require('mongoose');

// ─── CONNECT TO MONGODB ATLAS ────────────────────────────────────────────────
const atlasURI = process.env.MONGO_URI
    || 'mongodb+srv://caUser:sfac123@codearena.fo5no.mongodb.net/CodeArena?retryWrites=true&w=majority';

mongoose
    .connect(atlasURI)                  // Establish connection to our Atlas cluster
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ Mongo connection error:', err));

const app = express();

// ─── IMPORT ROUTES ─────────────────────────────────────────────────────────────
// Each handles a specific API namespace (auth, lobby, session, etc.)
const authRoutes        = require('./routes/auth');
const lobbyRoutes       = require('./routes/lobby');
const sessionRoutes     = require('./routes/session');
const questionsRoutes   = require('./routes/questions');
const executeRoute      = require('./routes/execute');
const leaderboardRoutes = require('./routes/leaderboard');

// ─── GLOBAL MIDDLEWARE ────────────────────────────────────────────────────────
app.use(cors());                        // Allow cross-origin requests
app.use(logger('dev'));                 // Log HTTP requests to console
app.use(express.json());                // Parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies
app.use(cookieParser());                // Parse cookies in requests

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);        // User registration & login
app.use('/api/lobby',       lobbyRoutes);       // Lobby creation/joining
app.use('/api/session',     sessionRoutes);     // Quiz session management
app.use('/api/questions',   questionsRoutes);   // Fetch available questions
app.use('/api/execute',     executeRoute);      // Compile/run user code
app.use('/api/leaderboard', leaderboardRoutes); // Leaderboard data

// ─── STATIC FILES ──────────────────────────────────────────────────────────────
// Serve front-end files (HTML, CSS, JS) from public/
app.use(express.static(path.join(__dirname, 'public')));

// ─── 404 HANDLER ───────────────────────────────────────────────────────────────
// Catch-all for any request that didn’t match a route → forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// ─── ERROR HANDLER ─────────────────────────────────────────────────────────────
// Format API errors as JSON, page errors as HTML
app.use((err, req, res, next) => {
    const status = err.status || 500;

    if (req.path.startsWith('/api/')) {
        // API request → JSON error
        return res.status(status).json({ error: err.message || 'Internal Server Error' });
    }

    // Non-API → simple HTML error page
    res.status(status);
    res.send(`<h1>${status} – ${err.message}</h1>`);
});

module.exports = app;
