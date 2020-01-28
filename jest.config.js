module.exports = {
  rootDir: 'src',
  reporters: ['default'],
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: '.spec.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  collectCoverage: true,
  collectCoverageFrom: ['!**/index.ts', '!**/start.ts', '!**/server.ts', '**/*.ts'],
  coverageDirectory: './coverage/jest/lcov',
  testEnvironment: 'node'
};
