import { afterEach, describe, expect, it } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { createYamlParser, createYamlStringifier, parseYaml, stringifyYaml } from '../src/index.js';

function setup() {
  const parser = createYamlParser();
  const stringifier = createYamlStringifier();

  return Object.freeze({
    parser,
    stringifier,
  });
}

describe('yaml parser and stringifier', () => {
  let env: ReturnType<typeof setup>;

  afterEach(() => {
    // Teardown any test state
  });

  describe('scalars', () => {
    it('parses boolean values correctly', () => {
      env = setup();
      expect(env.parser.parse<Record<string, unknown>>('flag: true')).toEqual({ flag: true });
      expect(env.parser.parse<Record<string, unknown>>('flag: false')).toEqual({ flag: false });
      expect(env.parser.parse<Record<string, unknown>>('flag: yes')).toEqual({ flag: true });
      expect(env.parser.parse<Record<string, unknown>>('flag: no')).toEqual({ flag: false });
    });

    it('parses integer and float numbers correctly', () => {
      env = setup();
      expect(env.parser.parse<Record<string, unknown>>('count: 42')).toEqual({ count: 42 });
      expect(env.parser.parse<Record<string, unknown>>('temp: -12.5')).toEqual({ temp: -12.5 });
      expect(env.parser.parse<Record<string, unknown>>('zero: 0')).toEqual({ zero: 0 });
    });

    it('parses version strings with multiple dots as plain strings', () => {
      env = setup();
      expect(env.parser.parse<Record<string, unknown>>('version: 0.1.0')).toEqual({
        version: '0.1.0',
      });
    });

    it('parses null and tilde values correctly', () => {
      env = setup();
      expect(env.parser.parse<Record<string, unknown>>('empty: null')).toEqual({ empty: null });
      expect(env.parser.parse<Record<string, unknown>>('blank: ~')).toEqual({ blank: null });
      expect(env.parser.parse<Record<string, unknown>>('none:')).toEqual({ none: null });
    });

    it('parses quoted strings with escape sequences', () => {
      env = setup();
      expect(env.parser.parse<Record<string, unknown>>("quoted: 'hello world'")).toEqual({
        quoted: 'hello world',
      });
      expect(env.parser.parse<Record<string, unknown>>("escaped: 'it''s great'")).toEqual({
        escaped: "it's great",
      });
      expect(env.parser.parse<Record<string, unknown>>('double: "hello \\"world\\""')).toEqual({
        double: 'hello "world"',
      });
    });

    it('parses flow sequences and flow mappings', () => {
      env = setup();
      expect(env.parser.parse<Record<string, unknown>>('tags: [a, b, c]')).toEqual({
        tags: ['a', 'b', 'c'],
      });
      expect(env.parser.parse<Record<string, unknown>>('point: { x: 10, y: 20 }')).toEqual({
        point: { x: 10, y: 20 },
      });
    });
  });

  describe('mappings', () => {
    it('parses flat key-value pairs', () => {
      env = setup();
      const yaml = `
name: s20
version: 0.1.0
description: Time tracker
`;

      expect(env.parser.parse<Record<string, unknown>>(yaml)).toEqual({
        description: 'Time tracker',
        name: 's20',
        version: '0.1.0',
      });
    });

    it('parses nested mappings with multi-level indentation', () => {
      env = setup();
      const yaml = `
server:
  host: localhost
  port: 8080
  logging:
    level: debug
    file: app.log
`;

      expect(env.parser.parse<Record<string, unknown>>(yaml)).toEqual({
        server: {
          host: 'localhost',
          logging: {
            file: 'app.log',
            level: 'debug',
          },
          port: 8080,
        },
      });
    });

    it('strips full-line comments and inline comments', () => {
      env = setup();
      const yaml = `
# Top comment
name: s20 # Tool name
# Middle comment
limit: 10 # Display limit
`;

      expect(env.parser.parse<Record<string, unknown>>(yaml)).toEqual({
        limit: 10,
        name: 's20',
      });
    });

    it('enforces duplicate key checks when disallowDuplicateKeys is enabled', () => {
      const strictParser = createYamlParser({ disallowDuplicateKeys: true });
      const yaml = `
name: first
name: second
`;

      expect(() => strictParser.parse(yaml)).toThrow('Duplicate key detected');
    });
  });

  describe('sequences', () => {
    it('parses list of scalar items', () => {
      env = setup();
      const yaml = `
items:
  - apple
  - banana
  - cherry
`;

      expect(env.parser.parse<Record<string, unknown>>(yaml)).toEqual({
        items: ['apple', 'banana', 'cherry'],
      });
    });

    it('parses sequences of mappings with dash prefix on first property', () => {
      env = setup();
      const yaml = `
commands:
  - name: add
    description: Record an event
    isDefault: true
  - name: list
    description: List events
`;

      expect(env.parser.parse<Record<string, unknown>>(yaml)).toEqual({
        commands: [
          {
            description: 'Record an event',
            isDefault: true,
            name: 'add',
          },
          {
            description: 'List events',
            name: 'list',
          },
        ],
      });
    });

    it('parses sequence items on separate lines with empty dashes', () => {
      env = setup();
      const yaml = `
items:
  -
    id: 1
    title: First
  -
    id: 2
    title: Second
`;

      expect(env.parser.parse<Record<string, unknown>>(yaml)).toEqual({
        items: [
          { id: 1, title: 'First' },
          { id: 2, title: 'Second' },
        ],
      });
    });
  });

  describe('block scalars', () => {
    it('parses literal block scalars with preserved newlines', () => {
      env = setup();
      const yaml = `
notes: |
  Line one
  Line two
`;

      expect(env.parser.parse<Record<string, unknown>>(yaml)).toEqual({
        notes: 'Line one\nLine two\n',
      });
    });

    it('parses folded block scalars with spaces replacing single newlines', () => {
      env = setup();
      const yaml = `
notes: >
  Line one
  Line two
`;

      expect(env.parser.parse<Record<string, unknown>>(yaml)).toEqual({
        notes: 'Line one Line two\n',
      });
    });
  });

  describe('real-world cli.yaml schema', () => {
    it('parses the actual packages/app/src/cli.yaml schema identically', () => {
      const cliYamlPath = path.resolve(import.meta.dirname, '../../app/src/cli.yaml');
      const content = fs.readFileSync(cliYamlPath, 'utf-8');
      const parsed = parseYaml<{
        commands: { name: string; params: { name: string; type: string }[] }[];
        name: string;
        version: string;
      }>(content);

      expect(parsed.name).toBe('s20');
      expect(parsed.version).toBe('0.1.0');
      expect(parsed.commands.length).toBe(2);
      expect(parsed.commands[0].name).toBe('add');
      expect(parsed.commands[0].params.length).toBe(6);
      expect(parsed.commands[0].params[0].name).toBe('task');
      expect(parsed.commands[1].name).toBe('list');
      expect(parsed.commands[1].params[0].name).toBe('limit');
    });
  });

  describe('stringifier', () => {
    it('serializes objects, arrays, and primitives into valid YAML', () => {
      const data = {
        active: true,
        items: ['first', 'second'],
        name: 'test',
        port: 8080,
      };

      const result = stringifyYaml(data);

      expect(result).toContain('active: true');
      expect(result).toContain('name: test');
      expect(result).toContain('port: 8080');
      expect(result).toContain('- first');
      expect(result).toContain('- second');

      const roundTripped = parseYaml(result);

      expect(roundTripped).toEqual(data);
    });
  });
});
