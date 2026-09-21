// SPEC-TOOL-027/R4: review/copy into the target root; not auto-installed policy.
// Requires compatible project-local eslint, @eslint/js, typescript-eslint, typescript.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
export default [
  { ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '.covers/**', '.agents/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ['**/*.ts', '**/*.tsx'], rules: { complexity: ['warn', 10], 'max-params': ['warn', 5] } },
];
