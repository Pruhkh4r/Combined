# 🚀 Get Started - Banking Message Parser

Welcome! This guide will help you get your Banking Message Parser application up and running in minutes.

## 📋 Prerequisites

Before you begin, ensure you have:
- ✅ Java 17 or higher installed
- ✅ Maven 3.6 or higher installed

### Check Your Installation

```bash
# Check Java
java -version
# Should show: java version "17.x.x" or higher

# Check Maven
mvn -version
# Should show: Apache Maven 3.6.x or higher
```

### Install Missing Tools

**Java (if not installed):**
- Download from: https://www.oracle.com/java/technologies/downloads/
- Or use: `brew install openjdk@17` (macOS)

**Maven (if not installed):**
- macOS: `brew install maven`
- Or download from: https://maven.apache.org/download.cgi

---

## 🎯 Quick Start (3 Steps)

### Step 1: Navigate to Project Directory
```bash
cd /Users/jayant.rajput/Documents/Try2
```

### Step 2: Start the Application
```bash
# Option A: Use the start script (recommended)
./start.sh

# Option B: Manual start
mvn spring-boot:run
```

### Step 3: Verify It's Running
Open your browser and go to:
- **Application**: http://localhost:8080
- **H2 Console**: http://localhost:8080/h2-console

You should see the application running! 🎉

---

## 🧪 Test Your Setup

### Option 1: Use the Test Script (Automated)
```bash
# In a new terminal (keep the app running in the first terminal)
./test-api.sh
```

This will automatically test:
- ✅ User signup
- ✅ User login
- ✅ JWT token generation
- ✅ Protected endpoints
- ✅ Authorization

### Option 2: Manual Testing

#### 1. Create a User
```bash
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"myuser","password":"mypass123"}'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": 1,
  "username": "myuser",
  "role": "USER",
  "message": "User registered successfully"
}
```

#### 2. Save Your Token
Copy the token from the response above. You'll need it for the next steps.

