function extractAnswerArea(source) {
  const start = '<!-- QUIZ-START -->';
  const end = '<!-- QUIZ-END -->';
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end);
  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) return '';
  return source.slice(startIndex + start.length, endIndex).trim();
}

function countMatches(text, regex) {
  return [...text.matchAll(regex)].length;
}

function gradeMarkdown(source) {
  const text = extractAnswerArea(source);
  const lines = text.split(/\r?\n/);

  const h1 = lines.some(line => /^#\s+\S/.test(line) && !/^##/.test(line));

  const bold = /(\*\*[^*\n]+\*\*|__[^_\n]+__)/.test(text);
  const withoutBold = text.replace(/\*\*[^*\n]+\*\*/g, '').replace(/__[^_\n]+__/g, '');
  const italic = /(^|[^*])\*[^*\n]+\*([^*]|$)/m.test(withoutBold) || /(^|[^_])_[^_\n]+_([^_]|$)/m.test(withoutBold);

  const unorderedCount = lines.filter(line => /^\s*[-+*]\s+\S/.test(line) && !/^\s*[-+*]\s+\[[ xX]\]/.test(line)).length;
  const orderedCount = lines.filter(line => /^\s*\d+\.\s+\S/.test(line)).length;

  const link = /\[[^\]\n]+\]\(https?:\/\/[^)\s]+\)/.test(text);

  const fencedBlocks = [...text.matchAll(/```[^\n]*\n([\s\S]*?)```/g)];
  const fencedCode = fencedBlocks.some(match => /git\s+add\s+\./i.test(match[1]) && /git\s+commit\s+-m\s+["'][^"']+["']/i.test(match[1]));
  const withoutFences = text.replace(/```[^\n]*\n[\s\S]*?```/g, '');
  const inlineCode = /`git\s+status`/i.test(withoutFences);

  const checkedTasks = countMatches(text, /^\s*[-*+]\s+\[[xX]\]\s+\S.*$/gm);
  const uncheckedTasks = countMatches(text, /^\s*[-*+]\s+\[ \]\s+\S.*$/gm);
  const taskList = checkedTasks >= 1 && uncheckedTasks >= 1;

  const blockquote = lines.some(line => /^>\s+\S/.test(line));

  let table = false;
  for (let i = 0; i < lines.length - 3; i += 1) {
    const header = lines[i];
    const separator = lines[i + 1];
    const row1 = lines[i + 2];
    const row2 = lines[i + 3];
    const looksLikeRow = line => /\|/.test(line) && line.split('|').filter(cell => cell.trim()).length >= 2;
    const looksLikeSeparator = line => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
    if (looksLikeRow(header) && looksLikeSeparator(separator) && looksLikeRow(row1) && looksLikeRow(row2)) {
      table = true;
      break;
    }
  }

  const checks = [
    { label: 'H1 heading', earned: h1 ? 10 : 0, max: 10, detail: h1 ? 'H1 detected' : 'Create one H1 heading' },
    { label: 'Bold text', earned: bold ? 5 : 0, max: 5, detail: bold ? 'bold syntax detected' : 'Add bold text' },
    { label: 'Italic text', earned: italic ? 5 : 0, max: 5, detail: italic ? 'italic syntax detected' : 'Add italic text' },
    { label: 'Unordered list', earned: unorderedCount >= 3 ? 7 : 0, max: 7, detail: `${unorderedCount} item(s) detected` },
    { label: 'Ordered list', earned: orderedCount >= 3 ? 8 : 0, max: 8, detail: `${orderedCount} item(s) detected` },
    { label: 'Link', earned: link ? 10 : 0, max: 10, detail: link ? 'clickable http(s) link detected' : 'Add a Markdown link' },
    { label: 'Inline code', earned: inlineCode ? 10 : 0, max: 10, detail: inlineCode ? '`git status` detected' : 'Show git status as inline code' },
    { label: 'Fenced code block', earned: fencedCode ? 15 : 0, max: 15, detail: fencedCode ? 'required Git commands detected' : 'Add both required commands inside one fenced block' },
    { label: 'Task list', earned: taskList ? 10 : 0, max: 10, detail: taskList ? 'checked + unchecked items detected' : 'Add one checked and one unchecked task' },
    { label: 'Blockquote', earned: blockquote ? 10 : 0, max: 10, detail: blockquote ? 'blockquote detected' : 'Add a blockquote' },
    { label: 'Table', earned: table ? 10 : 0, max: 10, detail: table ? '2+ column table with 2 data rows detected' : 'Add a table with header + 2 rows' }
  ];

  return {
    answerAreaFound: Boolean(text),
    score: checks.reduce((sum, check) => sum + check.earned, 0),
    checks
  };
}

module.exports = { extractAnswerArea, gradeMarkdown };
