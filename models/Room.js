// models/Room.js
const mongoose = require('mongoose')
const { Schema } = mongoose

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
        timestamps: { createdAt: true, updatedAt: false }, // only createdAt
        versionKey: '__v'
    }
)

module.exports = mongoose.model('Room', RoomSchema)
