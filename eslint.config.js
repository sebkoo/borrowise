// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier');
const globals = require('globals');

module.exports = defineConfig([
  expoConfig,
  eslintConfigPrettier,
  {
    ignores: ['dist/*'],
  },
  {
    // Root-level CommonJS tooling config files run under Node, not the app's
    // React Native/browser runtime that eslint-config-expo otherwise assumes.
    files: ['*.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },
  {
    // jest.setup.js calls jest.mock() at module scope, outside any *.test.*
    // file, so it needs the jest global that eslint-config-expo's test-file
    // matching doesn't grant it.
    files: ['jest.setup.js'],
    languageOptions: {
      globals: globals.jest,
    },
  },
]);
