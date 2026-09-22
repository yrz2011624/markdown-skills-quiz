const assert = require('assert');
const { gradeMarkdown } = require('../.github/scripts/grade-markdown');

const perfect = `
# Instructions outside the graded area

<!-- QUIZ-START -->
# My Markdown Skills

This sentence has **bold text** and *italic text*.

- Git
- GitHub
- JavaScript

1. Learn
2. Practice
3. Reflect

[GitHub Docs](https://docs.github.com/)

Use \`git status\` to inspect the repository.

\`\`\`text
git add .
git commit -m "markdown quiz"
\`\`\`

- [x] Finished one task
- [ ] Finish another task

> Markdown makes project documentation easier to read.

| Skill | Status |
|---|---|
| Headings | Ready |
| Lists | Ready |
<!-- QUIZ-END -->
`;

const result = gradeMarkdown(perfect);
assert.strictEqual(result.score, 100, `Perfect fixture should score 100, got ${result.score}`);

const empty = `<!-- QUIZ-START -->\nReplace this line with your Markdown answers.\n<!-- QUIZ-END -->`;
assert.ok(gradeMarkdown(empty).score < 20, 'Starter answer should not receive substantial credit');

const partial = `
<!-- QUIZ-START -->
# My Markdown Skills
**bold** and *italic*
- one
- two
- three
1. one
2. two
3. three
<!-- QUIZ-END -->`;
const partialResult = gradeMarkdown(partial);
assert.strictEqual(partialResult.score, 35, `Partial fixture should score 35, got ${partialResult.score}`);

const instructionsOnly = `
# Example
[link](https://example.com)
\`git status\`
<!-- QUIZ-START -->
plain text only
<!-- QUIZ-END -->
> quote outside
`;
assert.strictEqual(gradeMarkdown(instructionsOnly).score, 0, 'Only the answer area should be graded');

console.log('Markdown grader tests passed.');
