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
  ],
}
