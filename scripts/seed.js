// scripts/seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');

async function seed() {
    try {
        const uri = process.env.MONGO_URI ||
            'mongodb+srv://caUser:sfac123@codearena.fo5no.mongodb.net/CodeArena?retryWrites=true&w=majority';
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        const cases = [
            // ── Two Sum ───────────────────────────────────────────────
            {
                id: '67db5a5a84386134e0f8c68f',
                testCases: [
                    { input: '2 7 11 15 9\n', expectedOutput: '[0,1]\n' },
                    { input: '3 2 4 6\n',       expectedOutput: '[1,2]\n' }
                ]
            },
            // ── Valid Parenthesis ────────────────────────────────────
            {
                id: '67e04feb90ec517221de2b7f',
                testCases: [
                    { input: '()\n',      expectedOutput: 'true\n' },
                    { input: '()[]{}\n',  expectedOutput: 'true\n' },
                    { input: '(]\n',      expectedOutput: 'false\n' },
                    { input: '{[]}\n',    expectedOutput: 'true\n' }
                ]
            },
            // ── Merge Two Sorted Lists ──────────────────────────────
            {
                id: '67e0969490ec517221de2b83',
                testCases: [
                    { input: '1 3 5 2 4 6\n', expectedOutput: '[1,2,3,4,5,6]\n' },
                    { input: '1 2 4 1 3 4\n', expectedOutput: '[1,1,2,3,4,4]\n' }
                ]
            }
        ];

        for (const { id, testCases } of cases) {
            const res = await Question.updateOne(
                { _id: id },            // let Mongoose cast the string to ObjectId
                { $set: { testCases } }
            );
            console.log(
                `Question ${id} → matched ${res.matchedCount}, modified ${res.modifiedCount}`
            );
        }

        console.log('🎉 All test cases seeded');
    } catch (err) {
        console.error('❌ Seeding error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

seed();
