import type { YamlStringifyOptions } from './options.types.js';

/**
 * Interface for YAML parser instance.
 */
export interface YamlParser {
  /**
   * Parses YAML content string into JavaScript data structure.
   */
  parse<T = unknown>(content: string): T;
}

/**
 * Interface for YAML stringifier instance.
 */
export interface YamlStringifier {
  /**
   * Serializes JavaScript data into a YAML formatted string.
   */
  stringify(data: unknown, options?: YamlStringifyOptions): string;
}
