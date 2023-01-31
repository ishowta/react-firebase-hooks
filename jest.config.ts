import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/firebase.ts'],
};

export default config;
