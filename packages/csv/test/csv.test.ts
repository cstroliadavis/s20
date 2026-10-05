import { afterEach, describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { appendCsvFile, readCsvFile, writeCsvFile } from '../src/index.js';

function setup() {
  const tmpDir = path.resolve(import.meta.dirname, `../test-tmp-${Date.now()}`);

  fs.mkdirSync(tmpDir, { recursive: true });

  function cleanup() {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { force: true, recursive: true });
    }
  }

  return { cleanup, tmpDir };
}

describe('csv workspace', () => {
  let env: ReturnType<typeof setup>;

  afterEach(() => {
    if (env) {
      env.cleanup();
    }
  });

  it('writes and reads CSV files with headers', async () => {
    env = setup();

    const filePath = path.join(env.tmpDir, 'test.csv');
    const data = [
      { age: 30, name: 'Alice' },
      { age: 25, name: 'Bob' },
    ];

    await writeCsvFile(filePath, data);

    const rows = await readCsvFile<{ age: string; name: string }>(filePath, { columns: true });

    expect(rows).toHaveLength(2);
    expect(rows[0]?.name).toBe('Alice');
    expect(rows[0]?.age).toBe('30');
    expect(rows[1]?.name).toBe('Bob');
  });

  it('appends records to existing CSV file without duplicating headers', async () => {
    env = setup();

    const filePath = path.join(env.tmpDir, 'events.csv');
    const columns = ['id', 'task', 'duration'];

    await writeCsvFile(filePath, [{ duration: 1, id: 1, task: 'Task 1' }], { columns });
    await appendCsvFile(filePath, [{ duration: 2, id: 2, task: 'Task 2' }], { columns });

    const rows = await readCsvFile<{ duration: string; id: string; task: string }>(filePath, {
      columns: true,
    });

    expect(rows).toHaveLength(2);
    expect(rows[0]?.task).toBe('Task 1');
    expect(rows[1]?.task).toBe('Task 2');
  });
});
