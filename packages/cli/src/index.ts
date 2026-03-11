import { loginCommand } from './commands/login.js';
import { listCommand } from './commands/list.js';
import { downloadCommand } from './commands/download.js';
import { transcriptCommand } from './commands/transcript.js';
import { syncCommand } from './commands/sync.js';

const COMMANDS: Record<string, (args: string[]) => Promise<void>> = {
  login: loginCommand,
  list: listCommand,
  download: downloadCommand,
  transcript: transcriptCommand,
  sync: syncCommand,
};

export async function run(args: string[]): Promise<void> {
  const cmd = args[0];

  if (!cmd || cmd === '--help' || cmd === '-h') {
    printUsage();
    return;
  }

  const handler = COMMANDS[cmd];
  if (!handler) {
    console.error(`Unknown command: ${cmd}`);
    printUsage();
    process.exit(1);
  }

  try {
    await handler(args.slice(1));
  } catch (err: any) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

function printUsage(): void {
  console.log(`Usage: plaud <command> [options]

Commands:
  login                 Save your Plaud credentials
  list                  List recordings
  download <id> [dir]   Download audio file
  transcript <id>       Print transcript
  sync <folder>         Download all new recordings to folder`);
}
