#!/usr/bin/env bun
import process from 'node:process';
import { createDefaultConfig, createS20Cli, createS20Service, createStorage } from '@s20/app';
import { jsonlFilePlugin, logger } from '@s20/logging';

const config = createDefaultConfig();

logger.config({
  appName: 's20',
  appVersion: '0.1.0',
  level: 'info',
});
logger.use(jsonlFilePlugin, {
  baseName: 's20',
  logDir: config.logDir,
  maxRows: config.logMaxRows,
});

const storage = createStorage(config);
const service = createS20Service({ config, storage });
const cli = createS20Cli({ config, service, storage });

await cli.execute(process.argv.slice(2));
