module.exports = {
  testEnvironment: 'jsdom',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  testMatch: ['**/src/**/*.test.ts', '**/src/**/*.test.tsx'],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(svg)$': '<rootDir>/__mocks__/svgMock.js',
    "@emotion/unitless": "<rootDir>/__mocks__/@emotion_unitless.js"
    ,
    '^@\\/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': '<rootDir>/jest-transform-import-meta.js'
  },
  // Coverage thresholds for Google Drive adapter module
  coverageThreshold: {
    'src/services/drive/**/*.ts': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  },
  // Exclude test files and index from coverage
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/__tests__/',
    '/index.ts$'
  ]
};