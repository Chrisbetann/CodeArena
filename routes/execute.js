// routes/execute.js
// ─────────────────────────────────────────────────────────────────────────────
// This endpoint compiles/runs user‑submitted code (Python/C++/Java)
// optionally wrapping it in a Two‑Sum “harness” when no main() is provided.
// It returns raw stdout plus a success flag.
// ─────────────────────────────────────────────────────────────────────────────

const express  = require('express');
const router   = express.Router();
const Question = require('../models/Question');
const { run }  = require('../utils/judgeRunner');

// We only wrap code automatically for this Two‑Sum question
const TWO_SUM_ID = '67db5a5a84386134e0f8c68f';

/**
 * Detect if user code already includes its own entry point:
 *  - Python: looks for `if __name__=='__main__'`
 *  - C++/Java: looks for `int main(` or `class Main`
 */
function hasMain(code, language) {
    if (language === 'python') {
        return /if\s+__name__\s*==\s*['"]__main__['"]/.test(code);
    }
    // C++ or Java
    return /int\s+main\s*\(/.test(code) || /class\s+Main/.test(code);
}

/**
 * POST /api/execute
 * Body: { code, language, questionId }
 *
 * 1) Validates inputs.
 * 2) Decides if we should inject a Two‑Sum harness around user code.
 * 3) Fetches sample stdin if harnessing.
 * 4) Calls `run({ language, source, stdin })`.
 * 5) Returns `{ output, success }` from the runner.
 */
router.post('/', async (req, res) => {
    const { code, language, questionId } = req.body;
    // Basic type validation
    if (typeof code !== 'string' || typeof language !== 'string') {
        return res.status(400).json({ error: 'code and language must be strings' });
    }

    // Determine if we auto‑wrap for Two‑Sum
    const wrapTwoSum =
        questionId === TWO_SUM_ID &&
        !hasMain(code, language);

    // By default, we send user’s code straight through
    let wrapped = code;
    let stdin   = '';

    if (wrapTwoSum) {
        // Load the first test-case input as sample stdin
        try {
            const q = await Question.findById(questionId).lean();
            if (q?.testCases?.length) {
                stdin = q.testCases[0].input;
            }
        } catch (e) {
            console.warn('Couldn’t load sample input', e);
        }

        // Inject language-specific harness that:
        //  - Reads stdin tokens
        //  - Calls twoSum(...)
        //  - Prints JSON array result
        if (language === 'python') {
            wrapped = `
${code}

import sys, json
if 'two_sum' in globals() && 'twoSum' not in globals():
    twoSum = two_sum

_tokens = sys.stdin.read().split()
nums   = list(map(int, _tokens[:-1]))
target = int(_tokens[-1])
res    = twoSum(nums, target)
print(json.dumps(res, separators=(',',':')))
`.trim();
        }
        else if (language === 'cpp') {
            wrapped = `
#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

${code}

int main(){
  ios::sync_with_stdio(false);
  cin.tie(nullptr);

  vector<int> v; int x;
  while (cin >> x) v.push_back(x);
  int target = v.back(); v.pop_back();

  auto ans = twoSum(v, target);
  cout << "[" << ans[0] << "," << ans[1] << "]";
  return 0;
}
`.trim();
        }
        else if (language === 'java') {
            wrapped = `
import java.util.*;
${code}

public class Main {
  public static void main(String[] args) {
    Scanner sc = new Scanner(System.in);
    List<Integer> nums = new ArrayList<>();
    while (sc.hasNextInt()) nums.add(sc.nextInt());
    int target = nums.remove(nums.size()-1);

    int[] ans = new Solution().twoSum(
      nums.stream().mapToInt(i->i).toArray(), target
    );
    System.out.print("[" + ans[0] + "," + ans[1] + "]");
  }
}
`.trim();
        }
    }

    try {
        // Delegate to judgeRunner which spawns the appropriate compiler/interpreter
        const result = await run({
            language,
            source: wrapped,
            stdin
        });
        // Return the raw output and a success flag
        res.json({ output: result.output, success: result.success });
    } catch (err) {
        console.error('Execution error:', err);
        // On unexpected errors, return a 500 with a generic message
        res.status(500).json({ output: 'Internal error', success: false });
    }
});

module.exports = router;
