import { afterEach, describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';

function runCli(args: string[], cwd: string) {
  const binPath = path.resolve(import.meta.dirname, '../../../bin/s20.ts');

  return Bun.spawnSync(['bun', 'run', binPath, ...args], {
    cwd,
    env: { ...process.env },
  });
}

describe('e2e cli execution', () => {
  const tmpDir = path.resolve(import.meta.dirname, `../test-e2e-${Date.now()}`);

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { force: true, recursive: true });
    }
  });

  it('runs s20 <task> to record event into data/events.csv and data/tasks.csv', () => {
    fs.mkdirSync(tmpDir, { recursive: true });

    const proc = runCli(['Ticket 5260'], tmpDir);

    expect(proc.exitCode).toBe(0);
    expect(proc.stdout.toString()).toContain('Recorded event #1: Ticket 5260');

    const eventsPath = path.join(tmpDir, 'data', 'events.csv');
    const tasksPath = path.join(tmpDir, 'data', 'tasks.csv');

    expect(fs.existsSync(eventsPath)).toBe(true);
    expect(fs.existsSync(tasksPath)).toBe(true);

    const eventsContent = fs.readFileSync(eventsPath, 'utf-8');
    const tasksContent = fs.readFileSync(tasksPath, 'utf-8');

    expect(eventsContent).toContain('Ticket 5260,false,');
    expect(tasksContent).toMatch(/Ticket 5260,,\d{4}-\d{2}-\d{2} \d{2}:\d{2},,1/);
  });

  it('runs s20 add with all flags and then lists events', () => {
    fs.mkdirSync(tmpDir, { recursive: true });

    const addProc = runCli(
      [
        'add',
        'Ticket 5260',
        '--start=05:30',
        '--duration=2.25',
        '--done',
        '--notes=Had to wait for permission from bob',
      ],
      tmpDir,
    );

    expect(addProc.exitCode).toBe(0);
    expect(addProc.stdout.toString()).toContain('Recorded event #1: Ticket 5260 at 05:30');

    const listProc = runCli(['list'], tmpDir);

    expect(listProc.exitCode).toBe(0);
    expect(listProc.stdout.toString()).toContain('Ticket 5260');

    const tasksPath = path.join(tmpDir, 'data', 'tasks.csv');
    const tasksContent = fs.readFileSync(tasksPath, 'utf-8');

    expect(tasksContent).toMatch(/Ticket 5260,,\d{4}-\d{2}-\d{2} 05:30,\d{4}-\d{2}-\d{2} 07:45/);
  });

  it('resolves shell completion suggestions dynamically for recorded tasks', () => {
    fs.mkdirSync(tmpDir, { recursive: true });

    runCli(['Ticket 5260'], tmpDir);

    const compProc = runCli(['completion', 'complete', 'bash', '--', 'add', '--task', ''], tmpDir);

    expect(compProc.exitCode).toBe(0);

    const output = compProc.stdout.toString();

    expect(output).toContain('Ticket 5260');
  });
});
