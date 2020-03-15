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
    '<rootDir>/src/components/**/*.vue',
    '<rootDir>/src/pages/**/*.vue',
    '<rootDir>/src/pages/*/*/*.vue',
    '<rootDir>/src/services/**/*.ts',
    '<rootDir>/src/store/**/*.ts',
    '<rootDir>/src/store/*/*/*.ts'
  ],
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
    '.*css$': '<rootDir>/__mocks__/mock.css'
  },
  transform: {
    '.*\\.vue$': 'vue-jest',
    '<rootDir>/node_modules/vue-navigator-share/*vue': 'vue-jest',
    '.*\\.js$': 'babel-jest',
    '.+\\.(css|styl|less|sass|scss|svg|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
    // process `*.ts` files with `ts-jest`
    '^.+\\.tsx?$': 'ts-jest'
    // use these if NPM is being flaky
    // '.*\\.vue$': '<rootDir>/node_modules/@quasar/quasar-app-extension-testing-unit-jest/node_modules/vue-jest',
    // '.*\\.js$': '<rootDir>/node_modules/@quasar/quasar-app-extension-testing-unit-jest/node_modules/babel-jest'
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!quasar/lang)',
    '<rootDir>/node_modules/(?!vue-navigator-share)'
  ],
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
  moduleDirectories: ['<rootDir>/node_modules']
};
