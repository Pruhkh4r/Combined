# API Quick Reference Card

## Base URL
```
http://localhost:8080
```

## Authentication Header
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔓 PUBLIC ENDPOINTS

### Signup
```http
POST /auth/signup
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response: { token, userId, username, role: "USER", message }
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}

Response: { token, userId, username, role, message }
```

---

## 👤 USER ENDPOINTS (All authenticated users)

### Post Message
```http
POST /user/postMsg
Authorization: Bearer <token>
Content-Type: application/json

{
  "msg": "string",
  "bankName": "string",
  "accNo": "string",
  "amt": number,
  "typeOfTransaction": "string",
  "trf": "string",
  "vendor": "string",
  "date": "YYYY-MM-DD",
  "time": "HH:MM:SS"
}
```

### Add to History
```http
POST /user/addToHistory
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": number,
  "msgId": number
}
```

### Get History by User ID
```http
GET /user/getHistory/{userId}
Authorization: Bearer <token>
```

### Get History from Token
```http
GET /user/getHistory
Authorization: Bearer <token>
```

---

## 🔨 MAKER ENDPOINTS (MAKER role only)

### Get Drafts
```http
GET /maker/getDrafts
Authorization: Bearer <maker-token>
```

### Get Rejected
```http
GET /maker/getRejected
Authorization: Bearer <maker-token>
```

### Get Failed Messages
```http
GET /maker/getMsgsFailed
Authorization: Bearer <maker-token>
```

### Submit Pattern for Approval
```http
POST /maker/postPatternAndSample
Authorization: Bearer <maker-token>
Content-Type: application/json

{
  "regexPattern": "string",
  "sampleEx": "string"
}

Status will be set to: PENDING
```

### Save Pattern as Draft
```http
POST /maker/postPatternAndSampleForDraft
Authorization: Bearer <maker-token>
Content-Type: application/json

{
  "regexPattern": "string",
  "sampleEx": "string"
}

Status will be set to: DRAFT
```

---

## ✅ CHECKER ENDPOINTS (CHECKER role only)

### Get Pending Patterns
```http
GET /checker/getPendings
Authorization: Bearer <checker-token>
```

### Approve/Reject Pattern
```http
POST /checker/postPatternAndSample
Authorization: Bearer <checker-token>
Content-Type: application/json

{
  "patternId": number,
  "action": "APPROVED" | "REJECTED"
}
```

---

## 👑 ADMIN ENDPOINTS (ADMIN role only)

### Get All Users
```http
GET /admin/users
Authorization: Bearer <admin-token>
```

### Get User by ID
```http
GET /admin/users/{id}
Authorization: Bearer <admin-token>
```

### Update User Role
```http
PUT /admin/users/{id}/role
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "role": "USER" | "MAKER" | "CHECKER" | "ADMIN"
}
```

### Create User with Role
```http
POST /admin/users
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "username": "string",
  "password": "string",
  "role": "USER" | "MAKER" | "CHECKER" | "ADMIN"
}
```

### Delete User
```http
DELETE /admin/users/{id}
Authorization: Bearer <admin-token>
```

---

## 📊 Response Formats

### Success Response (Auth)
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": 1,
  "username": "john_doe",
  "role": "USER",
  "message": "Login successful"
}
```

### Success Response (Pattern)
```json
{
  "patternId": 1,
  "regexPattern": "Account.*credited.*Rs\\.\\s*(\\d+)",
  "sampleEx": "Account XXXX1234 credited with Rs. 5000",
  "status": "PENDING"
}
```

### Success Response (Message)
```json
{
  "msgId": 1,
  "msg": "Your account has been credited",
  "bankName": "HDFC Bank",
  "accNo": "XXXX1234",
  "amt": 5000.00,
  "typeOfTransaction": "CREDIT",
  "trf": null,
  "vendor": "Salary",
  "date": "2024-01-15",
  "time": "10:30:00"
}
```

### Error Response
```json
{
  "message": "Error description"
}
```

---

## 🔑 Role Access Matrix

| Endpoint | USER | MAKER | CHECKER | ADMIN |
|----------|------|-------|---------|-------|
| /auth/** | ✅ | ✅ | ✅ | ✅ |
| /user/** | ✅ | ✅ | ✅ | ✅ |
| /maker/** | ❌ | ✅ | ❌ | ❌ |
| /checker/** | ❌ | ❌ | ✅ | ❌ |
| /admin/** | ❌ | ❌ | ❌ | ✅ |

---

## 🎯 Pattern Status Values

- `DRAFT` - Saved by Maker, not submitted
- `PENDING` - Submitted by Maker, awaiting approval
- `APPROVED` - Approved by Checker
- `REJECTED` - Rejected by Checker
- `FAILED` - Failed during processing

---

## 🔧 H2 Console Access

```
URL: http://localhost:8080/h2-console
JDBC URL: jdbc:h2:mem:bankingdb
Username: sa
Password: (empty)
```

---

## 💡 Quick Tips

1. **Get Token**: Login/Signup returns token in response
2. **Use Token**: Add `Authorization: Bearer <token>` header to all protected requests
3. **Token Expiry**: Default 24 hours, login again if expired
4. **Change Role**: Use H2 console or Admin API to change user roles
5. **Default Role**: All signups create USER role by default

---

## 🚨 Common HTTP Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions (wrong role)
- `404 Not Found` - Resource not found

---

## 📱 Frontend Integration

### Store after login/signup:
```javascript
const response = await login(username, password);
localStorage.setItem('token', response.token);
localStorage.setItem('userId', response.userId);
localStorage.setItem('username', response.username);
localStorage.setItem('role', response.role);
```

### Use in API calls:
```javascript
const token = localStorage.getItem('token');
fetch('http://localhost:8080/user/getHistory', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Check role for UI:
```javascript
const role = localStorage.getItem('role');
if (role === 'MAKER') {
  // Show maker-specific UI
}
```

---

## 🔄 Typical Workflow

1. **User Signup** → Gets USER role
2. **Admin changes role** → User becomes MAKER/CHECKER
3. **Maker creates pattern** → Saves as DRAFT or submits as PENDING
4. **Checker reviews** → Approves or Rejects PENDING patterns
5. **User posts message** → Message gets parsed (future implementation)
6. **User adds to history** → Message linked to user

---

**Print this for quick reference while developing! 📄**
