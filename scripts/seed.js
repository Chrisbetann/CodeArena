

// models
const Question = require('../models/Question');
const User     = require('../models/User');
const Room     = require('../models/Room');
const Player   = require('../models/Player');

// raw JSON
const rawQuestions = require('../data/game.questions.json');
const rawUsers     = require('../data/game.users.json');
const rawRooms     = require('../data/game.rooms.json');
const rawPlayers   = require('../data/game.players.json');

/**
 * Recursively walk any JS value and normalize:
 *  - { $oid: "..." }       → ObjectId
 *  - { $date: "..." }      → Date
 *  - { $timestamp: {t,i} } → Date(t*1000)
 *  - { $numberLong: "..."} → Number
 */
function normalizeValue(val) {
    if (Array.isArray(val)) {
        return val.map(normalizeValue);
    }
    if (val && typeof val === 'object') {
        // ObjectId
        if (typeof val.$oid === 'string') {
            return new Types.ObjectId(val.$oid);
        }
        // Date from $date
        if (typeof val.$date === 'string') {
            return new Date(val.$date);
        }
        // Timestamp
        if (val.$timestamp && typeof val.$timestamp.t === 'number') {
            return new Date(val.$timestamp.t * 1000);
        }
        // numberLong
        if (typeof val.$numberLong === 'string') {
            return Number(val.$numberLong);
        }
        // otherwise recurse
        const out = {};
        for (const [k,v] of Object.entries(val)) {
            out[k] = normalizeValue(v);
        }
        return out;
    }
    return val;
}

/** Strip out any Extended JSON wrappers throughout each document */
function normalizeArray(arr) {
    return arr.map(doc => {
        const clone = normalizeValue(doc);
        // if they provided a top‑level _id, keep it; otherwise let Mongo assign one.
        if (!clone._id) delete clone._id;
        return clone;
    });
}

async function seed() {
    try {
        // 1) connect
        const uri = process.env.MONGO_URI ||
            'mongodb+srv://caUser:sfac123@codearena.fo5no.mongodb.net/CodeArena?retryWrites=true&w=majority';
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        // 2) clear
        await Promise.all([
            Question.deleteMany({}),
            User.deleteMany({}),
            Room.deleteMany({}),
            Player.deleteMany({}),
        ]);
        console.log('🗑️  Cleared existing collections');

        // 3) normalize & insert
        const questions = normalizeArray(rawQuestions);
        await Question.insertMany(questions);
        console.log(`📥 Inserted ${questions.length} questions`);

        const users = normalizeArray(rawUsers);
        await User.insertMany(users);
        console.log(`📥 Inserted ${users.length} users`);

        const rooms = normalizeArray(rawRooms);
        await Room.insertMany(rooms);
        console.log(`📥 Inserted ${rooms.length} rooms`);

        const players = normalizeArray(rawPlayers);
        await Player.insertMany(players);
        console.log(`📥 Inserted ${players.length} players`);

        console.log('🎉 Seeding complete!');
    } catch (err) {
        console.error('❌ Seeding error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

seed();
