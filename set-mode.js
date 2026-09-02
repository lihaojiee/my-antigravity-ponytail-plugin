#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const STATE_PATH = path.join(__dirname, 'state.json');
const targetMode = (process.argv[2] || 'ultra').trim().toLowerCase();

const validModes = ['lite', 'full', 'ultra', 'off'];

if (!validModes.includes(targetMode)) {
  console.error(`Invalid mode: "${targetMode}". Valid modes are: ${validModes.join(', ')}`);
  process.exit(1);
}

try {
  fs.writeFileSync(STATE_PATH, JSON.stringify({ mode: targetMode }, null, 2), 'utf8');
  console.log(`[Ponytail] Successfully switched mode to: ${targetMode.toUpperCase()}`);
} catch (err) {
  console.error(`Failed to update state.json: ${err.message}`);
  process.exit(1);
}
