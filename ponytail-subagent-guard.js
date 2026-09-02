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
    if (!input || mode === 'off') {
      process.stdout.write(JSON.stringify({ decision: 'allow' }));
      process.exit(0);
      return;
    }

    const payload = JSON.parse(input.replace(/^\uFEFF/, ''));
    const toolCall = payload.toolCall;

    if (
      toolCall &&
      toolCall.name === 'invoke_subagent' &&
      toolCall.args &&
      Array.isArray(toolCall.args.Subagents)
    ) {
      const constraint = `[Ponytail ${mode.toUpperCase()} Guidelines]: Adhere to the ladder: 1.YAGNI -> 2.Reuse codebase -> 3.Stdlib -> 4.Native -> 5.Installed dep -> 6.Min diff. No unrequested abstractions.\n\n`;

      const modifiedSubagents = toolCall.args.Subagents.map((subagent) => {
        if (subagent && subagent.Prompt && !subagent.Prompt.includes('[Ponytail')) {
          return Object.assign({}, subagent, {
            Prompt: constraint + subagent.Prompt,
          });
        }
        return subagent;
      });

      process.stdout.write(
        JSON.stringify({
          decision: 'allow',
          overwrite: {
            Subagents: modifiedSubagents,
          },
        })
      );
      process.exit(0);
      return;
    }

    process.stdout.write(JSON.stringify({ decision: 'allow' }));
  } catch (err) {
    // Fail-safe: allow execution without blocking
    process.stdout.write(JSON.stringify({ decision: 'allow' }));
  }
  process.exit(0);
}

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  input += chunk;
});
process.stdin.on('end', finish);
process.stdin.on('error', finish);

const timer = setTimeout(finish, 1000);
if (timer && timer.unref) {
  timer.unref();
}
