import fs from 'fs';
import path from 'path';

const logDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'agent.log');

function append(line: string): void {
  const ts = new Date().toISOString();
  fs.appendFileSync(logFile, `${ts} ${line}\n`);
}

export const FileLogger = {
  info(message: string, data?: Record<string, unknown>): void {
    const line = `[INFO] ${message}${data ? ' ' + JSON.stringify(data) : ''}`;
    console.log(line);
    append(line);
  },

  error(message: string, err?: unknown): void {
    const detail = err instanceof Error ? (err.stack ?? err.message) : JSON.stringify(err ?? {});
    const line = `[ERROR] ${message} ${detail}`;
    console.error(line);
    append(line);
  },

  command(command: string, user: string, source: string, success: boolean): void {
    const line = `[CMD] ${command} | user=${user} | source=${source} | ok=${success}`;
    console.log(line);
    append(line);
  },
};
