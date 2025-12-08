module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/tests/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,ts}', // Include all JS/TS files in /src
    '!src/**/*.d.ts' // Exclude type definition files
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover']
}
