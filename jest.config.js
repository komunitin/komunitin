module.exports = {
  globals: {
    __DEV__: true
  },
  // This commented option lets us add some custom code before each test.
  // setupFilesAfterEnv: [
  //  '<rootDir>/test/jest/jest.setup.js'
  //],
  // noStackTrace: true,
  // bail: true,
  // cache: false,
  // verbose: true,
  // watch: true,
  collectCoverage: false,
  coverageDirectory: '<rootDir>/test/jest/coverage',
  collectCoverageFrom: [
    '<rootDir>/src/components/*.{ts,vue}',
    '<rootDir>/src/components/**/*.{ts,vue}',
    '<rootDir>/src/pages/*/*/*.{ts,vue}',
    '<rootDir>/src/services/*.{ts,vue}',
    '<rootDir>/src/store/*/*/*.{ts,vue}'
  ],
  "coverageReporters": ["html", 'text', "text-summary"],
  coverageThreshold: {
    global: {
      //  branches: 50,
      //  functions: 50,
      //  lines: 50,
      //  statements: 50
    }
  },
  testMatch: [
    '<rootDir>/test/jest/__tests__/**/*.spec.ts',
    '<rootDir>/test/jest/__tests__/**/*.test.ts',
    '<rootDir>/src/**/__tests__/*.spec.ts',
    '<rootDir>/src/**/__tests__/*.spec.js',
    '<rootDir>/src/**/__tests__/*.test.ts'
  ],
  moduleFileExtensions: ['vue', 'js', 'jsx', 'json', 'ts', 'tsx'],
  moduleNameMapper: {
    '^vue$': '<rootDir>/node_modules/vue/dist/vue.common.js',
    '^test-utils$':
      '<rootDir>/node_modules/@vue/test-utils/dist/vue-test-utils.js',
    '^quasar$': '<rootDir>/node_modules/quasar/dist/quasar.common.js',
    '^~/(.*)$': '<rootDir>/$1',
    '^src/(.*)$': '<rootDir>/src/$1',
    '.*css$': '<rootDir>/__mocks__/mock.css',
    '^app/(.*)$': '<rootDir>/$1'
  },
  transform: {
    '.*\\.vue$': 'vue-jest',
    '.*\\.js$': 'babel-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
    '^.+\\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(quasar/lang.*|quasar/icon-set.*))',
  ],
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
  moduleDirectories: ['<rootDir>/node_modules']
};
