// routes/execute.js
const express  = require('express');
const router   = express.Router();
const Question = require('../models/Question');
const { run }  = require('../utils/judgeRunner');

// Only our Two‑Sum question ID
const TWO_SUM_ID = '67db5a5a84386134e0f8c68f';

// Detect if user already wrote their own entry‑point
function hasMain(code, language) {
    if (language === 'python') {
        return /if\s+__name__\s*==\s*['"]__main__['"]/.test(code);
    }
    // C++/Java
    return /int\s+main\s*\(/.test(code) || /class\s+Main/.test(code);
}

router.post('/', async (req, res) => {
    const { code, language, questionId } = req.body;
    if (typeof code !== 'string' || typeof language !== 'string') {
        return res.status(400).json({ error: 'code and language must be strings' });
    }

    // Do we need to wrap in Two-Sum harness?
    const wrapTwoSum =
        questionId === TWO_SUM_ID &&
        !hasMain(code, language);

    let wrapped = code;
    let stdin   = '';

    if (wrapTwoSum) {
        // pull sample input
        try {
            const q = await Question.findById(questionId).lean();
            if (q?.testCases?.length) {
                stdin = q.testCases[0].input;
            }
        } catch (e) {
            console.warn('Couldn’t load sample input', e);
        }

        if (language === 'python') {
            wrapped = `
${code}

import sys, json
if 'two_sum' in globals() and 'twoSum' not in globals():
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
        const result = await run({
            language,
            source: wrapped,
            stdin
        });
        res.json({ output: result.output, success: result.success });
    } catch (err) {
        console.error('Execution error:', err);
        res.status(500).json({ output: 'Internal error', success: false });
    }
});

module.exports = router;