#### 3. Test a Protected Endpoint
```bash
# Replace YOUR_TOKEN with the actual token
curl -X GET http://localhost:8080/user/getHistory/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
[]
```
(Empty array because you haven't added any messages yet)

---

## 🎭 Testing Different Roles

By default, all users are created with the "USER" role. To test MAKER, CHECKER, and ADMIN roles:

### Step 1: Access H2 Console
1. Open: http://localhost:8080/h2-console
2. Enter these credentials:
   - **JDBC URL**: `jdbc:h2:mem:bankingdb`
   - **Username**: `sa`
   - **Password**: (leave empty)
3. Click "Connect"

### Step 2: Create Users for Each Role
```bash
# Create MAKER user
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"maker1","password":"pass123"}'

# Create CHECKER user
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"checker1","password":"pass123"}'

# Create ADMIN user
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"pass123"}'
```

### Step 3: Update Roles in Database
In H2 Console, run these SQL commands:
```sql
-- View current users
SELECT USER_ID, USERNAME, ROLE FROM USER_TABLE;

-- Update roles
UPDATE USER_TABLE SET ROLE = 'MAKER' WHERE USERNAME = 'maker1';
UPDATE USER_TABLE SET ROLE = 'CHECKER' WHERE USERNAME = 'checker1';
UPDATE USER_TABLE SET ROLE = 'ADMIN' WHERE USERNAME = 'admin1';

-- Verify changes
SELECT USER_ID, USERNAME, ROLE FROM USER_TABLE;
```

### Step 4: Login with New Roles
```bash
# Login as MAKER
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"maker1","password":"pass123"}'
# Save the token as MAKER_TOKEN

# Login as CHECKER
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"checker1","password":"pass123"}'
# Save the token as CHECKER_TOKEN

# Login as ADMIN
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"pass123"}'
# Save the token as ADMIN_TOKEN
```

### Step 5: Test Role-Specific Endpoints

#### Test MAKER Endpoints
```bash
# Create a draft pattern
curl -X POST http://localhost:8080/maker/postPatternAndSampleForDraft \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer MAKER_TOKEN" \
  -d '{
    "regexPattern": "Account.*credited.*Rs\\.\\s*(\\d+)",
    "sampleEx": "Account XXXX1234 credited with Rs. 5000"
  }'

# Get drafts
curl -X GET http://localhost:8080/maker/getDrafts \
  -H "Authorization: Bearer MAKER_TOKEN"
```

#### Test CHECKER Endpoints
```bash
# Get pending patterns
curl -X GET http://localhost:8080/checker/getPendings \
  -H "Authorization: Bearer CHECKER_TOKEN"
```

#### Test ADMIN Endpoints
```bash
# Get all users
curl -X GET http://localhost:8080/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 📚 What's Next?

### 1. Explore the API
- Check **API_QUICK_REFERENCE.md** for all available endpoints
- See **API_TESTING_GUIDE.md** for detailed testing examples

### 2. Understand the Architecture
- Read **ARCHITECTURE.md** to understand the system design
- Review **README.md** for complete documentation

### 3. Implement Business Logic
The project structure is ready. Now you can:
- Implement regex parsing logic in `/user/postMsg`
- Add pattern matching functionality
- Enhance validation
- Add more features

### 4. Frontend Integration
Your JWT token includes:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": 1,
  "username": "myuser",
  "role": "USER"
}
```

Use this in your frontend:
```javascript
// After login/signup
localStorage.setItem('token', response.token);
localStorage.setItem('userId', response.userId);
localStorage.setItem('username', response.username);
localStorage.setItem('role', response.role);

// For API calls
fetch('http://localhost:8080/user/getHistory', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 🔧 Common Issues & Solutions

### Issue: Port 8080 already in use
**Solution:** Change the port in `src/main/resources/application.properties`
```properties
server.port=8081
```

### Issue: Maven not found
**Solution:** Install Maven
```bash
brew install maven  # macOS
```

### Issue: Build fails
**Solution:** Clean and rebuild
```bash
mvn clean install -U
```

### Issue: Cannot access H2 Console
**Solution:** 
1. Make sure the application is running
2. Check the URL: http://localhost:8080/h2-console
3. Use JDBC URL: `jdbc:h2:mem:bankingdb`

### Issue: 403 Forbidden on API calls
**Solution:**
1. Make sure you're including the token in the Authorization header
2. Check if the user has the correct role for the endpoint
3. Verify token format: `Bearer <token>`

---

## 📖 Documentation Files

Your project includes comprehensive documentation:

| File | Description |
|------|-------------|
| **GET_STARTED.md** | This file - Quick start guide |
| **README.md** | Complete project documentation |
| **API_QUICK_REFERENCE.md** | Quick API reference card |
| **API_TESTING_GUIDE.md** | Detailed testing guide with examples |
| **ARCHITECTURE.md** | System architecture and diagrams |
| **PROJECT_SUMMARY.md** | Project overview and summary |
| **SETUP_CHECKLIST.md** | Verification checklist |

---

## 🎯 Typical Workflow

Here's how the system works:

1. **User Signs Up** → Gets USER role by default
2. **Admin Changes Role** → User becomes MAKER/CHECKER/ADMIN
3. **Maker Creates Pattern** → Saves as DRAFT or submits as PENDING
4. **Checker Reviews** → Approves or Rejects PENDING patterns
5. **User Posts Message** → Message gets saved (parsing logic to be implemented)
6. **User Adds to History** → Message linked to user
7. **User Views History** → Gets all their messages

---

## 🚀 Quick Commands Reference

```bash
# Start application
./start.sh
# or
mvn spring-boot:run

# Test API
./test-api.sh

# Build project
mvn clean install

# Run tests (when you add them)
mvn test

# Package as JAR
mvn package

# Run JAR
java -jar target/banking-msg-parser-1.0.0.jar
```

---

## 🎉 You're All Set!

Your Banking Message Parser is ready to use. Here's what you have:

✅ Complete Spring Boot application
✅ JWT authentication with userId, username, role
✅ Role-based authorization (USER, MAKER, CHECKER, ADMIN)
✅ All required endpoints implemented
✅ H2 database configured (MySQL ready)
✅ Comprehensive documentation
✅ Testing scripts

**Start the application and begin testing!**

```bash
./start.sh
```

Then in another terminal:
```bash
./test-api.sh
```

---

## 💡 Pro Tips

1. **Use Postman**: Import the API endpoints for easier testing
2. **Check Logs**: Application logs show detailed information
3. **H2 Console**: Great for debugging database issues
4. **Token Expiry**: Default is 24 hours, configurable in application.properties
5. **CORS**: Currently allows all origins, configure for production

---

## 📞 Need Help?

1. Check the documentation files listed above
2. Review the code comments in each file
3. Check application logs for error details
4. Verify your setup with SETUP_CHECKLIST.md

---

**Happy Coding! 🚀**

**Questions? Check README.md or other documentation files.**
