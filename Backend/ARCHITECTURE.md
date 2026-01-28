# Banking Message Parser - Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  (React/Angular/Vue - sends username, password, receives JWT)   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP Requests (JSON)
                             │ Authorization: Bearer <JWT>
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    SPRING BOOT APPLICATION                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              SECURITY LAYER                             │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │   JwtAuthenticationFilter                     │     │   │
│  │  │   - Extracts JWT from Authorization header    │     │   │
│  │  │   - Validates token                           │     │   │
│  │  │   - Sets SecurityContext                      │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  │  ┌──────────────────────────────────────────────┐     │   │
│  │  │   SecurityConfig                              │     │   │
│  │  │   - Role-based authorization                  │     │   │
│  │  │   - Endpoint access control                   │     │   │
│  │  └──────────────────────────────────────────────┘     │   │
│  └────────────────────────────────────────────────────────┘   │
│                             │                                    │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              CONTROLLER LAYER                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │   │
│  │  │    Auth      │  │    Maker     │  │   Checker   │ │   │
│  │  │  Controller  │  │  Controller  │  │  Controller │ │   │
│  │  │  /auth/**    │  │  /maker/**   │  │ /checker/** │ │   │
│  │  │  (Public)    │  │  (MAKER)     │  │  (CHECKER)  │ │   │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │   │
│  │  ┌──────────────┐  ┌──────────────┐                  │   │
│  │  │    User      │  │    Admin     │                  │   │
│  │  │  Controller  │  │  Controller  │                  │   │
│  │  │  /user/**    │  │  /admin/**   │                  │   │
│  │  │  (All Auth)  │  │  (ADMIN)     │                  │   │
│  │  └──────────────┘  └──────────────┘                  │   │
│  └────────────────────────────────────────────────────────┘   │
│                             │                                    │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              SERVICE LAYER                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │   │
│  │  │    Auth      │  │   Pattern    │  │     Msg     │ │   │
│  │  │   Service    │  │   Service    │  │   Service   │ │   │
│  │  │  - signup    │  │  - getDrafts │  │  - postMsg  │ │   │
│  │  │  - login     │  │  - getPending│  │  - getHist  │ │   │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │   │
│  │  ┌──────────────┐                                      │   │
│  │  │    User      │                                      │   │
│  │  │   Service    │                                      │   │
│  │  │  - getUsers  │                                      │   │
│  │  └──────────────┘                                      │   │
│  └────────────────────────────────────────────────────────┘   │
│                             │                                    │
│  ┌────────────────────────────────────────────────────────┐   │
│  │            REPOSITORY LAYER (JPA)                       │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │   │
│  │  │    User      │  │   Pattern    │  │     Msg     │ │   │
│  │  │  Repository  │  │  Repository  │  │  Repository │ │   │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │   │
│  │  ┌──────────────┐                                      │   │
│  │  │ UserMsgRel   │                                      │   │
│  │  │  Repository  │                                      │   │
│  │  └──────────────┘                                      │   │
│  └────────────────────────────────────────────────────────┘   │
│                             │                                    │
└─────────────────────────────┼────────────────────────────────────┘
                              │
                              │ JPA/Hibernate
                              │
┌─────────────────────────────▼────────────────────────────────────┐
│                      DATABASE (H2/MySQL)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │  USER_TABLE  │  │PATTERN_TABLE │  │     MSG_TABLE       │   │
│  │              │  │              │  │                     │   │
│  │ - user_id    │  │ - pattern_id │  │ - msg_id            │   │
│  │ - username   │  │ - regexPatt  │  │ - msg               │   │
│  │ - password   │  │ - sampleEx   │  │ - bankName          │   │
│  │ - role       │  │ - status     │  │ - accNo, amt, etc.  │   │
│  └──────────────┘  └──────────────┘  └─────────────────────┘   │
│  ┌─────────────────────��────────┐                                │
│  │ USER_MSG_RELATION_TABLE      │                                │
│  │ - id                         │                                │
│  │ - user_id (FK)               │                                │
│  │ - msg_id (FK)                │                                │
│  └──────────────────────────────┘                                │
└───────────────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Flow

```
┌──────────┐                                    ┌──────────────┐
│ Frontend │                                    │   Backend    │
└────┬─────┘                                    └──────┬───────┘
     │                                                  │
     │  1. POST /auth/signup                           │
     │     { username, password }                      │
     ├────────────────────────────────────────────────>│
     │                                                  │
     │                                    2. Hash password (BCrypt)
     │                                    3. Save user with role=USER
     │                                    4. Generate JWT token
     │                                       (includes userId, username, role)
     │                                                  │
     │  5. Response                                    │
     │     { token, userId, username, role }           │
     │<────────────────────────────────────────────────┤
     │                                                  │
     │  6. Store token, userId, username, role         │
     │     in localStorage/state                       │
     │                                                  │
     │  7. Subsequent requests                         │
     │     Authorization: Bearer <token>               │
     ├────────────────────────────────────────────────>│
     │                                                  │
     │                                    8. JwtAuthenticationFilter
     │                                       - Extract token
     │                                       - Validate token
     │                                       - Extract user details
     │                                       - Set SecurityContext
     │                                                  │
     │                                    9. Check role authorization
     │                                       - SecurityConfig
     │                                       - @PreAuthorize
     │                                                  │
     │  10. Response (if authorized)                   │
     │<────────────────────────────────────────────────┤
     │                                                  │
```

## 🔄 Pattern Approval Workflow

```
┌─────────┐         ┌─────────┐         ┌──────────┐
│  MAKER  │         │ CHECKER │         │ DATABASE │
└────┬────┘         └────┬────┘         └────┬─────┘
     │                   │                    │
     │ 1. Create Pattern │                    │
     │   (Save as DRAFT) │                    │
     ├──────────────────────────────────────>│
     │                   │                    │
     │ 2. Edit/Review    │                    │
     │   (Still DRAFT)   │                    │
     ├──────────────────────────────────────>│
     │                   │                    │
     │ 3. Submit for     │                    │
     │    Approval       │                    │
     │    (PENDING)      │                    │
     ├──────────────────────────────────────>│
     │                   │                    │
     │                   │ 4. Get Pendings    │
     │                   ├───────────────────>│
     │                   │                    │
     │                   │ 5. Review Pattern  │
     │                   │                    │
     │                   │ 6. Approve/Reject  │
     │                   │    (APPROVED/      │
     │                   │     REJECTED)      │
     │                   ├───────────────────>│
     │                   │                    │
     │ 7. If REJECTED,   │                    │
     │    view & fix     │                    │
     │<──────────────────────────────────────┤
     │                   │                    │
     │ 8. Resubmit       │                    │
     │    (PENDING)      │                    │
     ├──────────────────────────────────────>│
     │                   │                    │
```

## 📊 Data Flow - User Posts Message

```
┌──────────┐         ┌────────────┐         ┌──────────┐
│   USER   │         │   BACKEND  │         │ DATABASE │
└────┬─────┘         └─────┬──────┘         └────┬─────┘
     │                     │                      │
     │ 1. POST /user/postMsg                     │
     │    { msg, bankName, accNo, amt, ... }     │
     ├────────────────────>│                      │
     │                     │                      │
     │                     │ 2. Validate JWT      │
     │                     │    Extract userId    │
     │                     │                      │
     │                     │ 3. Save message      │
     │                     ├─────────────────────>│
     │                     │                      │
     │                     │ 4. Return msgId      │
     │                     │<─────────────────────┤
     │                     │                      │
     │ 5. Response         │                      │
     │    { msgId, ... }   │                      │
     │<────────────────────┤                      │
     │                     │                      │
     │ 6. POST /user/addToHistory                │
     │    { userId, msgId }│                      │
     ├────────────────────>│                      │
     │                     │                      │
     │                     │ 7. Create relation   │
     │                     ├─────────────────────>│
     │                     │                      │
     │ 8. Success          │                      │
     │<────────────────────┤                      │
     │                     │                      │
     │ 9. GET /user/getHistory                   │
     ├────────────────────>│                      │
     │                     │                      │
     │                     │ 10. Extract userId   │
     │                     │     from JWT         │
     │                     │                      │
     │                     │ 11. Get relations    │
     │                     ├─────────────────────>│
     │                     │                      │
     │                     │ 12. Get messages     │
     │                     ├─────────────────────>│
     │                     │                      │
     │ 13. Response        │                      │
     │     [messages]      │                      │
     │<────────────────────┤                      │
     │                     │                      │
```

## 🎯 Role-Based Access Control

```
┌─────────────────────────────────────────────────────────┐
│                    REQUEST FLOW                          │
└─────────────────────────────────────────────────────────┘

Request with JWT Token
         │
         ▼
┌─────────────────────┐
│ JwtAuthFilter       │
│ - Extract token     │
│ - Validate token    │
│ - Load user details │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ SecurityContext     │
│ - Set Authentication│
│ - User + Authorities│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ SecurityConfig      │
│ - Check endpoint    │
│ - Match role        │
└──────────┬──────────┘
           │
           ├─── /auth/**      → ✅ Allow All
           │
           ├─── /user/**      → ✅ Authenticated
           │
           ├─── /maker/**     → ✅ ROLE_MAKER only
           │
           ├─── /checker/**   → ✅ ROLE_CHECKER only
           │
           └─── /admin/**     → ✅ ROLE_ADMIN only
```

## 🗄️ Database Relationships

```
┌─────────────────┐
│   USER_TABLE    │
│                 │
│ PK: user_id     │
│     username    │
│     password    │
│     role        │
└────────┬────────┘
         │
         │ 1
         │
         │ *
         │
┌────────▼────────────────┐
│ USER_MSG_RELATION_TABLE │
│                         │
│ PK: id                  │
│ FK: user_id             │
│ FK: msg_id              │
└────────┬────────────────┘
         │
         │ *
         │
         │ 1
         │
┌────────▼────────┐
│   MSG_TABLE     │
│                 │
│ PK: msg_id      │
│     msg         │
│     bankName    │
│     accNo       │
│     amt         │
│     ...         │
└─────────────────┘

┌─────────────────┐
│ PATTERN_TABLE   │
│                 │
│ PK: pattern_id  │
│     regexPattern│
│     sampleEx    │
│     status      │
└─────────────────┘
(Independent table)
```

## 🔧 Technology Stack

```
┌─────────────────────────────────────────────┐
│              FRONTEND                        │
│  React/Angular/Vue + Axios/Fetch            │
└─────────────────────────────────────────────┘
                    │
                    │ REST API (JSON)
                    │
┌─────────────────────────────────────────────┐
│           SPRING BOOT 3.2.0                 │
│  ┌───────────────────────────────────────┐ │
│  │ Spring Security + JWT                 │ │
│  │ Spring Web (REST Controllers)         │ │
│  │ Spring Data JPA                       │ │
│  │ Hibernate                             │ │
│  │ Lombok                                │ │
│  │ Validation                            │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
                    │
                    │ JDBC
                    │
┌─────────────────────────────────────────────┐
│         DATABASE                            │
│  H2 (Development)                           │
│  MySQL (Production)                         │
└─────────────────────────────────────────────┘
```

## 📦 Package Structure

```
com.bankingparser
│
├── BankingParserApplication.java (Main)
│
├── config/
│   └── SecurityConfig.java (Security configuration)
│
├── controller/ (REST endpoints)
│   ├── AuthController.java
│   ├── AdminController.java
│   ├── MakerController.java
│   ├── CheckerController.java
│   └── UserController.java
│
├── dto/ (Data Transfer Objects)
│   ├── SignupRequest.java
│   ├── LoginRequest.java
│   └── AuthResponse.java
│
├── model/ (JPA Entities)
│   ├── User.java
│   ├── Pattern.java
│   ├── Msg.java
│   └── UserMsgRelation.java
│
├── repository/ (Data Access Layer)
│   ├── UserRepository.java
│   ├── PatternRepository.java
│   ├── MsgRepository.java
│   └── UserMsgRelationRepository.java
│
├── security/ (Security components)
│   ├── JwtUtil.java
│   ├── JwtAuthenticationFilter.java
│   └── UserDetailServiceImpl.java
│
└── service/ (Business Logic)
    ├── AuthService.java
    ├── UserService.java
    ├── PatternService.java
    └── MsgService.java
```

## 🚀 Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────┐
│                   LOAD BALANCER                      │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
┌───────▼──────┐ ┌────▼──────┐ ┌────▼──────┐
│ Spring Boot  │ │Spring Boot│ │Spring Boot│
│  Instance 1  │ │Instance 2 │ │Instance 3 │
└───────┬──────┘ └────┬──────┘ └────┬──────┘
        │              │              │
        └──────────────┼──────────────┘
                       │
              ┌────────▼────────┐
              │  MySQL Database │
              │   (Master)      │
              └────────┬────────┘
                       │
              ┌────────▼────────┐
              │  MySQL Database │
              │   (Replica)     │
              └─────────────────┘
```

---

**This architecture is designed to be scalable, secure, and maintainable! 🏗️**
