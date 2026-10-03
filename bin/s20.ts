#!/usr/bin/env bun
import process from 'node:process';
import { createS20Cli } from '../src/cli.js';
import { createDefaultConfig } from '../src/config.js';
import { createS20Service } from '../src/s20-service.js';
import { createStorage } from '../src/storage.js';

const config = createDefaultConfig();
const storage = createStorage(config);
const service = createS20Service({ config, storage });
const cli = createS20Cli({ config, service, storage });

await cli.execute(process.argv.slice(2));
