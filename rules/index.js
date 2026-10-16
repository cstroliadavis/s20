import { guardPatternsRule } from './guard-patterns.js';
import { layerBoundariesRule } from './layer-boundaries.js';
import { preferIncludesRule } from './prefer-includes.js';
import { sortFunctionDeclarationsRule } from './sort-function-declarations.js';
import { testConventionsRule } from './test-conventions.js';

export default {
  meta: {
    name: 'local',
  },
  rules: {
    'guard-patterns': guardPatternsRule,
    'layer-boundaries': layerBoundariesRule,
    'prefer-includes': preferIncludesRule,
    'sort-function-declarations': sortFunctionDeclarationsRule,
    'test-conventions': testConventionsRule,
  },
};
