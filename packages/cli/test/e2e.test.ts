import { afterEach, describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

const BIN_PATH = path.resolve(import.meta.dirname, '../../../bin/s20.ts');

describe('e2e cli execution', () => {
  const tempDirs: string[] = [];

  function setup() {
    const tmpDir = path.resolve(
      import.meta.dirname,
      `../test-e2e-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );

    tempDirs.push(tmpDir);
    fs.mkdirSync(tmpDir, { recursive: true });

    function runCli(args: string[]) {
      return Bun.spawnSync(['bun', 'run', BIN_PATH, ...args], {
        cwd: tmpDir,
        env: { ...process.env },
      });
    }

    return Object.freeze({
      eventsPath: path.join(tmpDir, 'data', 'events.csv'),
      logPath: path.join(tmpDir, 'data', 'logs', 's20-0001.jsonl'),
      runAdd: (task: string, flags: string[] = []) => runCli(['add', task, ...flags]),
      runCli,
      runCompletion: (words: string[]) =>
        runCli(['completion', 'complete', 'bash', '--', ...words]),
      runList: (flags: string[] = []) => runCli(['list', ...flags]),
      tasksPath: path.join(tmpDir, 'data', 'tasks.csv'),
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

  it('runs s20 <task> to record event into data/events.csv, data/tasks.csv, and rotating logs', () => {
    const { eventsPath, logPath, runCli, tasksPath } = setup();

    const proc = runCli(['Ticket 5260']);

    expect(proc.exitCode).toBe(0);
    expect(proc.stdout.toString()).toContain('Recorded event #1: Ticket 5260');
    expect(fs.existsSync(eventsPath)).toBe(true);
    expect(fs.existsSync(tasksPath)).toBe(true);
    expect(fs.existsSync(logPath)).toBe(true);

    const eventsContent = fs.readFileSync(eventsPath, 'utf-8');
    const tasksContent = fs.readFileSync(tasksPath, 'utf-8');
    const logContent = fs.readFileSync(logPath, 'utf-8');

    expect(eventsContent).toContain('Ticket 5260,false,');
    expect(tasksContent).toMatch(/Ticket 5260,,\d{4}-\d{2}-\d{2} \d{2}:\d{2},,1/);
    expect(logContent).toContain('"message":"Persisted event record"');
  });

  it('accumulates task duration across multiple CLI runs and stamps finish time on completion', () => {
    const { runAdd, runList, tasksPath } = setup();

    const firstAdd = runAdd('Ticket 5260', ['--start=05:30', '--duration=1.5']);
    const secondAdd = runAdd('Ticket 5260', [
      '--start=07:00',
      '--duration=45m',
      '--done',
      '--notes=Had to wait for permission from bob',
    ]);
    const listProc = runList();

    expect(firstAdd.exitCode).toBe(0);
    expect(secondAdd.exitCode).toBe(0);
    expect(listProc.exitCode).toBe(0);
    expect(listProc.stdout.toString()).toContain('Ticket 5260');

    const tasksContent = fs.readFileSync(tasksPath, 'utf-8');

    expect(tasksContent).toMatch(
      /Ticket 5260,,\d{4}-\d{2}-\d{2} 05:30,\d{4}-\d{2}-\d{2} 07:45,2\.25/,
    );
  });

  it('resolves shell completion suggestions dynamically with active tasks prioritized first', () => {
    const { runAdd, runCompletion } = setup();

    runAdd('Completed Task', ['--done']);
    runAdd('Active Task');

    const compProc = runCompletion(['add', '--task', '']);

    expect(compProc.exitCode).toBe(0);

    const lines = compProc.stdout.toString().trim().split('\n');

    expect(lines[0]).toContain('Active Task');
    expect(lines[1]).toContain('Completed Task');
  });
});
