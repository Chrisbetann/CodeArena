// models/User.js

const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

/**
 * UserSchema
 * Represents an authenticated user account:
 * - username:     unique login identifier
 * - passwordHash: bcrypt hash of the user’s password
 * Timestamps option adds createdAt and updatedAt automatically.
 */
const UserSchema = new mongoose.Schema({
    username:     { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true }
}, {
    timestamps: true
});

/**
 * setPassword
 * Instance method to hash and store a plain-text password.
 * Uses bcrypt with a cost factor of 10.
 */
UserSchema.methods.setPassword = async function(plain) {
    this.passwordHash = await bcrypt.hash(plain, 10);
};

/**
 * validatePassword
 * Instance method to compare a plain-text password to the stored hash.
 * Returns true if they match.
 */
UserSchema.methods.validatePassword = async function(plain) {
    return bcrypt.compare(plain, this.passwordHash);
};

// Export the User model for use in authentication routes
module.exports = mongoose.model('User', UserSchema);
