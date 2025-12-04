/**
 * Test Setup - Configure environment for Jest tests
 *
 * This file runs before all tests to ensure proper test environment configuration.
 * It sets NODE_ENV to 'test' which tells Sequelize to use the SQLite in-memory database
 * instead of PostgreSQL.
 */

// Set NODE_ENV to 'test' before any modules are loaded
process.env.NODE_ENV = 'test';

// Increase test timeout for integration tests (default is 5000ms)
jest.setTimeout(30000);
