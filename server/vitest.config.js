import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    fileParallelism: false,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    sequence: {
      concurrent: false,
    },
    testTimeout: 20000,
    hookTimeout: 20000,
    globalSetup: ['./tests/globalSetup.js'],
    include: ['tests/**/*.test.js'],
  },
});
