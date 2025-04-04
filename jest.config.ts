import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    coverageProvider: 'v8',
    testEnvironment: 'node',
    setupFiles: ['dotenv/config']
};

export default config;