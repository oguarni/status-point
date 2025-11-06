# Test Credentials and API Testing Guide

## System Status ✅

All systems are operational and tested:
- ✅ PostgreSQL database running and configured
- ✅ Backend API server running on http://localhost:3001
- ✅ Database migrations completed successfully
- ✅ User registration working
- ✅ User login working
- ✅ Authentication validation working

## Test Users

The following test users have been created and verified:

### User 1: Test User
- **Name**: Test User 1
- **Email**: testuser1@example.com
- **Password**: Password123
- **User ID**: 1
- **Status**: ✅ Active and verified

### User 2: Alice Johnson
- **Name**: Alice Johnson
- **Email**: alice.johnson@example.com
- **Password**: AlicePass2024
- **User ID**: 2
- **Status**: ✅ Active and verified

### User 3: Bob Smith
- **Name**: Bob Smith
- **Email**: bob.smith@example.com
- **Password**: BobSecure2024
- **User ID**: 3
- **Status**: ✅ Active and verified

## API Testing Commands

### Register a New User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Name",
    "email": "your.email@example.com",
    "password": "YourPassword123"
  }'
```

**Expected Response** (Success - 201):
```json
{
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Your Name",
      "email": "your.email@example.com"
    }
  }
}
```

### Login with Existing User

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser1@example.com",
    "password": "Password123"
  }'
```

**Expected Response** (Success - 200):
```json
{
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Test User 1",
      "email": "testuser1@example.com"
    }
  }
}
```

### Test Failed Login (Wrong Password)

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser1@example.com",
    "password": "WrongPassword"
  }'
```

**Expected Response** (Error - 401):
```json
{
  "error": "InvalidPasswordError",
  "message": "Invalid email or password",
  "status": 401
}
```

### Create a Task (Protected Route)

First, login to get a token, then use it to create a task:

```bash
# 1. Login and save the token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testuser1@example.com", "password": "Password123"}' \
  | grep -o '"token":"[^"]*' | sed 's/"token":"//')

# 2. Create a task using the token
curl -X POST http://localhost:3001/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "My First Task",
    "description": "This is a test task",
    "priority": "high"
  }'
```

### Get All Tasks

```bash
curl -X GET http://localhost:3001/api/tasks \
  -H "Authorization: Bearer $TOKEN"
```

## Database Verification

To verify users directly in the database:

```bash
psql -h 127.0.0.1 -U postgres -d task_management_dev -c "SELECT id, name, email, created_at FROM \"Users\" ORDER BY id;"
```

## Starting the Application

### Backend Server

```bash
cd /home/user/status-point/backend
npm run dev
```

The server will start on http://localhost:3001

### Frontend (if needed)

```bash
cd /home/user/status-point/frontend
npm install  # if not already done
npm run dev
```

The frontend will start on http://localhost:3000

## Environment Configuration

The backend is configured with the following settings (from `.env`):

```
PORT=3001
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=task_management_dev
JWT_SECRET=your-secret-key-change-in-production
```

## Testing Summary

All tests passed successfully:

1. ✅ **User Registration**: 3 users created successfully
2. ✅ **User Login**: All 3 users can log in with correct credentials
3. ✅ **Authentication Validation**: Wrong password correctly rejected with 401 error
4. ✅ **Database Persistence**: All users stored in PostgreSQL database
5. ✅ **JWT Token Generation**: Tokens generated for authenticated sessions

## Quick Test Script

Save this as `test-auth.sh` for quick testing:

```bash
#!/bin/bash

echo "Testing User Registration..."
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "New User", "email": "newuser@test.com", "password": "TestPass123"}'

echo -e "\n\nTesting User Login..."
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testuser1@example.com", "password": "Password123"}'

echo -e "\n\nTesting Failed Login..."
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "testuser1@example.com", "password": "WrongPassword"}'
```

## Notes

- All passwords are hashed using bcrypt before storage
- JWT tokens expire after 7 days by default
- The API uses proper HTTP status codes (200, 201, 401, 500, etc.)
- CORS is enabled for frontend integration
- Database uses PostgreSQL 16

## Troubleshooting

### PostgreSQL Not Running

```bash
runuser -u claude -- /usr/lib/postgresql/16/bin/pg_ctl -D /var/lib/postgresql/16/main start -l /tmp/postgresql.log
```

### Check Backend Logs

The backend server logs will show in the terminal where you ran `npm run dev`

### Reset Database

```bash
npm run db:migrate:undo:all
npm run db:migrate
```

---

**Date Created**: 2025-11-06
**Last Tested**: 2025-11-06
**Status**: All systems operational ✅
