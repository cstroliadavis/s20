import { describe, expect, it } from 'bun:test';
import { createYamlParser, parseYaml, type YamlParserOptions } from '../src/index.js';

function setup(options?: YamlParserOptions) {
  const parser = createYamlParser(options);

  return Object.freeze({
    parser,
  });
}

describe('yaml parser and stringifier', () => {
  describe('scalars', () => {
    it('parses boolean values correctly', () => {
      const { parser } = setup();

      expect(parser.parse<Record<string, unknown>>('flag: true')).toEqual({ flag: true });
      expect(parser.parse<Record<string, unknown>>('flag: false')).toEqual({ flag: false });
      expect(parser.parse<Record<string, unknown>>('flag: yes')).toEqual({ flag: true });
      expect(parser.parse<Record<string, unknown>>('flag: no')).toEqual({ flag: false });
    });

    it('parses integer and float numbers correctly', () => {
      const { parser } = setup();

      expect(parser.parse<Record<string, unknown>>('count: 42')).toEqual({ count: 42 });
      expect(parser.parse<Record<string, unknown>>('temp: -12.5')).toEqual({ temp: -12.5 });
      expect(parser.parse<Record<string, unknown>>('zero: 0')).toEqual({ zero: 0 });
    });

    it('parses version strings with multiple dots as plain strings', () => {
      const { parser } = setup();

      expect(parser.parse<Record<string, unknown>>('version: 0.1.0')).toEqual({
        version: '0.1.0',
      });
    });

    it('parses null and tilde values correctly', () => {
      const { parser } = setup();

      expect(parser.parse<Record<string, unknown>>('empty: null')).toEqual({ empty: null });
      expect(parser.parse<Record<string, unknown>>('blank: ~')).toEqual({ blank: null });
      expect(parser.parse<Record<string, unknown>>('none:')).toEqual({ none: null });
    });

    it('parses quoted strings with escape sequences', () => {
      const { parser } = setup();

      expect(parser.parse<Record<string, unknown>>("quoted: 'hello world'")).toEqual({
        quoted: 'hello world',
      });
      expect(parser.parse<Record<string, unknown>>("escaped: 'it''s great'")).toEqual({
        escaped: "it's great",
      });
      expect(parser.parse<Record<string, unknown>>('double: "hello \\"world\\""')).toEqual({
        double: 'hello "world"',
      });
    });

    it('parses flow sequences and flow mappings', () => {
      const { parser } = setup();

      expect(parser.parse<Record<string, unknown>>('tags: [a, b, c]')).toEqual({
        tags: ['a', 'b', 'c'],
      });
      expect(parser.parse<Record<string, unknown>>('point: { x: 10, y: 20 }')).toEqual({
        point: { x: 10, y: 20 },
      });
    });
  });

  describe('mappings', () => {
    it('parses flat key-value pairs', () => {
      const { parser } = setup();
      const yaml = `
name: s20
version: 0.1.0
description: Time tracker
`;

      expect(parser.parse<Record<string, unknown>>(yaml)).toEqual({
        description: 'Time tracker',
        name: 's20',
        version: '0.1.0',
      });
    });

    it('parses nested mappings with multi-level indentation', () => {
      const { parser } = setup();
      const yaml = `
server:
  host: localhost
  port: 8080
  logging:
    level: debug
    file: app.log
`;

      expect(parser.parse<Record<string, unknown>>(yaml)).toEqual({
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
      const { parser } = setup();
      const yaml = `
# Top comment
name: s20 # Tool name
# Middle comment
limit: 10 # Display limit
`;

      expect(parser.parse<Record<string, unknown>>(yaml)).toEqual({
        limit: 10,
        name: 's20',
      });
    });

    it('enforces duplicate key checks when disallowDuplicateKeys is enabled', () => {
      const { parser } = setup({ disallowDuplicateKeys: true });
      const yaml = `
name: first
name: second
`;

      expect(() => parser.parse(yaml)).toThrow('Duplicate key detected');
    });
  });

  describe('sequences', () => {
    it('parses list of scalar items', () => {
      const { parser } = setup();
      const yaml = `
items:
  - apple
  - banana
  - cherry
`;

      expect(parser.parse<Record<string, unknown>>(yaml)).toEqual({
        items: ['apple', 'banana', 'cherry'],
      });
    });

    it('parses sequences of mappings with dash prefix on first property', () => {
      const { parser } = setup();
      const yaml = `
commands:
  - name: add
    description: Record an event
    isDefault: true
  - name: list
    description: List events
`;

      expect(parser.parse<Record<string, unknown>>(yaml)).toEqual({
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
      const { parser } = setup();
      const yaml = `
items:
  -
    id: 1
    title: First
  -
    id: 2
    title: Second
`;

      expect(parser.parse<Record<string, unknown>>(yaml)).toEqual({
        items: [
          { id: 1, title: 'First' },
          { id: 2, title: 'Second' },
        ],
      });
    });
  });

  describe('block scalars', () => {
    it('parses literal block scalars with preserved newlines', () => {
      const { parser } = setup();
      const yaml = `
notes: |
  Line one
  Line two
`;

      expect(parser.parse<Record<string, unknown>>(yaml)).toEqual({
        notes: 'Line one\nLine two\n',
      });
    });

    it('parses folded block scalars with spaces replacing single newlines', () => {
      const { parser } = setup();
      const yaml = `
notes: >
  Line one
  Line two
`;

      expect(parser.parse<Record<string, unknown>>(yaml)).toEqual({
        notes: 'Line one Line two\n',
      });
    });
  });

  describe('cli schema structure', () => {
    it('parses nested command and parameter sequence definitions', () => {
      const schemaYaml = `
name: s20
version: 0.1.0
commands:
  - name: add
    isDefault: true
    triggers: event-add
    params:
      - name: task
        type: text
      - name: done
        type: flag
        negator: true
`;
      const parsed = parseYaml<{
        commands: { name: string; params: { name: string; type: string }[] }[];
        name: string;
        version: string;
      }>(schemaYaml);

      expect(parsed.name).toBe('s20');
      expect(parsed.version).toBe('0.1.0');
      expect(parsed.commands[0]?.name).toBe('add');
      expect(parsed.commands[0]?.params.map((p) => p.name)).toEqual(['task', 'done']);
    });
  });
});
