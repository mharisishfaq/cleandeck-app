// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['dist/*', '.expo/*', 'android/*', 'ios/*'],
    rules: {
      // Reanimated relies on mutating .value on shared values
      'react-hooks/immutability': 'off',
    },
  },
]);
