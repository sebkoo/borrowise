const fs = require('fs');
const path = require('path');

// Jest hard-fails a path-scoped coverageThreshold key that matches zero files
// ("Coverage data for ... was not found"), so the core/ gate can only be
// registered once core/ exists (commit #7). The threshold value itself is
// fixed at 90% from day one per CLAUDE.md; this just avoids a chicken-and-egg
// failure on the empty repo.
const coreDirExists = fs.existsSync(path.join(__dirname, 'core'));

const coverageThreshold = {
  global: {
    statements: 80,
    branches: 80,
    functions: 80,
    lines: 80,
  },
};

if (coreDirExists) {
  coverageThreshold['./core/**/*.{ts,tsx}'] = {
    statements: 90,
    branches: 90,
    functions: 90,
    lines: 90,
  };
}

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/__mocks__/styleMock.js',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'core/**/*.{ts,tsx}',
    'integration/**/*.{ts,tsx}',
    '!**/*.d.ts',
    // Composition root: no isolated unit-test value, exercised by Maestro E2E (commit #9).
    '!src/app/_layout.tsx',
    // Platform-specific resolution requires a multi-project jest-expo config (ios/android/web
    // projects) to exercise both variants; deferred until platform-differentiated UI ships.
    '!src/hooks/use-color-scheme.ts',
    '!src/hooks/use-color-scheme.web.ts',
  ],
  coverageThreshold,
};
