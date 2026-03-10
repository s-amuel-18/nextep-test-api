import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  // Global ignores (replaces ignorePatterns + .eslintignore)
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },

  // TypeScript source files
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Base recommended rules from plugin
      ...tsPlugin.configs.recommended.rules,

      // Custom overrides
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      // {} is intentionally used as "unused slot" in Express Request generics
      // (ParamsDictionary is assignable to {} but not to Record<string,string>)
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-console': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },
];
