# Banking Message Parser - Spring Boot Application

A Spring Boot application for parsing banking messages using regex patterns with role-based access control.

## Features

- **Role-Based Access Control**: ADMIN, MAKER, CHECKER, and USER roles
- **JWT Authentication**: Secure token-based authentication
- **H2 Database**: In-memory database (easily switchable to MySQL)
- **RESTful APIs**: Well-structured REST endpoints

## Database Schema

### Tables
1. **User_Table**: Stores user information (userId, username, password, role)
2. **Pattern_Table**: Stores regex patterns (patternId, regexPattern, sampleEx, status)
3. **Msg_Table**: Stores banking messages (msgId, msg, bankName, accNo, amt, etc.)
4. **UserMsgRelation_Table**: Links users to their message history (id, userId, msgId)

## Roles and Permissions

### ADMIN
- Access to `/admin/**` routes
- Full system access

### MAKER
- Access to `/maker/**` routes
- Can create, view, and manage draft patterns
- Endpoints:
  - `GET /maker/getDrafts` - Get all draft patterns
  - `GET /maker/getRejected` - Get rejected patterns
  - `GET /maker/getMsgsFailed` - Get failed patterns
  - `POST /maker/postPatternAndSample` - Submit pattern for approval (status: PENDING)
  - `POST /maker/postPatternAndSampleForDraft` - Save pattern as draft (status: DRAFT)

### CHECKER
- Access to `/checker/**` routes
- Can approve or reject patterns
- Endpoints:
  - `GET /checker/getPendings` - Get all pending patterns
  - `POST /checker/postPatternAndSample` - Approve/Reject pattern

### USER
- Access to `/user/**` routes (accessible by all authenticated users)
- Can post messages and manage history
- Endpoints:
  - `POST /user/postMsg` - Post a banking message
  - `POST /user/addToHistory` - Add message to history
  - `GET /user/getHistory/{userId}` - Get user's message history
  - `GET /user/getHistory` - Get history using JWT token

## API Endpoints

### Authentication (Public)

#### Signup
```http
POST /auth/signup
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "username": "john_doe",
  "role": "USER",
  "message": "User registered successfully"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "username": "john_doe",
  "role": "USER",
  "message": "Login successful"
}
```

### Maker Routes (Requires MAKER role)

All requests must include JWT token in header:
```
Authorization: Bearer <your-jwt-token>
```

#### Get Drafts
```http
GET /maker/getDrafts
```

#### Get Rejected Patterns
```http
GET /maker/getRejected
```

#### Get Failed Messages
```http
GET /maker/getMsgsFailed
```

#### Submit Pattern for Approval
```http
POST /maker/postPatternAndSample
Content-Type: application/json

{
  "regexPattern": "^Account.*credited.*",
  "sampleEx": "Account XXXX1234 credited with Rs. 5000"
}
```

#### Save Pattern as Draft
```http
POST /maker/postPatternAndSampleForDraft
Content-Type: application/json

{
  "regexPattern": "^Account.*debited.*",
  "sampleEx": "Account XXXX1234 debited with Rs. 2000"
}
```

### Checker Routes (Requires CHECKER role)

#### Get Pending Patterns
```http
GET /checker/getPendings
```

#### Approve/Reject Pattern
```http
POST /checker/postPatternAndSample
Content-Type: application/json

{
  "patternId": 1,
  "action": "APPROVED"
}
// or
{
  "patternId": 2,
  "action": "REJECTED"
}
```

### User Routes (Accessible by all authenticated users)

#### Post Message
```http
POST /user/postMsg
Content-Type: application/json

{
  "msg": "Your account XXXX1234 has been credited with Rs. 5000",
  "bankName": "HDFC Bank",
  "accNo": "XXXX1234",
  "amt": 5000.00,
  "typeOfTransaction": "CREDIT",
  "vendor": "Salary",
  "date": "2024-01-15",
  "time": "10:30:00"
}
```

#### Add to History
```http
POST /user/addToHistory
Content-Type: application/json

{
  "userId": 1,
  "msgId": 1
}
```

#### Get History
```http
GET /user/getHistory/1
// or using JWT token
GET /user/getHistory
```

## JWT Token Structure

The JWT token contains:
- **userId**: User's unique identifier
- **username**: User's username
- **role**: User's role (USER, MAKER, CHECKER, ADMIN)

You can extract these values from the token on the frontend.

## Running the Application

### Prerequisites
- Java 17 or higher
- Maven

### Steps

1. **Build the project**
```bash
mvn clean install
```

2. **Run the application**
```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

3. **Access H2 Console** (for development)
```
URL: http://localhost:8080/h2-console
JDBC URL: jdbc:h2:mem:bankingdb
Username: sa
Password: (leave empty)
```

## Switching to MySQL

To switch from H2 to MySQL:

1. **Uncomment MySQL dependency in pom.xml**
```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

2. **Update application.properties**
```properties
# Comment out H2 configuration
# Uncomment MySQL configuration
spring.datasource.url=jdbc:mysql://localhost:3306/bankingdb?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.datasource.driverClassName=com.mysql.cj.jdbc.Driver
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
```

3. **Create MySQL database**
```sql
CREATE DATABASE bankingdb;
```

## Pattern Status Flow

1. **DRAFT** - Created by Maker, saved as draft
2. **PENDING** - Submitted by Maker for approval
3. **APPROVED** - Approved by Checker
4. **REJECTED** - Rejected by Checker
5. **FAILED** - Pattern failed during processing

## Testing with Postman/cURL

### Create a User
```bash
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### Access Protected Route
```bash
curl -X GET http://localhost:8080/user/getHistory/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Changing User Roles

By default, all users are created with the "USER" role. To test MAKER, CHECKER, or ADMIN roles:

1. Access H2 Console
2. Run SQL to update user role:
```sql
UPDATE USER_TABLE SET ROLE = 'MAKER' WHERE USER_ID = 1;
UPDATE USER_TABLE SET ROLE = 'CHECKER' WHERE USER_ID = 2;
UPDATE USER_TABLE SET ROLE = 'ADMIN' WHERE USER_ID = 3;
```

## Project Structure

```
src/main/java/com/bankingparser/
├── BankingParserApplication.java
├── config/
│   └── SecurityConfig.java
├── controller/
│   ├── AuthController.java
│   ├── CheckerController.java
│   ├── MakerController.java
│   └── UserController.java
├── dto/
│   ├── AuthResponse.java
│   ├── LoginRequest.java
│   └── SignupRequest.java
├── model/
│   ├── Msg.java
│   ├── Pattern.java
│   ├── User.java
│   └── UserMsgRelation.java
├── repository/
│   ├── MsgRepository.java
│   ├── PatternRepository.java
│   ├── UserMsgRelationRepository.java
│   └── UserRepository.java
├── security/
│   ├── JwtAuthenticationFilter.java
│   ├── JwtUtil.java
│   └── UserDetailServiceImpl.java
└── service/
    ├── AuthService.java
    ├── MsgService.java
    ├── PatternService.java
    └── UserService.java
```

## Next Steps

- Implement actual regex parsing logic in `/user/postMsg` endpoint
- Add validation for regex patterns
- Implement pattern matching against messages
- Add more detailed error handling
- Add unit and integration tests
- Implement pagination for list endpoints
- Add logging and monitoring

## Security Notes

- Change the JWT secret in `application.properties` for production
- Use HTTPS in production
- Implement rate limiting
- Add input validation and sanitization
- Consider implementing refresh tokens
