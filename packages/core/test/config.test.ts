import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PlaudConfig as Config } from '../src/config.js';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('PlaudConfig', () => {
  let tmpDir: string;
  let config: Config;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'plaud-test-'));
    config = new Config(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates config dir if missing', () => {
    const newDir = path.join(tmpDir, 'subdir');
    const c = new Config(newDir);
    c.save({ credentials: { email: 'a@b.com', password: 'x', region: 'eu' } });
    expect(fs.existsSync(newDir)).toBe(true);
  });

  it('saves and loads credentials', () => {
    config.save({ credentials: { email: 'test@plaud.ai', password: 'secret', region: 'eu' } });
    const loaded = config.load();
    expect(loaded.credentials?.email).toBe('test@plaud.ai');
    expect(loaded.credentials?.region).toBe('eu');
  });

  it('saves and loads token', () => {
    config.saveToken({ accessToken: 'eyJ...', tokenType: 'Bearer', issuedAt: 1000, expiresAt: 2000 });
    const loaded = config.load();
    expect(loaded.token?.accessToken).toBe('eyJ...');
  });

  it('returns empty config when no file exists', () => {
    const loaded = config.load();
    expect(loaded.credentials).toBeUndefined();
    expect(loaded.token).toBeUndefined();
  });

  it('sets file permissions to 0600', () => {
    config.save({ credentials: { email: 'a@b.com', password: 'x', region: 'us' } });
    const stat = fs.statSync(path.join(tmpDir, 'config.json'));
    const mode = (stat.mode & 0o777).toString(8);
    expect(mode).toBe('600');
  });
});
