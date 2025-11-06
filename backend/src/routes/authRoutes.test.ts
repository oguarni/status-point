import request from 'supertest';
import express, { Application } from 'express';
import bcrypt from 'bcryptjs';
import { createTestDatabase } from '../tests/test-setup';
import authRoutes from './authRoutes';
import errorHandler from '../middlewares/errorHandler';

// Mock the models module to use test database
const testDb = createTestDatabase();
jest.mock('../models', () => ({
  sequelize: testDb.sequelize,
  User: testDb.User,
  Task: testDb.Task,
}));

describe('Authentication Endpoints', () => {
  let app: Application;
  let sequelize: any;
  let User: any;

  beforeAll(() => {
    // Set up test app
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
    app.use(errorHandler);

    // Get test database instances
    sequelize = testDb.sequelize;
    User = testDb.User;
  });
  // Test user data
  const testUsers = [
    {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'SecurePass123!',
    },
    {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      password: 'AnotherPass456!',
    },
    {
      name: 'Bob Johnson',
      email: 'bob.johnson@example.com',
      password: 'TestPassword789!',
    },
  ];

  // Clear database before each test
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  // Close database connection after all tests
  afterAll(async () => {
    await sequelize.close();
  });

  describe('POST /api/auth/register', () => {
    it('should successfully register a new user', async () => {
      const userData = testUsers[0];

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toMatchObject({
        name: userData.name,
        email: userData.email,
      });
      expect(response.body.data.user.id).toBeDefined();

      // Verify user was actually created in database
      const user = await User.findOne({ where: { email: userData.email } });
      expect(user).toBeTruthy();
      expect(user?.name).toBe(userData.name);
      expect(user?.email).toBe(userData.email);

      // Verify password was hashed
      const isPasswordValid = await bcrypt.compare(userData.password, user!.password_hash);
      expect(isPasswordValid).toBe(true);
    });

    it('should register multiple users successfully', async () => {
      for (const userData of testUsers) {
        const response = await request(app)
          .post('/api/auth/register')
          .send(userData);

        expect(response.status).toBe(201);
        expect(response.body.data.user.email).toBe(userData.email);
      }

      // Verify all users were created
      const userCount = await User.count();
      expect(userCount).toBe(testUsers.length);
    });

    it('should return 409 if email already exists', async () => {
      const userData = testUsers[0];

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(409); // Conflict - UserAlreadyExistsError
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('UserAlreadyExistsError');
    });

    it('should validate required fields', async () => {
      const invalidData = [
        { name: '', email: 'test@example.com', password: 'password' },
        { name: 'Test', email: '', password: 'password' },
        { name: 'Test', email: 'test@example.com', password: '' },
        { name: 'Test', email: 'invalid-email', password: 'password' },
        { name: 'Test', email: 'test@example.com', password: '12345' }, // Too short
      ];

      for (const data of invalidData) {
        const response = await request(app)
          .post('/api/auth/register')
          .send(data);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
        expect(Array.isArray(response.body.errors)).toBe(true);
      }
    });

    it('should handle missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toHaveLength(3); // name, email, password
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create test users for login tests
      for (const userData of testUsers) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await User.create({
          name: userData.name,
          email: userData.email,
          password_hash: hashedPassword,
        });
      }
    });

    it('should successfully login with valid credentials', async () => {
      const loginData = {
        email: testUsers[0].email,
        password: testUsers[0].password,
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toMatchObject({
        name: testUsers[0].name,
        email: testUsers[0].email,
      });
    });

    it('should login different users with their respective credentials', async () => {
      for (const userData of testUsers) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: userData.email,
            password: userData.password,
          });

        expect(response.status).toBe(200);
        expect(response.body.data.user.email).toBe(userData.email);
        expect(response.body.data.user.name).toBe(userData.name);
      }
    });

    it('should return 404 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(404); // UserNotFoundError
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('UserNotFoundError');
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers[0].email,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401); // InvalidPasswordError
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('InvalidPasswordError');
    });

    it('should validate required fields', async () => {
      const invalidData = [
        { email: '', password: 'password' },
        { email: 'test@example.com', password: '' },
        { email: 'invalid-email', password: 'password' },
      ];

      for (const data of invalidData) {
        const response = await request(app)
          .post('/api/auth/login')
          .send(data);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('errors');
        expect(Array.isArray(response.body.errors)).toBe(true);
      }
    });

    it('should handle missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toHaveLength(2); // email, password
    });
  });

  describe('JWT Token Validation', () => {
    it('should generate valid JWT tokens on registration', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUsers[0]);

      const token = response.body.data.token;
      expect(token).toBeTruthy();

      // Token should be a valid JWT format
      const tokenParts = token.split('.');
      expect(tokenParts).toHaveLength(3);
    });

    it('should generate valid JWT tokens on login', async () => {
      // Create user first
      const hashedPassword = await bcrypt.hash(testUsers[0].password, 10);
      await User.create({
        name: testUsers[0].name,
        email: testUsers[0].email,
        password_hash: hashedPassword,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUsers[0].email,
          password: testUsers[0].password,
        });

      const token = response.body.data.token;
      expect(token).toBeTruthy();

      // Token should be a valid JWT format
      const tokenParts = token.split('.');
      expect(tokenParts).toHaveLength(3);
    });

    it('should generate different tokens for different users', async () => {
      const tokens: string[] = [];

      for (const userData of testUsers) {
        const response = await request(app)
          .post('/api/auth/register')
          .send(userData);

        tokens.push(response.body.data.token);
      }

      // All tokens should be unique
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(tokens.length);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Close database connection to simulate error
      await sequelize.close();

      const response = await request(app)
        .post('/api/auth/register')
        .send(testUsers[0]);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');

      // Reconnect for cleanup
      await sequelize.authenticate();
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent registrations', async () => {
      const promises = testUsers.map((userData, index) =>
        request(app)
          .post('/api/auth/register')
          .send({
            ...userData,
            email: `concurrent${index}@example.com`, // Unique emails
          })
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('token');
      });
    });

    it('should handle concurrent logins', async () => {
      // Create users first
      for (const userData of testUsers) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        await User.create({
          name: userData.name,
          email: userData.email,
          password_hash: hashedPassword,
        });
      }

      const promises = testUsers.map(userData =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: userData.email,
            password: userData.password,
          })
      );

      const responses = await Promise.all(promises);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('token');
      });
    });
  });
});