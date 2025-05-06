// scripts/seed.js

require('dotenv').config();                          // Load environment variables from .env
const mongoose = require('mongoose');                 // MongoDB object modeling
const Question = require('../models/Question');       // Question model with testCases field

/**
 * Main seed function:
 * - Connects to MongoDB
 * - Updates each question document with its test cases
 * - Disconnects from MongoDB
 */
async function seed() {
    try {
        // Determine MongoDB connection URI (Atlas or fallback)
        const uri = process.env.MONGO_URI ||
            'mongodb+srv://caUser:sfac123@codearena.fo5no.mongodb.net/CodeArena?retryWrites=true&w=majority';
        await mongoose.connect(uri);                 // Connect to MongoDB
        console.log('✅ Connected to MongoDB');

        // Define the test-case sets for each question ID
        const cases = [
            // ── Two Sum question harness definitions ────────────────────
            {
                id: '67db5a5a84386134e0f8c68f',
                testCases: [
                    { input: '2 7 11 15 9\n', expectedOutput: '[0,1]\n' },
                    { input: '3 2 4 6\n',       expectedOutput: '[1,2]\n' }
                ]
            },
            // ── Valid Parenthesis question test cases ────────────────────
            {
                id: '67e04feb90ec517221de2b7f',
                testCases: [
                    { input: '()\n',      expectedOutput: 'true\n' },
                    { input: '()[]{}\n',  expectedOutput: 'true\n' },
                    { input: '(]\n',      expectedOutput: 'false\n' },
                    { input: '{[]}\n',    expectedOutput: 'true\n' }
                ]
            },
            // ── Merge Two Sorted Lists question cases ────────────────────
            {
                id: '67e0969490ec517221de2b83',
                testCases: [
                    { input: '1 3 5 2 4 6\n', expectedOutput: '[1,2,3,4,5,6]\n' },
                    { input: '1 2 4 1 3 4\n', expectedOutput: '[1,1,2,3,4,4]\n' }
                ]
            }
        ];

        // Iterate over each question and update its testCases array in the database
        for (const { id, testCases } of cases) {
            const res = await Question.updateOne(
                { _id: id },            // Filter by question ID (string cast to ObjectId)
                { $set: { testCases } }  // Set the testCases field
            );
            console.log(
                `Question ${id} → matched ${res.matchedCount}, modified ${res.modifiedCount}`
            );
        }

        console.log('🎉 All test cases seeded');
    } catch (err) {
        console.error('❌ Seeding error:', err);
    } finally {
        await mongoose.disconnect();                  // Disconnect from MongoDB
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);                              // Exit script
    }
}

seed();                                             // Execute the seed function
