// This config file is to be replaced by eslint.config.mjs which is compatible with
// newer versions of eslint. However, @quasar-app uses a dependency that still expects
// this old version of the config file. This config file can be deleted when updating
// to @quasar/app-webpack v4.

module.exports = {
  root: true,

  // Rules order is important, please avoid shuffling them
  extends: [
    // Base ESLint recommended rules
    "eslint:recommended",

    // ESLint typescript rules
    // See https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#usage
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",

    // `plugin:vue/essential` by default, consider switching to `plugin:vue/strongly-recommended`
    //  or `plugin:vue/recommended` for stricter rules.
    // See https://github.com/vuejs/eslint-plugin-vue#priority-a-essential-error-prevention
    "plugin:vue/vue3-recommended",

    // Usage with Prettier, provided by 'eslint-config-prettier'.
    // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#usage-with-prettier
    "prettier",

    // Plugin for translations.
    // https://eslint-plugin-vue-i18n.intlify.dev/started.html#installation
    //"plugin:vue-i18n/recommended"
    
  ],
  plugins: [
    // Required to apply rules which need type information
    "@typescript-eslint",
    "@stylistic",
    // Required to lint *.vue files
    // See https://eslint.vuejs.org/user-guide/#why-doesn-t-it-work-on-vue-file
    "vue"
    // Prettier has not been included as plugin to avoid performance impact
    // See https://github.com/typescript-eslint/typescript-eslint/issues/389#issuecomment-509292674
    // Add it as an extension
  ],

  // Must use parserOptions instead of "parser" to allow vue-eslint-parser to keep working
  // See https://eslint.vuejs.org/user-guide/#how-to-use-custom-parser
  // `parser: 'vue-eslint-parser'` is already included with any 'plugin:vue/**' config and should be omitted
  parserOptions: {
    parser: "@typescript-eslint/parser",
    sourceType: "module",
    project: "./tsconfig.json",
    extraFileExtensions: [".vue", ".json"]
  },

  env: {
    browser: true,
    node: true
  },

  globals: {
    ga: true, // Google Analytics
    cordova: true,
    __statics: true,
    process: true,
    // NFC Web API
    NDEFReader: true,
    NDEFReadingEvent: true
  },

  // add your custom rules here
  rules: {
    "prefer-promise-reject-errors": "off",
    // quotes: ["warn", "single"],
    "@stylistic/indent": ["warn", 2],

    // allow console.log during development only
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    // allow debugger during development only
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",

    // Custom
    "vue/component-name-in-template-casing": ["error", "kebab-case"],
    "vue/multi-word-component-names": "off",

    // Correct typescript linting until at least 2.0.0 major release
    // See https://github.com/typescript-eslint/typescript-eslint/issues/501
    // See https://github.com/typescript-eslint/typescript-eslint/issues/493
    "@typescript-eslint/explicit-function-return-type": "off",
    
    /*
    "vue-i18n/no-unused-keys": ["warn", {
      extensions: [".js", ".vue"]
    }],
    "vue-i18n/no-dynamic-keys": "warn",
    */
    // TODO: enable that!
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/ban-types": "off"
  },
  settings: {
    "vue-i18n": {
      localeDir: './src/i18n/**/*.json'
    }
  }
};
