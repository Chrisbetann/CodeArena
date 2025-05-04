// models/User.js

const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const UserSchema = new mongoose.Schema({
    username:     { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true }
}, {
    timestamps: true
});

// Set (and hash) a plain-text password
UserSchema.methods.setPassword = async function(plain) {
    this.passwordHash = await bcrypt.hash(plain, 10);
};

// Check a plain-text password against the stored hash
UserSchema.methods.validatePassword = async function(plain) {
    return bcrypt.compare(plain, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
