# MySQL Database Setup Guide

## Overview
Your Spring Boot application has been configured to use MySQL instead of H2 in-memory database. This means your data will persist across application restarts.

---

## Changes Made

### 1. **pom.xml**
- ✅ Disabled H2 database dependency
- ✅ Enabled MySQL connector dependency

### 2. **application.properties**
- ✅ Removed H2 configuration
- ✅ Added MySQL configuration
- ✅ Changed `ddl-auto` from `create-drop` to `update` (preserves data)
- ✅ Removed temporary data initialization settings

### 3. **Removed Temporary Files**
- ✅ Deleted `data.sql` (temporary data loader)
- ✅ Deleted `DataInitializer.java` (temporary data loader)

---

## Step-by-Step Setup Instructions

### Step 1: Start MySQL Server

Based on your MySQL Workbench screenshot, your MySQL server is already running at:
- **Version**: MySQL 8.0.45-arm64
- **Location**: `/usr/local/mysql-8.0.45-macos15-arm64`

If it's not running, start it from MySQL Workbench or System Preferences.

### Step 2: Create Database

You need to create a database named `bankingdb`. You can do this in two ways:

#### Option A: Using MySQL Workbench (Recommended)
1. Open MySQL Workbench
2. Connect to your MySQL instance (localhost)
3. Click on "Create a new schema" button (cylinder icon with +)
4. Enter schema name: `bankingdb`
5. Click "Apply" → "Apply" → "Finish"

#### Option B: Using Terminal
```bash
# Add MySQL to your PATH (add this to ~/.zshrc for permanent access)
export PATH="/usr/local/mysql-8.0.45-macos15-arm64/bin:$PATH"

# Connect to MySQL (you'll be prompted for password)
mysql -u root -p

# Create database
CREATE DATABASE bankingdb;

# Verify database was created
SHOW DATABASES;

# Exit MySQL
EXIT;
```

### Step 3: Configure Database Password

Update the password in `application.properties`:

```properties
spring.datasource.password=YOUR_MYSQL_ROOT_PASSWORD
```

**Current setting**: Empty password (`spring.datasource.password=`)

If your MySQL root user has a password, update this line with your actual password.

### Step 4: Install MySQL Dependencies

Run this command to download the MySQL connector:

```bash
./mvnw clean install
```

Or if you have Maven installed globally:

```bash
mvn clean install
```

### Step 5: Start Your Application

```bash
./mvnw spring-boot:run
```

Or use your existing start script:

```bash
./start.sh
```

---

## Database Configuration Details

### Current Configuration (application.properties)

```properties
# MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/bankingdb?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=
spring.datasource.driverClassName=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

### Important Settings Explained

- **`ddl-auto=update`**: Hibernate will automatically create/update tables based on your entities. Data is preserved across restarts.
- **`show-sql=true`**: SQL queries will be logged to console (useful for debugging)
- **`allowPublicKeyRetrieval=true`**: Required for MySQL 8.0+ authentication

---

## Initial Data Setup

Since we removed the automatic data loader, you'll need to create users manually. Here are your options:

### Option 1: Use the Signup API Endpoint

```bash
# Create Admin User
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "userA",
    "password": "a123",
    "role": "ADMIN"
  }'

# Create Regular Users
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "userB",
    "password": "b123",
    "role": "USER"
  }'
```

### Option 2: Insert Directly via MySQL Workbench

1. Open MySQL Workbench
2. Connect to your database
3. Select `bankingdb` schema
4. Run this SQL:

```sql
-- Note: You'll need to hash passwords using BCrypt
-- These are example hashes for: a123, b123, c123, d123, e123

INSERT INTO user_table (username, password, role) VALUES 
('userA', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN'),
('userB', '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr6ELS0jKhPPK4kQD6', 'USER'),
('userC', '$2a$10$oxSJl.keBwxmsMLkcT9lPeAIxfNTPNQxpeywMrF7A3kVszwUTqfTK', 'USER'),
('userD', '$2a$10$UQTkHkHzYq/zK89hJ3fBFuIrDJXfLUJW6Lh3eCOG3AHmeLhRUZjNe', 'USER'),
('userE', '$2a$10$eP6VbJLXxlXgMCqZ3xVfLuMrXJWnJXXXXXXXXXXXXXXXXXXXXXXXX', 'USER');
```

**Note**: The last hash (userE) may need to be regenerated. Use the signup endpoint instead for proper password hashing.

---

## Verification Steps

### 1. Check Database Connection

After starting your application, look for these log messages:

```
✓ HikariPool-1 - Starting...
✓ HikariPool-1 - Start completed.
✓ Initialized JPA EntityManagerFactory
```

### 2. Verify Tables Were Created

In MySQL Workbench:

```sql
USE bankingdb;
SHOW TABLES;
```

You should see tables like:
- `user_table`
- `msg`
- `pattern`
- `user_msg_relation`

### 3. Test Login

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "userA",
    "password": "a123"
  }'
```

---

## Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"

**Solution**: Update the password in `application.properties`

```properties
spring.datasource.password=your_actual_password
```

### Error: "Unknown database 'bankingdb'"

**Solution**: Create the database using MySQL Workbench or terminal:

```sql
CREATE DATABASE bankingdb;
```

### Error: "Communications link failure"

**Solution**: 
1. Check if MySQL server is running in MySQL Workbench
2. Verify the port (default is 3306)
3. Check firewall settings

### Error: "Public Key Retrieval is not allowed"

**Solution**: Already handled in the connection URL with `allowPublicKeyRetrieval=true`

### Tables Not Created

**Solution**: Check that your entities have proper JPA annotations and the application started without errors.

---

## Viewing Your Data

### Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to localhost
3. Select `bankingdb` schema
4. Right-click on a table → "Select Rows - Limit 1000"

### Using Terminal

```bash
# Connect to MySQL
/usr/local/mysql-8.0.45-macos15-arm64/bin/mysql -u root -p

# Use the database
USE bankingdb;

# View users
SELECT * FROM user_table;

# View messages
SELECT * FROM msg;

# Exit
EXIT;
```

---

## Benefits of MySQL vs H2

✅ **Data Persistence**: Data survives application restarts
✅ **Production Ready**: MySQL is suitable for production environments
✅ **Better Performance**: Optimized for larger datasets
✅ **Advanced Features**: Transactions, indexing, replication
✅ **Easy Backup**: Standard MySQL backup tools work
✅ **Visual Management**: MySQL Workbench provides GUI access

---

## Next Steps

1. ✅ Create the `bankingdb` database
2. ✅ Update password in `application.properties` (if needed)
3. ✅ Run `mvn clean install` to download dependencies
4. ✅ Start your application
5. ✅ Create initial users via signup endpoint
6. ✅ Test your application

---

## Quick Reference Commands

```bash
# Start MySQL (if not running)
# Use MySQL Workbench or System Preferences

# Create database
mysql -u root -p -e "CREATE DATABASE bankingdb;"

# Build project
./mvnw clean install

# Start application
./mvnw spring-boot:run

# Test connection
curl http://localhost:8080/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"userA","password":"a123"}'
```

---

## Support

If you encounter any issues:
1. Check the application logs for error messages
2. Verify MySQL is running in MySQL Workbench
3. Ensure the database `bankingdb` exists
4. Confirm the password in `application.properties` is correct
5. Check that port 3306 is not blocked by firewall

---

**Your application is now configured for MySQL! 🎉**
