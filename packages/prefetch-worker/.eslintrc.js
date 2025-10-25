module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  env: {
    serviceworker: true,
    es6: true,
    node: true,
  },
  globals: {
    self: 'readonly',
    importScripts: 'readonly',
    caches: 'readonly',
    clients: 'readonly',
    registration: 'readonly',
    skipWaiting: 'readonly',
  },
  rules: {
    // Service Worker 特定规则
    'no-restricted-globals': [
      'error',
      {
        name: 'window',
        message: 'window is not available in Service Worker context. Use self instead.',
      },
      {
        name: 'document',
        message: 'document is not available in Service Worker context.',
      },
      {
        name: 'localStorage',
        message: 'localStorage is not available in Service Worker context.',
      },
    ],
    
    // TypeScript 规则
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // 通用规则
    'no-console': 'off', // Service Worker 需要 console 用于调试
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error',
    'template-curly-spacing': 'error',
    'arrow-spacing': 'error',
    'comma-dangle': ['error', 'always-multiline'],
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'indent': ['error', 2],
    'max-len': ['warn', { code: 100, ignoreUrls: true }],
  },
  overrides: [
    {
      files: ['*.test.ts', '*.spec.ts'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
    {
      files: ['rollup.config.js', '.eslintrc.js'],
      env: {
        node: true,
      },
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
};