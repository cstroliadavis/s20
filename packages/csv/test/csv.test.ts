import { afterEach, describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { appendCsvFile, parseCsv, readCsvFile, stringifyCsv, writeCsvFile } from '../src/index.js';

describe('csv workspace', () => {
  const tempDirs: string[] = [];

  function setupFileEnv() {
    const tmpDir = path.resolve(
      import.meta.dirname,
      `../test-tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );

    tempDirs.push(tmpDir);
    fs.mkdirSync(tmpDir, { recursive: true });

    return Object.freeze({
      filePath: (name = 'test.csv') => path.join(tmpDir, name),
      tmpDir,
    });
  }

  afterEach(() => {
    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();

      if (dir && fs.existsSync(dir)) {
        fs.rmSync(dir, { force: true, recursive: true });
      }
    }
  });

  describe('in-memory parser and stringifier (unit)', () => {
    it('parses RFC 4180 quoted fields, escaped quotes, and embedded newlines', () => {
      const raw = 'id,task,notes\n1,"Ticket, 5260","Said ""hello""\nand waited"\n';
      const rows = parseCsv<{ id: string; notes: string; task: string }>(raw, { columns: true });

      expect(rows).toEqual([
        {
          id: '1',
          notes: 'Said "hello"\nand waited',
          task: 'Ticket, 5260',
        },
      ]);
    });

    it('stringifies records with automatic quoting for commas and double quotes', () => {
      const csv = stringifyCsv(
        [
          {
            id: 1,
            notes: 'Needs "urgent" review, today',
            task: 'Ticket 5260',
          },
        ],
        { columns: ['id', 'task', 'notes'], header: true },
      );

      expect(csv).toBe('id,task,notes\r\n1,Ticket 5260,"Needs ""urgent"" review, today"\r\n');
    });
  });

  describe('filesystem I/O (integration)', () => {
    it('writes and reads CSV files with headers', async () => {
      const { filePath } = setupFileEnv();
      const target = filePath('users.csv');
      const data = [
        { age: 30, name: 'Alice' },
        { age: 25, name: 'Bob' },
      ];

      await writeCsvFile(target, data);

      const rows = await readCsvFile<{ age: string; name: string }>(target, { columns: true });

      expect(rows).toEqual([
        { age: '30', name: 'Alice' },
        { age: '25', name: 'Bob' },
      ]);
    });

    it('appends records to existing CSV file without duplicating headers', async () => {
      const { filePath } = setupFileEnv();
      const target = filePath('events.csv');
      const columns = ['id', 'task', 'duration'];

      await writeCsvFile(target, [{ duration: 1, id: 1, task: 'Task 1' }], { columns });
      await appendCsvFile(target, [{ duration: 2, id: 2, task: 'Task 2' }], { columns });

      const rows = await readCsvFile<{ duration: string; id: string; task: string }>(target, {
        columns: true,
      });

      expect(rows.map((r) => r.task)).toEqual(['Task 1', 'Task 2']);
    });
  });
});
