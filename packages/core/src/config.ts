import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { PlaudConfig as PlaudConfigData, PlaudCredentials, PlaudTokenData } from './types.js';

const DEFAULT_DIR = path.join(os.homedir(), '.plaud');
const CONFIG_FILE = 'config.json';

export class PlaudConfig {
  private dir: string;

  constructor(dir?: string) {
    this.dir = dir ?? DEFAULT_DIR;
  }

  private filePath(): string {
    return path.join(this.dir, CONFIG_FILE);
  }

  load(): PlaudConfigData {
    try {
      const raw = fs.readFileSync(this.filePath(), 'utf-8');
      return JSON.parse(raw) as PlaudConfigData;
    } catch {
      return {};
    }
  }

  save(data: PlaudConfigData): void {
    fs.mkdirSync(this.dir, { recursive: true, mode: 0o700 });
    const existing = this.load();
    const merged = { ...existing, ...data };
    fs.writeFileSync(this.filePath(), JSON.stringify(merged, null, 2), { mode: 0o600 });
  }

  saveToken(token: PlaudTokenData): void {
    this.save({ token });
  }

  saveCredentials(credentials: PlaudCredentials): void {
    this.save({ credentials });
  }

  getToken(): PlaudTokenData | undefined {
    return this.load().token;
  }

  getCredentials(): PlaudCredentials | undefined {
    return this.load().credentials;
  }
}
