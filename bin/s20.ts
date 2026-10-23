#!/usr/bin/env bun
import path from 'node:path';
import process from 'node:process';
import { createDefaultConfig, createS20Service } from '@s20/app';
import { createS20Cli } from '@s20/cli';
import { jsonlFilePlugin, logger } from '@s20/logging';
import { createCsvStorage, createDefaultStoragePaths } from '@s20/storage';

const baseDir = process.env.S20_DATA_DIR ?? path.resolve(import.meta.dirname, '..');
const config = createDefaultConfig();
const paths = createDefaultStoragePaths(baseDir);

logger.config({
  appName: 's20',
  appVersion: '0.1.0',
  level: 'info',
});
logger.use(jsonlFilePlugin, {
  baseName: 's20',
  logDir: paths.logDir,
  maxRows: paths.logMaxRows,
});

const storage = createCsvStorage(paths);
const service = createS20Service({ config, storage });
const cli = createS20Cli({ service });

await cli.execute(process.argv.slice(2));
