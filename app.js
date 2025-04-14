// app.js
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors'); // Added CORS middleware

// Updated MongoDB Atlas connection string with Nadia's credentials
const atlasURI = 'mongodb+srv://caUser:sfac123@codearena.fo5no.mongodb.net/CodeArena?retryWrites=true&w=majority';

mongoose.connect(atlasURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch((err) => console.error("Failed to connect to MongoDB Atlas", err));

// Import your new auth route
const authRoutes = require('./routes/auth');
const lobbyRoutes = require('./routes/lobby');
const sessionRoutes = require('./routes/session');
const questionsRoutes = require('./routes/questions');


const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Enable CORS for all routes (you can adjust the origin as needed)
app.use(cors());

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../code-arena')));


// Mount the auth routes under "/api/auth"
app.use('/api/auth', authRoutes);
app.use('/api/lobby', lobbyRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/questions', questionsRoutes);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;