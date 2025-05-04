// app.js
require('dotenv').config();

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
    .connect(atlasURI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => console.error('❌ Mongo connection error:', err));

const app = express();

// ─── IMPORT ROUTES ─────────────────────────────────────────────────────────────
const authRoutes        = require('./routes/auth');
const lobbyRoutes       = require('./routes/lobby');
const sessionRoutes     = require('./routes/session');
const questionsRoutes   = require('./routes/questions');
const executeRoute      = require('./routes/execute');
const leaderboardRoutes = require('./routes/leaderboard');

// ─── GLOBAL MIDDLEWARE ────────────────────────────────────────────────────────
app.use(cors());                           // Enable CORS for all requests
app.use(logger('dev'));                    // HTTP request logger
app.use(express.json());                   // Parse JSON bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies
app.use(cookieParser());                   // Parse cookies

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/lobby',      lobbyRoutes);
app.use('/api/session',    sessionRoutes);
app.use('/api/questions',  questionsRoutes);
app.use('/api/execute',    executeRoute);
app.use('/api/leaderboard', leaderboardRoutes);   // ← new leaderboard endpoint

// ─── STATIC FILES ──────────────────────────────────────────────────────────────
// Serves everything under public/ at the web root:
app.use(express.static(path.join(__dirname, 'public')));

// ─── 404 HANDLER ───────────────────────────────────────────────────────────────
app.use((req, res, next) => {
    next(createError(404));
});

// ─── ERROR HANDLER ─────────────────────────────────────────────────────────────
// JSON for /api/*, HTML otherwise
app.use((err, req, res, next) => {
    const status = err.status || 500;

    if (req.path.startsWith('/api/')) {
        return res.status(status).json({ error: err.message || 'Internal Server Error' });
    }

    // fallback HTML error
    res.status(status);
    res.send(`<h1>${status} – ${err.message}</h1>`);
});

module.exports = app;
