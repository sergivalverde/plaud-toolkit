import * as fs from 'fs';
import * as path from 'path';
import { PlaudConfig, PlaudAuth, PlaudClient } from '@plaud/core';

export async function downloadCommand(args: string[]): Promise<void> {
  const id = args[0];
  const dir = args[1] || '.';
  if (!id) {
    console.error('Usage: plaud download <recording-id> [directory]');
    process.exit(1);
  }

  const config = new PlaudConfig();
  const creds = config.getCredentials();
  const auth = new PlaudAuth(config);
  const client = new PlaudClient(auth, creds?.region ?? 'eu');

  // Try MP3 first
  const mp3Url = await client.getMp3Url(id);
  let buffer: ArrayBuffer;
  let ext = 'opus';

  if (mp3Url) {
    console.log('Downloading MP3...');
    const res = await fetch(mp3Url);
    buffer = await res.arrayBuffer();
    ext = 'mp3';
  } else {
    console.log('Downloading audio...');
    buffer = await client.downloadAudio(id);
  }

  fs.mkdirSync(dir, { recursive: true });
  const filename = `${id}.${ext}`;
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, Buffer.from(buffer));
  console.log(`Saved: ${filepath} (${(buffer.byteLength / 1024).toFixed(0)} KB)`);
}
