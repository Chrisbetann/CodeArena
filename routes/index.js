// routes/index.js
// ─────────────────────────────────────────────────────────────────────────────
// Serves the home page view.
// ─────────────────────────────────────────────────────────────────────────────

var express = require('express');
var router  = express.Router();

/**
 * GET /
 * Renders the main index page using your view engine.
 */
router.get('/', function(req, res, next) {
  // `title` will be available in the template as a variable
  res.render('index', { title: 'Express' });
});

module.exports = router;
