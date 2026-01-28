# API Testing Guide

## Quick Start Testing Steps

### Step 1: Start the Application
```bash
mvn spring-boot:run
```

### Step 2: Create Test Users

#### Create a regular USER
```bash
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user1",
    "password": "password123"
  }'
```

Save the token from the response!

#### Create more users for different roles
```bash
# User 2 (will be made MAKER)
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "maker1",
    "password": "password123"
  }'

# User 3 (will be made CHECKER)
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "checker1",
    "password": "password123"
  }'

# User 4 (will be made ADMIN)
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin1",
    "password": "password123"
  }'
```

### Step 3: Change User Roles via H2 Console

1. Open browser: `http://localhost:8080/h2-console`
2. Use these credentials:
   - JDBC URL: `jdbc:h2:mem:bankingdb`
   - Username: `sa`
   - Password: (leave empty)
3. Run these SQL commands:

```sql
-- Check current users
SELECT * FROM USER_TABLE;

-- Update roles (adjust USER_ID based on your data)
UPDATE USER_TABLE SET ROLE = 'MAKER' WHERE USERNAME = 'maker1';
UPDATE USER_TABLE SET ROLE = 'CHECKER' WHERE USERNAME = 'checker1';
UPDATE USER_TABLE SET ROLE = 'ADMIN' WHERE USERNAME = 'admin1';

-- Verify changes
SELECT USER_ID, USERNAME, ROLE FROM USER_TABLE;
```

### Step 4: Login with Different Roles

#### Login as MAKER
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "maker1",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": 2,
  "username": "maker1",
  "role": "MAKER",
  "message": "Login successful"
}
```

Save this token as `MAKER_TOKEN`

#### Login as CHECKER
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "checker1",
    "password": "password123"
  }'
```

Save this token as `CHECKER_TOKEN`

#### Login as ADMIN
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin1",
    "password": "password123"
  }'
```

Save this token as `ADMIN_TOKEN`

### Step 5: Test MAKER Endpoints

Replace `YOUR_MAKER_TOKEN` with the actual token from Step 4.

#### Create a Draft Pattern
```bash
curl -X POST http://localhost:8080/maker/postPatternAndSampleForDraft \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MAKER_TOKEN" \
  -d '{
    "regexPattern": "Account.*credited.*Rs\\.\\s*(\\d+)",
    "sampleEx": "Account XXXX1234 credited with Rs. 5000"
  }'
```

#### Submit Pattern for Approval
```bash
curl -X POST http://localhost:8080/maker/postPatternAndSample \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_MAKER_TOKEN" \
  -d '{
    "regexPattern": "Account.*debited.*Rs\\.\\s*(\\d+)",
    "sampleEx": "Account XXXX1234 debited with Rs. 2000"
  }'
```

#### Get Drafts
```bash
curl -X GET http://localhost:8080/maker/getDrafts \
  -H "Authorization: Bearer YOUR_MAKER_TOKEN"
```

#### Get Rejected Patterns
```bash
curl -X GET http://localhost:8080/maker/getRejected \
  -H "Authorization: Bearer YOUR_MAKER_TOKEN"
```

### Step 6: Test CHECKER Endpoints

Replace `YOUR_CHECKER_TOKEN` with the actual token.

#### Get Pending Patterns
```bash
curl -X GET http://localhost:8080/checker/getPendings \
  -H "Authorization: Bearer YOUR_CHECKER_TOKEN"
```

#### Approve a Pattern
```bash
curl -X POST http://localhost:8080/checker/postPatternAndSample \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CHECKER_TOKEN" \
  -d '{
    "patternId": 2,
    "action": "APPROVED"
  }'
```

#### Reject a Pattern
```bash
curl -X POST http://localhost:8080/checker/postPatternAndSample \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CHECKER_TOKEN" \
  -d '{
    "patternId": 1,
    "action": "REJECTED"
  }'
