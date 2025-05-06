// models/User.js
// ─────────────────────────────────────────────────────────────────────────────
// Defines the User schema in MongoDB: email, username, password, createdAt.
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,          // Must provide an email
    unique: true             // Enforce unique emails across users
  },
  username: {
    type: String,
    required: true           // Must provide a username
  },
  password: {
    type: String,
    required: true           // Must provide a password (plaintext here; hashed later in auth logic)
  },
  createdAt: {
    type: Date,
    default: Date.now        // Automatically set timestamp when new User is created
  }
});

module.exports = mongoose.model('User', userSchema);
