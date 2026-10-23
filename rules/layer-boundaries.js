const APP_FORBIDDEN_IMPORTS = new Set(['@s20/cli', '@s20/csv', '@s20/storage']);
const TOOL_FORBIDDEN_IMPORTS = new Set(['@s20/app', '@s20/cli', '@s20/storage']);

/**
 * Custom ESLint Rule: layer-boundaries
 * Enforces Clean Architecture dependency inversion and isomorphic runtime boundaries:
 * 1. @s20/app (packages/app/src) must remain 100% isomorphic (no node:* imports or Bun globals)
 *    and must never import outward layers (@s20/cli, @s20/storage, @s20/csv).
 * 2. Foundational utility packages (@s20/csv, @s20/yaml, @s20/logging) must never import
 *    application, presentation, or storage layers (@s20/app, @s20/cli, @s20/storage).
 */
export const layerBoundariesRule = {
  meta: {
    docs: {
      description:
        'Enforce Clean Architecture inward dependency hierarchy and isomorphic @s20/app boundaries.',
    },
    messages: {
      noAppNodeBuiltin:
        '@s20/app must remain 100% isomorphic (browser/PWA compatible). Do not import "{{source}}" in packages/app/src.',
      noAppOutwardImport:
        'Clean Architecture violation: @s20/app must not depend on outward layer or persistence tool "{{source}}".',
      noToolUpwardImport:
        'Clean Architecture violation: Foundational utility package must not import higher-level package "{{source}}".',
    },
    type: 'problem',
  },
  create(context) {
    const filename = (context.filename || context.getFilename() || '').replaceAll('\\', '/');
    const isAppSrc = filename.includes('/packages/app/src/');
    const isAppPkg = filename.includes('/packages/app/');
    const isToolPkg =
      filename.includes('/packages/csv/') ||
      filename.includes('/packages/yaml/') ||
      filename.includes('/packages/logging/');

    if (!isAppPkg && !isToolPkg) return {};

    return {
      ImportDeclaration(node) {
        const source = String(node.source.value || '');

        if (isAppSrc && source.startsWith('node:')) {
          context.report({
            data: { source },
            messageId: 'noAppNodeBuiltin',
            node: node.source,
          });

          return;
        }

        if (isAppPkg && APP_FORBIDDEN_IMPORTS.has(source)) {
          context.report({
            data: { source },
            messageId: 'noAppOutwardImport',
            node: node.source,
          });

          return;
        }

        if (isToolPkg && TOOL_FORBIDDEN_IMPORTS.has(source)) {
          context.report({
            data: { source },
            messageId: 'noToolUpwardImport',
            node: node.source,
          });
        }
      },
    };
  },
};
