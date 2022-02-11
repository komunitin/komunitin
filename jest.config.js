module.exports = {
  globals: {
    __DEV__: true,
    'vue-jest': {
      babelConfig: true,
    },
  },
  setupFiles: [
    '<rootDir>/test/jest/jest.env.ts',
  ],
  collectCoverage: false,
  coverageDirectory: '<rootDir>/test/jest/coverage',
  collectCoverageFrom: [
    '<rootDir>/src/components/*.{ts,vue}',
    '<rootDir>/src/components/**/*.{ts,vue}',
    '<rootDir>/src/pages/*/*/*.{ts,vue}',
    '<rootDir>/src/services/*.{ts,vue}',
    '<rootDir>/src/store/*/*/*.{ts,vue}',
  ],
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
  ],
  moduleNameMapper: {
    '^vue$': '<rootDir>/node_modules/vue/dist/vue.common.js',
    '^test-utils$': '<rootDir>/node_modules/@vue/test-utils/dist/vue-test-utils.js',
    '^quasar$': '<rootDir>/node_modules/quasar/dist/quasar.common.js',
    '^~/(.*)$': '<rootDir>/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
    '.*css$': '<rootDir>/__mocks__/mock.css',
    '^app/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '.*\\.vue$': 'vue-jest',
    '.*\\.js$': 'babel-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$': 'jest-transform-stub',
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(quasar/lang.*|quasar/icon-set.*))',
  ],
  snapshotSerializers: [
    '<rootDir>/node_modules/jest-serializer-vue',
  ],
  moduleDirectories: [
    '<rootDir>/node_modules',
  ],
  preset: 'ts-jest/presets/js-with-babel',
}
