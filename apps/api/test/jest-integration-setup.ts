// Mock bcrypt before any imports that use it
jest.mock('bcrypt', () => ({
  hash: jest.fn((password: string) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password: string, hash: string) => Promise.resolve(hash === `hashed_${password}`)),
  genSalt: jest.fn(() => Promise.resolve('salt')),
}));

// Prevent TypeORM from scanning outside the app directory
process.env.TYPEORM_ENTITIES_DIR = __dirname + '/../src';
process.env.TYPEORM_MIGRATIONS_DIR = __dirname + '/../src/migrations';

