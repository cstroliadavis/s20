import { afterEach, describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { jsonlFilePlugin, logger } from '../src/index.js';

describe('@s20/logging jsonlFilePlugin', () => {
  const tempDirs: string[] = [];

  const setup = (maxRows?: number) => {
    logger.reset();

    const logDir = path.resolve(
      import.meta.dirname,
      `../test-logs-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );

    tempDirs.push(logDir);

    const unsubscribe = logger.use(jsonlFilePlugin, {
      baseName: 's20',
      logDir,
      maxRows,
    });
    const log = logger({ name: 'cli.ts' });

    return Object.freeze({
      log,
      logDir,
      unsubscribe,
    });
  };

  afterEach(() => {
    logger.reset();

    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();

      if (dir && fs.existsSync(dir)) {
        fs.rmSync(dir, { force: true, recursive: true });
      }
    }
  });

  it('writes valid JSONL records to s20-0001.jsonl', () => {
    const { log, logDir } = setup();

    log.info('First CLI event', { command: 'add' });
    log.warn('Second CLI event', { command: 'list' });

    const firstFile = path.join(logDir, 's20-0001.jsonl');

    expect(fs.existsSync(firstFile)).toBe(true);

    const lines = fs.readFileSync(firstFile, 'utf8').trim().split('\n');

    expect(lines).toHaveLength(2);

    const parsedFirst = JSON.parse(lines[0] ?? '{}') as Record<string, unknown>;

    expect(parsedFirst.message).toBe('First CLI event');
    expect(parsedFirst.level).toBe('info');
    expect(parsedFirst.metadata).toEqual({ command: 'add' });
  });

  it('rotates to a new log file when maxRows is reached', () => {
    const { log, logDir } = setup(3);

    for (let i = 1; i <= 7; i += 1) {
      log.info(`Row ${i}`);
    }

    const file1 = path.join(logDir, 's20-0001.jsonl');
    const file2 = path.join(logDir, 's20-0002.jsonl');
    const file3 = path.join(logDir, 's20-0003.jsonl');

    expect(fs.readFileSync(file1, 'utf8').trim().split('\n')).toHaveLength(3);
    expect(fs.readFileSync(file2, 'utf8').trim().split('\n')).toHaveLength(3);
    expect(fs.readFileSync(file3, 'utf8').trim().split('\n')).toHaveLength(1);
  });

  it('enforces the default 5000-row limit before creating a new log file', () => {
    const { log, logDir } = setup();

    for (let i = 1; i <= 5001; i += 1) {
      log.info(`Entry ${i}`);
    }

    const file1 = path.join(logDir, 's20-0001.jsonl');
    const file2 = path.join(logDir, 's20-0002.jsonl');

    expect(fs.readFileSync(file1, 'utf8').trim().split('\n')).toHaveLength(5000);
    expect(fs.readFileSync(file2, 'utf8').trim().split('\n')).toHaveLength(1);
  });

  it('resumes appending to an existing file that has fewer than maxRows lines', () => {
    const { log, logDir, unsubscribe } = setup(4);

    log.info('Row 1');
    log.info('Row 2');
    unsubscribe();

    // Re-attach plugin to the same directory
    logger.use(jsonlFilePlugin, { baseName: 's20', logDir, maxRows: 4 });
    log.info('Row 3');
    log.info('Row 4');
    log.info('Row 5 (rotates to file 2)');

    const file1 = path.join(logDir, 's20-0001.jsonl');
    const file2 = path.join(logDir, 's20-0002.jsonl');

    expect(fs.readFileSync(file1, 'utf8').trim().split('\n')).toHaveLength(4);
    expect(fs.readFileSync(file2, 'utf8').trim().split('\n')).toHaveLength(1);
  });
});

