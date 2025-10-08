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
  }
};