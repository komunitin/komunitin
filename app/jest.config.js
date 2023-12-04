const esModules = ['quasar', 'quasar/lang', 'lodash-es', 'leaflet/dist/leaflet-src.esm', 'markdown-to-txt'].join('|');

module.exports = {
  globals: {
    __DEV__: true,
    'vue-jest': {
      pug: { doctype: 'html' },
    }
  },
  testEnvironment: 'jsdom',
  setupFiles: [
    '<rootDir>/test/jest/jest.env.ts',
  ],
  collectCoverage: false,
  coverageDirectory: '<rootDir>/test/jest/coverage',
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,vue}',
  ],
  coveragePathIgnorePatterns: ['/node_modules/', '.d.ts$'],
  coverageReporters: [
    'html',
    'text',
    'text-summary',
  ],
  coverageThreshold: {
    global: {},
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/*.spec.js',
    '<rootDir>/src/**/__tests__/*.spec.ts',
    '<rootDir>/src/**/__tests__/*.test.ts',
    '<rootDir>/test/jest/__tests__/**/*.spec.ts',
    '<rootDir>/test/jest/__tests__/**/*.test.ts',
  ],
  moduleFileExtensions: [
    'js',
    'json',
    'jsx',
    'ts',
    'tsx',
    'vue',
    'mjs',
    'cjs'
  ],
  moduleNameMapper: {
    '^quasar$': 'quasar/dist/quasar.esm.prod.js',
    '^~/(.*)$': '<rootDir>/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
    '^app/(.*)$': '<rootDir>/$1',
    '^components/(.*)$': '<rootDir>/src/components/$1',
    '^layouts/(.*)$': '<rootDir>/src/layouts/$1',
    '^pages/(.*)$': '<rootDir>/src/pages/$1',
    '^assets/(.*)$': '<rootDir>/src/assets/$1',
    '^boot/(.*)$': '<rootDir>/src/boot/$1',
    '.*css$': '<rootDir>/__mocks__/mock.css',
  },
  transform: {
    '.*\\.vue$': '@vue/vue3-jest',
    // See https://jestjs.io/docs/en/configuration.html#transformignorepatterns-array-string
    [`^(${esModules}).+\\.js$`]: 'babel-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.tsx?$': ['ts-jest', 
      // Remove if using `const enums`
      // See https://huafu.github.io/ts-jest/user/config/isolatedModules#example
      {
        isolatedModules: true,
      }],
  },
  transformIgnorePatterns: [`node_modules/(?!(${esModules}))`],

  moduleDirectories: [
    '<rootDir>/node_modules',
  ],
  preset: 'ts-jest/presets/js-with-babel',
  testEnvironmentOptions: {
    customExportConditions: ["node", "node-addons"],
  },
  testTimeout: 30000
}
