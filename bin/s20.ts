#!/usr/bin/env bun
import process from 'node:process';
import { createDefaultConfig, createS20Cli, createS20Service, createStorage } from '@s20/core';

const config = createDefaultConfig();
const storage = createStorage(config);
const service = createS20Service({ config, storage });
const cli = createS20Cli({ config, service, storage });

await cli.execute(process.argv.slice(2));
