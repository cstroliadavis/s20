/**
 * @file Configuration manager and logger metadata builder.
 */
import { formatAsJson } from './formatters.js';
import type {
  EffectiveSettings,
  LoggerConfig,
  LogLoggerMetadata,
  PageContext,
  PageFilterConfig,
} from './types.js';

/**
 * Sets a key-value pair on the target object when the value is not undefined.
 */
function applyEntry<T extends object>(target: T, entry: [string, unknown]): void {
  if (entry[1] === undefined) return;

  Reflect.set(target, entry[0], entry[1]);
}

/**
 * Builds the initial default logger settings.
 */
function createDefaultConfig(): LoggerConfig {
  return {
    categories: {},
    defaultLevel: 'info',
    enabled: true,
    formatter: formatAsJson,
    level: 'info',
    pages: {},
  };
}

/**
 * Extracts deployment and server metadata from the logger configuration.
 */
function extractConfigMetadata(config?: LoggerConfig): Partial<LogLoggerMetadata> | undefined {
  if (!config) return undefined;

  return {
    appName: config.appName,
    appVersion: config.appVersion,
    environment: config.environment,
    serverName: config.serverName,
  };
}

/**
 * Extracts context and host metadata from a page or file context.
 */
function extractPageMetadata(page?: PageContext): Partial<LogLoggerMetadata> | undefined {
  if (!page) return undefined;

  return {
    appName: page.appName,
    appVersion: page.appVersion,
    category: page.category,
    environment: page.environment,
    location: page.location,
    name: page.name,
    namespace: page.namespace,
    serverName: page.serverName,
  };
}

/**
 * Looks up filter overrides configured for a category name.
 */
function findCategoryFilter(
  categories?: Record<string, PageFilterConfig>,
  category?: string,
): PageFilterConfig | undefined {
  if (!category) return undefined;
  if (!categories) return undefined;

  return categories[category];
}

/**
 * Looks up filter overrides configured for a page or file location.
 */
function findPageFilter(
  pages?: Record<string, PageFilterConfig>,
  page?: PageContext,
): PageFilterConfig | undefined {
  const key = resolvePageKey(page);

  if (!key) return undefined;
  if (!pages) return undefined;

  return pages[key];
}

/**
 * Extracts top-level logger settings into an effective settings record.
 */
function getBaseSettings(config: LoggerConfig): EffectiveSettings {
  return {
    enabled: config.enabled !== false,
    level: config.level ?? 'info',
  };
}

/**
 * Copies defined properties from a source object onto the target.
 */
function mergeDefined<T extends object>(target: T, source?: Partial<T>): void {
  if (!source) return;

  Object.entries(source).forEach((entry) => {
    applyEntry(target, entry);
  });
}

/**
 * Finds the lookup key for a page context, preferring name over location.
 */
function resolvePageKey(page?: PageContext): string | undefined {
  if (!page) return undefined;
  if (page.name) return page.name;

  return page.location;
}

/**
 * Assembles metadata describing the logger context from active configuration and page settings.
 *
 * @param page - Optional page or file context scoped to a specific logger.
 * @param config - Optional active global configuration settings.
 * @returns Combined logger metadata, or undefined if no metadata attributes are present.
 * @example
 * ```ts
 * const meta = buildLoggerMetadata(page, config);
 * ```
 */
export function buildLoggerMetadata(
  page?: PageContext,
  config?: LoggerConfig,
): LogLoggerMetadata | undefined {
  const metadata: LogLoggerMetadata = {};

  mergeDefined(metadata, extractConfigMetadata(config));
  mergeDefined(metadata, extractPageMetadata(page));

  if (Object.keys(metadata).length === 0) return undefined;

  return metadata;
}

/**
 * Creates a manager for reading, updating, and resolving logger configuration.
 *
 * @param initial - Starting configuration values to apply over defaults.
 * @returns Methods to update settings and resolve active filters for pages or categories.
 * @example
 * ```ts
 * const manager = createConfigManager({ level: 'debug' });
 * manager.updateConfig({ level: 'warn' });
 * const effective = manager.resolveEffective();
 * ```
 */
export function createConfigManager(initial?: Partial<LoggerConfig>) {
  const _ = {
    config: Object.assign(createDefaultConfig(), initial),
  };

  function getConfig(): LoggerConfig {
    return { ..._.config };
  }

  function reset(): void {
    _.config = createDefaultConfig();
  }

  function resolveEffective(page?: PageContext): EffectiveSettings {
    const base = getBaseSettings(_.config);
    const category = page ? page.category : undefined;
    const categoryFilter = findCategoryFilter(_.config.categories, category);
    const pageFilter = findPageFilter(_.config.pages, page);

    mergeDefined(base, categoryFilter);
    mergeDefined(base, pageFilter);

    return base;
  }

  function updateConfig(patch: Partial<LoggerConfig>): LoggerConfig {
    Object.assign(_.config, patch);

    return getConfig();
  }

  return {
    getConfig,
    reset,
    resolveEffective,
    updateConfig,
  };
}
