const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true // ensures no two users share the same email
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true // storing plain text password (not recommended for production)
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);