import { spawnSync } from 'node:child_process';

spawnSync('yarn', ['r', 'oa.ts', ...process.argv.slice(2)], {
  stdio: 'inherit',
});
