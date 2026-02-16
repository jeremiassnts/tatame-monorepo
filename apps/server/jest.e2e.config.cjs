/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/e2e/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: false,
        tsconfig: "tsconfig.json",
      },
    ],
  },
  setupFiles: ["<rootDir>/src/__tests__/e2e/setup.ts"],
  testTimeout: 15000,
  forceExit: true,
  maxWorkers: 1,
};
