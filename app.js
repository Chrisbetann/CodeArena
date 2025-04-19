// app.js
require('dotenv').config();

const createError   = require('http-errors');
const express       = require('express');
const path          = require('path');
const cookieParser  = require('cookie-parser');
const logger        = require('morgan');
const cors          = require('cors');
const mongoose      = require('mongoose');

// Connection string from .env (or fallback hard‐coded URI)
const atlasURI = process.env.MONGO_URI
    || 'mongodb+srv://caUser:sfac123@codearena.fo5no.mongodb.net/CodeArena?retryWrites=true&w=majority';

// Connect to MongoDB Atlas
mongoose
    .connect(atlasURI, { /* optional mongoose flags */ })
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ Mongo connection error:", err));

const app = express();

// Import routes
const authRoutes      = require('./routes/auth');
const lobbyRoutes     = require('./routes/lobby');
const sessionRoutes   = require('./routes/session');
const questionsRoutes = require('./routes/questions');
// 👇 Execute route for code execution
const executeRoute    = require('./routes/execute');

// ─── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(cors());                       // Enable CORS for all requests
app.use(logger('dev'));                // HTTP request logger
app.use(express.json());               // bodyParser for JSON
app.use(express.urlencoded({ extended: false })); // bodyParser for URL-encoded
app.use(cookieParser());               // cookie parsing

// ─── STATIC FILES ──────────────────────────────────────────────────────────────
// Serve everything in /public at the web root:
// - GET /game.html            → public/game.html
// - GET /images/foo.png       → public/images/foo.png
// - GET /code-arena/script.js → public/code-arena/script.js
app.use(express.static(path.join(__dirname, 'public')));

// ─── API ROUTES ────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/lobby',     lobbyRoutes);
app.use('/api/session',   sessionRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/execute',   executeRoute);  // mounted before 404

// ─── 404 HANDLER ───────────────────────────────────────────────────────────────
// If no static file or API route matched, this will catch the 404.
app.use((req, res, next) => {
  next(createError(404));
});

// ─── ERROR HANDLER ─────────────────────────────────────────────────────────────
// Renders a Pug error page (assuming you have views/error.pug).
// If you’d rather return JSON for API calls, detect req.path.startsWith('/api')
// and `res.json({ error: err.message })` instead.
app.use((err, req, res, next) => {
  // Set locals for the view
  res.locals.message = err.message;
  res.locals.error   = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
