// Script to remove duplicates from words-new.ts (by english or arabic)
// Usage: node clean-words.cjs

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'words-new.ts');
const OUTPUT = path.join(__dirname, 'words-new-clean.ts');

const content = fs.readFileSync(FILE, 'utf8');

const match = content.match(/export const dictionary: Word\[] = \[(.*)\];/s);
if (!match) {
  console.error('Could not find dictionary array in file.');
  process.exit(1);
}

const arrRaw = match[1];
const lines = arrRaw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

const seenEn = new Set();
const seenAr = new Set();
const clean = [];

for (const line of lines) {
  const m = line.match(/\{\s*english:\s*"([^"]+)",\s*arabic:\s*"([^"]+)"\s*}/);
  if (!m) continue;
  const [_, en, ar] = m;
  if (seenEn.has(en) || seenAr.has(ar)) continue;
  seenEn.add(en);
  seenAr.add(ar);
  clean.push(line);
}

const out = `import { Word } from "./words1";\n\nexport const dictionary: Word[] = [\n${clean.map(l => '  ' + l).join('\n')}\n];\n`;

fs.writeFileSync(OUTPUT, out, 'utf8');
console.log('Done! Cleaned file written to', OUTPUT);
