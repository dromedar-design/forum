module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.(js|ts|tsx)$': 'ts-jest',
  },
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname',
  ],
  collectCoverageFrom: [
    'db/**/*.(js|ts)',
    'pages/**/*.(js|ts)',
    'utils/**/*.(js|ts)',
    'components/**/*.(js|ts)',
  ],
  moduleNameMapper: {
    '^@db(.*)$': '<rootDir>/db$1',
    '^@utils(.*)$': '<rootDir>/utils$1',
    '^@pages(.*)$': '<rootDir>/pages$1',
    '^@components(.*)$': '<rootDir>/components$1',
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.jest.json',
    },
  },
  setupFiles: ['dotenv/config'],
  testTimeout: 10000,
}
