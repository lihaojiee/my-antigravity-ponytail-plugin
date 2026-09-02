#!/usr/bin/env node
'use strict';

const { getActiveMode, getPonytailPrompt } = require('./instructions');

let input = '';
let finished = false;

function finish() {
  if (finished) return;
  finished = true;

  try {
    const mode = getActiveMode();
    const prompt = getPonytailPrompt(mode);

    if (!prompt || mode === 'off') {
      process.stdout.write(JSON.stringify({ injectSteps: [] }));
    } else {
      process.stdout.write(
        JSON.stringify({
          injectSteps: [
            {
              ephemeralMessage: prompt,
            },
          ],
        })
      );
    }
  } catch (err) {
    // Fail-safe: never crash the agent loop
    process.stdout.write(JSON.stringify({ injectSteps: [] }));
  }
  process.exit(0);
}

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', finish);
process.stdin.on('error', finish);

// Safety timeout: Antigravity hooks should never hang
const timer = setTimeout(finish, 1000);
if (timer && timer.unref) {
  timer.unref();
}
