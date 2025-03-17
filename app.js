/***************************************************************************
 * app.js (Typical Express Generator Structure)
 ***************************************************************************/

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

//route files

const app = express();


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// If you have routes, mount them here:


/*
  Catch 404 and forward to error handler
*/
app.use(function (req, res, next) {
  next(createError(404));
});

/*
  Error Handler
*/
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page (or send JSON if you prefer)
  res.status(err.status || 500);
  res.render('error');
});

/*
  Export the Express app.
  This is critical so that bin/www can import it,
  set the port, attach Socket.IO, and call server.listen().
*/
module.exports = app;
