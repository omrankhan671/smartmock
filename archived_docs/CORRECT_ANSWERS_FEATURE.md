# Correct Answers Feature

## Overview
After receiving negative feedback, the AI interviewer now provides the correct answer to help users learn from their mistakes.

## Implementation

### How It Works

1. **Question Tracking**: Each question is stored in `currentQuestion` variable when asked
2. **Answer Evaluation**: When user's answer receives negative feedback (score < 0.6)
3. **Correct Answer Display**: AI automatically provides the correct/expected answer
4. **Audio Feedback**: The correct answer is spoken aloud using text-to-speech
5. **Report Integration**: Correct answers are included in the feedback list for the final report

### Example Flow

```
AI: What is the difference between let, const, and var?
User: [gives incomplete/incorrect answer]
AI (negative): Try the STAR format: Situation, Task, Action, Result...
AI (Correct Answer): Here's the correct answer: `var` is function-scoped and 
can be redeclared, `let` is block-scoped and can be reassigned but not 
redeclared, and `const` is block-scoped and cannot be reassigned or redeclared 
after initialization.
AI: [Next question...]
```

## Covered Topics

### JavaScript (30 questions)
- **Beginner**: Variables, data types, closures, hoisting, operators, functions, objects
- **Intermediate**: Event loop, promises, async/await, array methods, prototypes, this keyword
- **Advanced**: Prototype chain, memoization, modules, web workers, garbage collection

### Python (20 questions)
- **Beginner**: Data types, lists vs tuples, dictionaries, functions, file I/O
- **Intermediate**: Decorators, generators, GIL, memory management, args/kwargs
- **Advanced**: Metaclasses, context managers, coroutines, asyncio, optimization

### Data Structures & Algorithms (25 questions)
- **Beginner**: Arrays, linked lists, stacks, queues, Big O, searching, hashing
- **Intermediate**: Trees, graphs, traversals, DFS/BFS, sorting algorithms
- **Advanced**: Dynamic programming, greedy algorithms, shortest paths, advanced trees

## Technical Details

### Data Structure
```javascript
const correctAnswers = {
  "Question text?": "Detailed correct answer...",
  // 75+ questions covered
};
```

### Evaluation Logic
```javascript
function evaluateAnswer(answer) {
  // Score calculation
  const score = lenScore + goodScore - badScore + deliveryBoost + moodPenalty;
  const verdict = score >= 0.6 ? 'positive' : 'negative';
  
  // If negative, provide correct answer
  if (verdict === 'negative') {
    const correctAnswer = correctAnswers[currentQuestion];
    if (correctAnswer) {
      // Display in conversation
      conversationDiv.innerHTML += `<p><strong>AI (Correct Answer):</strong> ${correctAnswer}</p>`;
      // Speak it aloud
      speak(correctAnswer, { rate: 0.95, pitch: 1.0 });
      // Add to report
      feedback_list[feedback_list.length - 1] += ` | CORRECT ANSWER: ${correctAnswer}`;
    }
  }
}
```

## Benefits

1. **Learning Opportunity**: Users immediately learn the correct answer
2. **Knowledge Retention**: Hearing and reading correct answers reinforces learning
3. **Interview Preparation**: Users understand what interviewers expect
4. **Report Enhancement**: Final reports include correct answers for reference
5. **Self-Study**: Users can review correct answers in their saved reports

## Future Enhancements

- [ ] Add more questions (target: 200+ questions)
- [ ] Support for code examples in answers
- [ ] Link to documentation/resources for deeper learning
- [ ] Multiple correct answer variations
- [ ] User can request hints before getting full answer
- [ ] Spaced repetition for questions answered incorrectly

## Answer Quality

All correct answers include:
- **Clear definitions**: What the concept is
- **Key characteristics**: Important properties or behaviors
- **Practical usage**: When/how to use it
- **Comparisons**: How it differs from related concepts
- **Examples**: Concrete illustrations where helpful

## Files Modified

- `interview/cs/ai-interview.html`:
  - Added `currentQuestion` and `currentQuestionIndex` variables
  - Created comprehensive `correctAnswers` object with 75+ answers
  - Modified `askQuestion()` to track current question
  - Enhanced `evaluateAnswer()` to display correct answers on negative feedback
  - Added correct answers to feedback_list for report persistence

## Testing

1. Start an interview
2. Intentionally give a poor/incomplete answer
3. Receive negative feedback
4. Verify correct answer is displayed
5. Verify correct answer is spoken aloud
6. Complete interview and check report includes correct answers

## Notes

- Correct answers are only shown for **negative feedback** (score < 0.6)
- Positive feedback does not show correct answers (user already did well)
- Audio playback uses slower rate (0.95) for better comprehension
- Correct answers are appended to feedback in report with " | CORRECT ANSWER:" prefix
