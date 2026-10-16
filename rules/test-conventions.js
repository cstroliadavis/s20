/**
 * Custom ESLint Rule: test-conventions
 * Enforces universal unit testing principles across *.test.ts and *.spec.ts files:
 * 1. Active tense test descriptions (bans "should ..." in it/test titles).
 * 2. Bans beforeEach() in favor of explicit local setup() helper functions.
 * 3. Bans mutable suite-scoped `let` declarations inside describe() blocks.
 */
export const testConventionsRule = {
  meta: {
    docs: {
      description:
        'Enforce active-tense test descriptions, explicit setup() helpers over beforeEach(), and no mutable suite-scoped let variables.',
    },
    messages: {
      noBeforeEach:
        'Avoid beforeEach(); use an explicit local setup() helper function inside each test to prevent state bleeding.',
      noShouldInTitle:
        'Use active-tense test descriptions (e.g. "parses...", "returns...") instead of starting with "should".',
      noSuiteMutableLet:
        'Avoid mutable suite-scoped `let` declarations inside describe(); return isolated state from a local setup() helper instead.',
    },
    type: 'suggestion',
  },
  create(context) {
    const filename = (context.filename || context.getFilename() || '').replaceAll('\\', '/');
    const isTestFile = filename.endsWith('.test.ts') || filename.endsWith('.spec.ts');

    if (!isTestFile) return {};

    function checkDescribeBody(callNode) {
      const callback = callNode.arguments[1];

      if (!callback || !callback.body || callback.body.type !== 'BlockStatement') return;

      for (const stmt of callback.body.body) {
        if (stmt.type === 'VariableDeclaration' && stmt.kind === 'let') {
          context.report({
            messageId: 'noSuiteMutableLet',
            node: stmt,
          });
        }
      }
    }

    function checkTestTitle(callNode) {
      const titleArg = callNode.arguments[0];

      if (!titleArg || titleArg.type !== 'Literal' || typeof titleArg.value !== 'string') return;

      if (/^should\b/i.test(titleArg.value.trim())) {
        context.report({
          messageId: 'noShouldInTitle',
          node: titleArg,
        });
      }
    }

    return {
      CallExpression(node) {
        if (node.callee.type !== 'Identifier') return;

        const name = node.callee.name;

        if (name === 'beforeEach') {
          context.report({
            messageId: 'noBeforeEach',
            node: node.callee,
          });

          return;
        }

        if (['it', 'test'].includes(name)) {
          checkTestTitle(node);

          return;
        }

        if (name === 'describe') {
          checkDescribeBody(node);
        }
      },
    };
  },
};

