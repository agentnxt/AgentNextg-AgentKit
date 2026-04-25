import { Workspace } from '@afk-tools/utils/workspace';
import { Cli } from 'clipanion';

import { BuildCommand } from './build';
import { CertCommand } from './cert';
import { CleanCommand } from './clean';
import type { CliContext } from './context';
import { DevCommand } from './dev';
import { InitCommand } from './init';
import { RunCommand } from './run';

const cli = new Cli<CliContext>({
  binaryName: 'oa',
  binaryVersion: '0.0.0',
  binaryLabel: 'Open-Agent Monorepo Tools',
  enableColors: true,
  enableCapture: true,
});

cli.register(RunCommand);
cli.register(InitCommand);
cli.register(CleanCommand);
cli.register(BuildCommand);
cli.register(DevCommand);
cli.register(CertCommand);

await cli.runExit(process.argv.slice(2), {
  workspace: new Workspace(),
  stdin: process.stdin,
  stdout: process.stdout,
  stderr: process.stderr,
});
