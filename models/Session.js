// models/Session.js

const mongoose = require('mongoose');

/**
 * SubmissionSchema
 * Represents a single code submission within a session:
 * - username:       who submitted the code
 * - questionId:     reference to the Question being attempted
 * - code:           the exact source code submitted
 * - output:         the stdout returned by the runner
 * - language:       programming language used
 * - timeTaken:      seconds elapsed since question loaded
 * - scoreIncrement: points awarded for this submission
 * - isCorrect:      whether submission passed all tests
 * - createdAt:      timestamp of when submission was made
 */
const SubmissionSchema = new mongoose.Schema({
    username:       String,
    questionId:     mongoose.Types.ObjectId,
    code:           String,
    output:         String,     // ← capture the program’s stdout
    language:       String,
    timeTaken:      Number,
    scoreIncrement: Number,
    isCorrect:      Boolean,
    createdAt:      { type: Date, default: Date.now }
});

/**
 * SessionSchema
 * Tracks a live coding session in a lobby:
 * - lobbyCode:            unique code identifying the lobby
 * - questions:            ordered list of Question references for this session
 * - currentQuestionIndex: index into questions array of the active question
 * - submissions:          array of SubmissionSchema entries for audit/history
 * - scores:               map of username→cumulative score
 * - isPaused:             flag to temporarily halt submissions/scoring
 * - createdAt:            session creation time
 */
const SessionSchema = new mongoose.Schema({
    lobbyCode:            { type: String, required: true, index: true },
    questions:            [{ type: mongoose.Types.ObjectId, ref: 'Question' }],
    currentQuestionIndex: { type: Number, default: 0 },
    submissions:          [SubmissionSchema],
    scores:               { type: Map, of: Number, default: {} },
    isPaused:             { type: Boolean, default: false },
    createdAt:            { type: Date, default: Date.now }
});

// Export the Session model used by /routes/session to manage game state
module.exports = mongoose.model('Session', SessionSchema);
