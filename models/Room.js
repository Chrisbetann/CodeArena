// models/Room.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * RoomSchema
 * Represents a game “room” or lobby:
 * - name:          human‐friendly room name
 * - created_by:    username of the creator
 * - code:          unique numeric room code for joining
 * - question_set:  array of Question ObjectIds assigned to this room
 * - players:       array of Player ObjectIds currently in the room
 * - player_limit:  maximum number of players allowed (0 = unlimited)
 * - time_limit_sec: optional per‐room time limit, in seconds
 *
 * timestamps creates a createdAt only (no updatedAt), versionKey tracks schema version.
 */
const RoomSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        created_by: {
            type: String,
            required: true
        },
        code: {
            type: Number,
            required: true,
            unique: true
        },
        question_set: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Question',
                required: true
            }
        ],
        players: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Player'
            }
        ],
        player_limit: {
            type: Number,
            default: 0
        },
        time_limit_sec: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: { createdAt: true, updatedAt: false }, // only record creation time
        versionKey: '__v'                                  // match existing dumps
    }
);

// Export the Room model for use in lobby and session management
module.exports = mongoose.model('Room', RoomSchema);
