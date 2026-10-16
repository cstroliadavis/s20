/**
 * @file Bundled plugins entrypoint for @s20/logging.
 */
import { jsonlFilePlugin } from './jsonl-file.js';

export { jsonlFilePlugin } from './jsonl-file.js';
export type { JsonlFilePluginOptions, LoggerPlugin, LoggerTarget } from '../types.js';

/**
 * Bundled logger plugins for S20 CLI file logging.
 *
 * @example
 * ```ts
 * import { logger, loggerPlugins } from '@s20/logging';
 *
 * logger.use(loggerPlugins.jsonlFile, { maxRows: 5000 });
 * ```
 */
export const loggerPlugins = Object.freeze({
  jsonlFile: jsonlFilePlugin,
});

export default loggerPlugins;