```

### Step 7: Test USER Endpoints

Any authenticated user can access these endpoints.

#### Post a Message
```bash
curl -X POST http://localhost:8080/user/postMsg \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "msg": "Your account XXXX1234 has been credited with Rs. 5000 on 15-Jan-2024",
    "bankName": "HDFC Bank",
    "accNo": "XXXX1234",
    "amt": 5000.00,
    "typeOfTransaction": "CREDIT",
    "vendor": "Salary",
    "date": "2024-01-15",
    "time": "10:30:00"
  }'
```

#### Add Message to History
```bash
curl -X POST http://localhost:8080/user/addToHistory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": 1,
    "msgId": 1
  }'
```

#### Get User History
```bash
curl -X GET http://localhost:8080/user/getHistory/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Get History from JWT Token
```bash
curl -X GET http://localhost:8080/user/getHistory \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 8: Test ADMIN Endpoints

Replace `YOUR_ADMIN_TOKEN` with the actual token.

#### Get All Users
```bash
curl -X GET http://localhost:8080/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Get User by ID
```bash
curl -X GET http://localhost:8080/admin/users/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

#### Update User Role
```bash
curl -X PUT http://localhost:8080/admin/users/1/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "role": "MAKER"
  }'
```

#### Create User with Specific Role
```bash
curl -X POST http://localhost:8080/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "username": "newmaker",
    "password": "password123",
    "role": "MAKER"
  }'
```

#### Delete User
```bash
curl -X DELETE http://localhost:8080/admin/users/5 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Testing Authorization

### Test Unauthorized Access (Should Fail)

#### Try accessing MAKER endpoint without token
```bash
curl -X GET http://localhost:8080/maker/getDrafts
```
**Expected:** 403 Forbidden

#### Try accessing MAKER endpoint with USER token
```bash
curl -X GET http://localhost:8080/maker/getDrafts \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```
**Expected:** 403 Forbidden

#### Try accessing CHECKER endpoint with MAKER token
```bash
curl -X GET http://localhost:8080/checker/getPendings \
  -H "Authorization: Bearer YOUR_MAKER_TOKEN"
```
**Expected:** 403 Forbidden

## Postman Collection

If you prefer using Postman, import this collection:

### Environment Variables
Create these variables in Postman:
- `base_url`: `http://localhost:8080`
- `user_token`: (set after login)
- `maker_token`: (set after login)
- `checker_token`: (set after login)
- `admin_token`: (set after login)

### Collection Structure
```
Banking Parser API
├── Auth
│   ├── Signup
│   └── Login
├── Maker
│   ├── Get Drafts
│   ├── Get Rejected
│   ├── Get Failed
│   ├── Post Pattern (Pending)
│   └── Post Pattern (Draft)
├── Checker
│   ├── Get Pendings
│   └── Approve/Reject Pattern
├── User
│   ├── Post Message
│   ├── Add to History
│   └── Get History
└── Admin
    ├── Get All Users
    ├── Get User by ID
    ├── Update User Role
    ├── Create User
    └── Delete User
```

## Common Issues

### Issue: 403 Forbidden
**Solution:** Make sure you're using the correct token for the role required by the endpoint.

### Issue: 401 Unauthorized
**Solution:** Check if your token is valid and not expired. Login again to get a new token.

### Issue: Token expired
**Solution:** The default token expiration is 24 hours. Login again to get a new token.

### Issue: Cannot access H2 Console
**Solution:** Make sure the application is running and access `http://localhost:8080/h2-console`

## Database Queries for Testing

```sql
-- View all users and their roles
SELECT USER_ID, USERNAME, ROLE FROM USER_TABLE;

-- View all patterns and their status
SELECT PATTERN_ID, REGEX_PATTERN, STATUS FROM PATTERN_TABLE;

-- View all messages
SELECT MSG_ID, MSG, BANK_NAME, AMT FROM MSG_TABLE;

-- View user-message relationships
SELECT * FROM USER_MSG_RELATION_TABLE;

-- Count patterns by status
SELECT STATUS, COUNT(*) FROM PATTERN_TABLE GROUP BY STATUS;
```

## Next Steps

1. Test all endpoints with different roles
2. Verify authorization is working correctly
3. Check database to see data is being saved
4. Implement the actual regex parsing logic
5. Add more validation and error handling
