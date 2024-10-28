// @ts-check

import eslintJs from "@eslint/js";
import tsEslint from "typescript-eslint"
import stylistic from '@stylistic/eslint-plugin'
import eslintConfigPrettier from "eslint-config-prettier";

import eslintVue from 'eslint-plugin-vue'

import globals from "globals"

export default tsEslint.config(
  eslintJs.configs.recommended,
  ...tsEslint.configs.recommended,
  ...eslintVue.configs["flat/recommended"],
  eslintConfigPrettier,
  {
    files: [
      'src/**/*.{ts,tsx,js,jsx,vue}', 
      'src-pwa/**/*.{ts,tsx,js,jsx,vue}'
    ],
    plugins: {
      '@typescript-eslint': tsEslint.plugin,
      '@stylistic': stylistic,
      vue: eslintVue
    },
    languageOptions: {
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ga: true, // Google Analytics
        // NFC Web API
        NDEFReader: true,
        NDEFReadingEvent: true,
        // node process
        process: true,
      },
      parserOptions: {
        parser: "@typescript-eslint/parser",
      }
    },
    rules: {
      "prefer-promise-reject-errors": "off",
      // quotes: ["warn", "single"],
      "@stylistic/indent": ["warn", 2],

      "no-console": "error",
      "no-debugger": "error",

      // Custom
      "vue/component-name-in-template-casing": ["error", "kebab-case"],
      "vue/multi-word-component-names": "off",


    },
    settings: {
      "vue-i18n": {
        localeDir: './src/i18n/**/*.json'
      }
    }
  },
  {
    // Relax linting for test files.
    files: ["test/**/*.{ts,tsx,js,jsx}", "**/*.spec.{ts,tsx,js,jsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    }
  },
  {
    ignores: [
      "node_modules",
      ".quasar",
      ".vscode",
      "dist",
      "jest.config.js",
      "quasar.conf.js",
      "babel.config.js",
      ".postcssrc.js",
    ]
  }
)