#!/usr/bin/env node
/**
 * Parse a pdftotext -layout dump of a CCP question deck into questions.draft.json.
 *
 * Usage:
 *   pdftotext -layout "<input.pdf>" /tmp/ccp.txt
 *   node scripts/import-questions.mjs /tmp/ccp.txt data/questions.draft.json [id-prefix]
 *
 * The parser is intentionally tolerant of whitespace, blank lines, and the
 * occasional centered "Q<n>)" marker that pdftotext spits out.
 */

import { readFileSync, writeFileSync } from "node:fs";

const [, , inputPath, outputPath, idPrefix = "ccp-pdf"] = process.argv;
if (!inputPath || !outputPath) {
  console.error(
    "Usage: node scripts/import-questions.mjs <input.txt> <output.json> [id-prefix]",
  );
  process.exit(1);
}

const raw = readFileSync(inputPath, "utf8");
const lines = raw.split(/\r?\n/);

const Q_RE = /^\s*Q\.?\s*(\d+)\)\s*$/;
const OPT_RE = /^\s*([A-E])\.\s+(.*)$/;

const blocks = [];
let current = null;

for (const line of lines) {
  const m = line.match(Q_RE);
  if (m) {
    if (current) blocks.push(current);
    current = { number: Number(m[1]), lines: [] };
    continue;
  }
  if (current) current.lines.push(line);
}
if (current) blocks.push(current);

console.log(`found ${blocks.length} question blocks`);

const questions = [];
const warnings = [];

for (const block of blocks) {
  const promptLines = [];
  const options = [];
  let currentOption = null;

  for (const line of block.lines) {
    const om = line.match(OPT_RE);
    if (om) {
      if (currentOption) options.push(currentOption);
      currentOption = { id: om[1], text: om[2].trim() };
      continue;
    }
    const trimmed = line.trim();
    if (currentOption) {
      // continuation of the current option
      if (trimmed) currentOption.text += " " + trimmed;
    } else {
      if (trimmed) promptLines.push(trimmed);
    }
  }
  if (currentOption) options.push(currentOption);

  const prompt = promptLines.join(" ").replace(/\s+/g, " ").trim();
  if (!prompt || options.length < 2) {
    warnings.push(`Q${block.number}: skipped (prompt=${!!prompt}, options=${options.length})`);
    continue;
  }

  // detect multi-answer
  const lower = prompt.toLowerCase();
  let selectCount = 1;
  if (/(choose|select)\s+three\b/.test(lower) || /\bchoose\s+3\b/.test(lower)) {
    selectCount = 3;
  } else if (
    /(choose|select)\s+two\b/.test(lower) ||
    /\bchoose\s+2\b/.test(lower)
  ) {
    selectCount = 2;
  }

  const id = `${idPrefix}-${String(block.number).padStart(4, "0")}`;
  questions.push({
    id,
    sourceNumber: block.number,
    domain: null,
    topic: null,
    type: selectCount > 1 ? "multi" : "single",
    ...(selectCount > 1 ? { selectCount } : {}),
    prompt,
    options,
    correct: [],
    explanation: "",
  });
}

console.log(`parsed ${questions.length} questions`);
if (warnings.length) {
  console.log("warnings:");
  for (const w of warnings) console.log("  " + w);
}

writeFileSync(
  outputPath,
  JSON.stringify({ version: 1, questions }, null, 2) + "\n",
);
console.log(`wrote ${outputPath}`);
