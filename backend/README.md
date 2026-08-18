# SIH Inspection Platform — Spring Boot Backend

## Overview

This is the primary backend service for the SIH Institute Inspection Platform. It is built with **Spring Boot 4.0.7** and serves as the application layer between the React frontend and the PostgreSQL database.

The existing **Python/FastAPI scanner service** (in the parent directory) is a separate, specialized service responsible for real-time network/IP scanning and laptop metrics collection. **It operates independently and must not be modified.**

### Architecture

```
React Frontend (future)
        ↓  HTTP REST
Spring Boot Backend  ←→  PostgreSQL 18
        ↓  HTTP REST
FastAPI Scanner Service (server.py — port 8000)
        ↑  WebSocket
Client Agents (client.py — runs on remote PCs)
```

---

## Technology Stack

| Component | Version |
|-----------|---------|
| Java | OpenJDK 21+ (tested on 25.0.4) |
| Spring Boot | 4.0.7 |
| Maven | 3.9.16 (via `./mvnw` wrapper) |
| PostgreSQL | 18.4 |
| Flyway | Managed by Spring Boot 4.0.7 |
| Spring Security | 6.x (bundled with Boot 4.0.7) |

---

## Prerequisites

1. **Java 21+** — verify with `java -version`
2. **PostgreSQL 18** running on `localhost:5432`
3. A PostgreSQL database and user created (see [Database Setup](#database-setup))

---

## Database Setup

Run these commands as a PostgreSQL superuser:

```sql
CREATE USER sih_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE sih_inspection OWNER sih_user;
GRANT ALL PRIVILEGES ON DATABASE sih_inspection TO sih_user;
```

---

## Configuration

All sensitive configuration is injected via **environment variables**. Never hardcode credentials.

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DB_URL` | PostgreSQL JDBC URL | Yes | `jdbc:postgresql://localhost:5432/sih_inspection` |
| `DB_USERNAME` | Database username | Yes | `sih_user` |
| `DB_PASSWORD` | Database password | **Yes — no default** | — |
| `SERVER_PORT` | HTTP server port | No | `8080` |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | No | — |
| `JWT_SECRET` | JWT signing key (future) | Future task | — |

### Local Development

For local development, activate the `local` profile:

```bash
cp src/main/resources/application-local.yml.example \
   src/main/resources/application-local.yml
# Edit application-local.yml with your local DB credentials
```

Then run with:

```bash
SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run
```

The `application-local.yml` file is **git-ignored** to prevent accidental credential commits.

---

## Running the Backend

### Option 1: With environment variables (recommended)

```bash
export DB_URL=jdbc:postgresql://localhost:5432/sih_inspection
export DB_USERNAME=sih_user
export DB_PASSWORD=your_password
./mvnw spring-boot:run
```

### Option 2: With local profile

```bash
# After setting up application-local.yml
SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run
```

The backend starts on **port 8080** by default.

---

## Maven Commands

```bash
# Build (compile, test, package)
./mvnw clean package

# Run tests only
./mvnw test

# Run integration tests
./mvnw verify

# Run the application
./mvnw spring-boot:run

# Skip tests (for CI builds)
./mvnw clean package -DskipTests
```

---

## Health Check

Once running, verify the backend is healthy:

```bash
curl http://localhost:8080/actuator/health
# Expected: {"status":"UP"}
```

Only `/actuator/health` and `/actuator/info` are exposed publicly. All other actuator endpoints require authentication.

---

## Package Structure

```
com.sih.inspection
├── InspectionApplication.java      # Spring Boot entry point
├── config/                         # App-wide configuration beans
├── security/
│   └── SecurityConfig.java         # Spring Security filter chain
├── auth/                           # Future: JWT, login, refresh
├── user/                           # Future: User entity, CRUD, roles
├── institute/                      # Future: Institute management
├── inspector/                      # Future: Inspector assignment
├── authorization/                  # Future: Role-based authorization
├── exception/
│   ├── GlobalExceptionHandler.java # @RestControllerAdvice
│   └── ApiError.java               # Structured error response
└── common/
    └── ApiResponse.java            # Generic success response wrapper
```

---

## Database Migrations (Flyway)

Flyway manages the database schema. Migrations live in:

```
src/main/resources/db/migration/
└── V1__init_schema.sql    # Baseline — schema_info table
```

Migrations run automatically on application startup. Naming convention: `V{version}__{description}.sql`.

---

## Security Model (Current Foundation State)

- All endpoints require authentication **except** `/actuator/health` and `/actuator/info`
- **HTTP Basic** is active temporarily during this foundation phase — Spring Boot auto-generates a random password on startup (printed to logs)
- Sessions are **STATELESS** — prepared for JWT token auth in the next task
- CSRF protection is disabled (REST API, token-based design)

**Next task:** Replace HTTP Basic with JWT Bearer token authentication.

---

## Relationship with the Python Scanner

The Python scanner (`server.py`) is a **separate service**:

- Runs on port **8000**
- Accepts WebSocket connections from `client.py` agents
- Exposes `GET /clients` — returns real-time CPU/RAM data
- Has its own static dashboard at `dashboard/index.html`

The Spring Boot backend will integrate with the scanner via **HTTP REST calls** in a future task (Spring `RestClient` / `WebClient`). The scanner API is **not modified** by this backend.

---

## Running the Python Scanner (for reference)

```bash
# Install dependencies (from repo root)
pip install -r requirements.txt

# Start the scanner server
uvicorn server:app --host 0.0.0.0 --port 8000

# Open the dashboard
# Open dashboard/index.html in your browser
```

---

## Recommended Next Tasks

1. **JWT Authentication** — `/auth/login`, `/auth/refresh`, `User` entity, BCrypt
2. **User & Role Management** — CRUD, Spring Security integration
3. **Institute Management** — Institute entity, inspector assignment
4. **Scanner Integration** — Spring Boot HTTP client → `GET http://scanner:8000/clients`
5. **React Frontend** — Connect to this backend's REST APIs
