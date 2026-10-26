import { appendFileSync } from 'node:fs';

const payloadRaw = process.env.INPUT_PAYLOAD;
const outputPath = process.env.GITHUB_OUTPUT;

if (typeof payloadRaw !== 'string' || payloadRaw.length === 0) {
  throw new Error('Invalid input: INPUT_PAYLOAD must be a non-empty JSON string');
}
if (typeof outputPath !== 'string' || outputPath.length === 0) {
  throw new Error('Invalid environment: GITHUB_OUTPUT must be set');
}

let parsed;
try {
  parsed = JSON.parse(payloadRaw);
} catch {
  throw new Error('Invalid input: INPUT_PAYLOAD must be valid JSON');
}

if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
  throw new Error('Invalid input: payload must be an object');
}

const hasText = Object.prototype.hasOwnProperty.call(parsed, 'text');
const hasVersion = Object.prototype.hasOwnProperty.call(parsed, 'version');
if (!hasText || !hasVersion) {
  throw new Error('Invalid input: payload must contain text and version');
}

const { text, version } = parsed;

if (typeof text !== 'string') {
  throw new Error('Invalid input: text must be a string');
}
if (typeof version !== 'string' || !/^\d+\.\d+\.\d+$/.test(version)) {
  throw new Error('Invalid input: version must match digits.digits.digits');
}

const heading = `## ${version}`;
const lines = text.split(/\r?\n/);
const found = lines.some((line) => line.trim() === heading);

const result = { found, heading };
appendFileSync(outputPath, `result=${JSON.stringify(result)}\n`);