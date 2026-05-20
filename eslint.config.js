const js = require("@eslint/js");
const nPlugin = require("eslint-plugin-n");
const prettierConfig = require("eslint-config-prettier");
const globals = require("globals");

module.exports = [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.commonjs,
      },
    },
    plugins: {
      n: nPlugin,
    },
    rules: {
      ...nPlugin.configs.recommended.rules,
      "n/no-process-exit": "off",
      "n/no-unpublished-require": "off",
      "no-unused-vars": ["warn", { 
        "argsIgnorePattern": "^_|^next$", 
        "varsIgnorePattern": "^_|^e$|^error$",
        "caughtErrorsIgnorePattern": "^_"
      }],
      "no-undef": "error",
      "no-case-declarations": "off",
      "no-empty": "off",
    },
  },
  prettierConfig,
  {
    ignores: ["node_modules/**", "dist/**", "data/**", "database/**", "assets/**", "lib/basestore.js"],
  },
];
