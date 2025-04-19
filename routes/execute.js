// routes/execute.js
const express     = require('express');
const router      = express.Router();
const judgeRunner = require('../utils/judgeRunner');

router.post('/', async (req, res) => {
    try {
        const { code, language } = req.body;
        if (typeof code !== 'string' || typeof language !== 'string') {
            return res.status(400).json({ error: 'Must provide code and language' });
        }

        const result = await judgeRunner.run({ source: code, language });
        return res.json({
            output:  result.output,
            success: result.success
        });
    } catch (err) {
        console.error('Error in /api/execute:', err);
        return res.status(500).json({
            output:  'Internal server error',
            success: false
        });
    }
});

module.exports = router;
