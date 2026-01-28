# MySQL Quick Start Guide

## 🚀 Quick Setup (5 Steps)

### Step 1: Create Database in MySQL Workbench
```
1. Open MySQL Workbench
2. Click "Create a new schema" (cylinder icon with +)
3. Name: bankingdb
4. Click Apply → Apply → Finish
```

### Step 2: Update Password (if needed)
Edit `src/main/resources/application.properties`:
```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

### Step 3: Install Dependencies
```bash
./mvnw clean install
```

### Step 4: Start Application
```bash
./mvnw spring-boot:run
```

### Step 5: Create Users
Use the signup API:
```bash
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"userA","password":"a123","role":"ADMIN"}'
```

---

## 📋 What Changed?

| Before (H2) | After (MySQL) |
|-------------|---------------|
| In-memory database | Persistent database |
| Data lost on restart | Data persists |
| `ddl-auto=create-drop` | `ddl-auto=update` |
| Auto-loads test data | Manual data creation |
| H2 Console enabled | MySQL Workbench |

---

## ✅ Verification Checklist

- [ ] MySQL server is running (check MySQL Workbench)
- [ ] Database `bankingdb` exists
- [ ] Password configured in `application.properties`
- [ ] Dependencies installed (`mvn clean install`)
- [ ] Application starts without errors
- [ ] Tables created (check MySQL Workbench)
- [ ] Users created (via signup or SQL script)
- [ ] Login works

---

## 🔧 Common Commands

### View Data in MySQL Workbench
```
1. Open MySQL Workbench
2. Connect to localhost
3. Select bankingdb schema
4. Right-click table → "Select Rows"
```

### View Data in Terminal
```bash
# Connect
/usr/local/mysql-8.0.45-macos15-arm64/bin/mysql -u root -p

# View users
USE bankingdb;
SELECT * FROM user_table;
```

### Create Users via API
```bash
# Admin user
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"userA","password":"a123","role":"ADMIN"}'

# Regular user
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"userB","password":"b123","role":"USER"}'
```

### Test Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"userA","password":"a123"}'
```

---

## 🐛 Troubleshooting

| Error | Solution |
|-------|----------|
| "Unknown database 'bankingdb'" | Create database in MySQL Workbench |
| "Access denied" | Update password in application.properties |
| "Communications link failure" | Start MySQL server |
| Tables not created | Check application logs for errors |

---

## 📁 Files Modified

✅ `pom.xml` - Enabled MySQL, disabled H2
✅ `application.properties` - MySQL configuration
❌ `data.sql` - Removed (temporary data loader)
❌ `DataInitializer.java` - Removed (temporary data loader)

---

## 📚 Additional Resources

- **Full Guide**: See `MYSQL_SETUP_GUIDE.md`
- **SQL Script**: Use `init-mysql-data.sql` to insert test users
- **MySQL Workbench**: Visual database management
- **Application Logs**: Check console for connection status

---

## 🎯 Next Steps

1. Follow the 5 steps above
2. Create your initial users
3. Test the application
4. Your data will now persist! 🎉

---

**Need help?** Check `MYSQL_SETUP_GUIDE.md` for detailed instructions.
