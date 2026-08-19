# SIH Institute Inspection Platform — Backend Specification & Architecture Guide

---

## 1. System Overview (Simple & Technical Explanations)

### Simple Explanation (In Plain English)
The **SIH Institute Inspection Platform** is a government-grade digital inspection system designed to monitor and evaluate educational institutes (engineering colleges, polytechnics, universities). 

Instead of traditional, slow paper inspections, this system automates the entire process:
1. **Institutes** register and request official inspections.
2. **System Administrators** assign qualified government **Inspectors** to oversee specific colleges (ensuring an institute has at most one active inspector at a time).
3. **Inspectors** verify the institute's readiness and start the inspection process.
4. **External AI/ML Services** analyze computer network connectivity, infrastructure quality, and campus waste/garbage detection, then submit a single combined evaluation result directly to the backend.
5. The backend validates the results, computes final scores, enforces strict security, and produces immutable audit records for official reporting.

---

### Technical Explanation (For Engineers & Architects)
The backend is an enterprise **Spring Boot 4.0.7 / Java 21** RESTful API application backed by **PostgreSQL 18.4**. It implements a layered, domain-driven architecture with strict transactional boundaries, stateless authentication using **JSON Web Tokens (JJWT 0.12.6)**, method-level role authorization (`@PreAuthorize`), and native PostgreSQL **JSONB** persistence for unstructured Machine Learning evaluation outputs.

```
+─────────────────────────────────────────────────────────────────────────────+
|                               PRESENTATION TIER                             |
|    React Frontend (frontend_demo)          External ML Service (Machine)    |
+──────────────────────────────────────┬──────────────────────────────────────+
                                       │ HTTP / REST (JWT Bearer Token)
+──────────────────────────────────────▼──────────────────────────────────────+
|                                SECURITY TIER                                |
|  CorsFilter ──► SecurityFilterChain ──► JwtAuthenticationFilter ──► RBAC    |
+──────────────────────────────────────┬──────────────────────────────────────+
                                       │ Dispatches to Controller
+──────────────────────────────────────▼──────────────────────────────────────+
|                              APPLICATION LAYER                              |
|   AuthController  │  InstituteController  │  AssignmentCtrl  │  InspectCtrl |
+──────────────────────────────────────┬──────────────────────────────────────+
                                       │ Constructor Injection
+──────────────────────────────────────▼──────────────────────────────────────+
|                                SERVICE LAYER                                |
|   AuthService     │  InstituteService     │  AssignmentServ  │  InspectServ |
+──────────────────────────────────────┬──────────────────────────────────────+
                                       │ Spring Data JPA / Hibernate 6
+──────────────────────────────────────▼──────────────────────────────────────+
|                               DATABASE TIER                                 |
|                       PostgreSQL 18.4 (Port 5433)                           |
|   - users table (Partial unique index: Single Admin Invariant)              |
|   - institutes table (Unique code & contact email)                          |
|   - inspector_institute_assignments table (Composite indexes)               |
|   - inspections table (Sequence: INS-YYYY-XXXXXX)                           |
|   - inspection_results table (JSONB for 3 ML Models + raw_response)         |
|   - inspection_audit_events table (JSONB structured audit logs)             |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Project Directory Structure

```
backend/
├── pom.xml                                   # Maven dependencies (Spring Boot 4.0.7, Java 21, JJWT 0.12.6)
├── README.md                                 # Backend architecture & documentation
├── pgdata/                                   # PostgreSQL 18 local database cluster (Port 5433)
└── src/
    ├── main/
    │   ├── java/com/sih/inspection/
    │   │   ├── InspectionApplication.java    # Spring Boot Main Entry Point
    │   │   │
    │   │   ├── config/                       # Core Infrastructure & Constraints
    │   │   │   ├── DatabaseConstraintInitializer.java # PostgreSQL partial unique index & sequence setup
    │   │   │   └── JacksonConfig.java        # JSR-310 Java Time serialization config
    │   │   │
    │   │   ├── common/                       # Shared API Wrappers
    │   │   │   └── ApiResponse.java          # Standard JSON success wrapper: { success, message, data, timestamp }
    │   │   │
    │   │   ├── exception/                    # Centralized Error Handling
    │   │   │   ├── ApiError.java             # RFC-7807 compliant error payload with field violations
    │   │   │   ├── GlobalExceptionHandler.java # @RestControllerAdvice intercepting all runtime exceptions
    │   │   │   ├── DuplicateResourceException.java # HTTP 409 Conflict handler
    │   │   │   └── ResourceNotFoundException.java  # HTTP 404 Not Found handler
    │   │   │
    │   │   ├── security/                     # Spring Security & JWT Filter Chain
    │   │   │   ├── SecurityConfig.java       # Stateless FilterChain configuration, CORS, BCrypt bean
    │   │   │   ├── JwtService.java           # HMAC-SHA256 token generation, signing, parsing, claims
    │   │   │   ├── JwtAuthenticationFilter.java # OncePerRequestFilter validating Bearer tokens
    │   │   │   ├── SecurityUser.java         # UserDetails adapter wrapping User entity
    │   │   │   └── CustomUserDetailsService.java # Database-backed user loader with status checking
    │   │   │
    │   │   ├── auth/                         # Phase 1: Authentication Subsystem
    │   │   │   ├── controller/
    │   │   │   │   └── AuthController.java   # /api/auth/login, /api/auth/me, /api/auth/seed
    │   │   │   ├── service/
    │   │   │   │   └── AuthService.java      # Login authentication, token issuance, single-admin validation
    │   │   │   ├── repository/
    │   │   │   │   └── UserRepository.java   # JPA queries with single-admin checks
    │   │   │   ├── entity/
    │   │   │   │   ├── User.java             # Database entity mapping users table
    │   │   │   │   ├── Role.java             # Enum: ADMIN, INSPECTOR, INSTITUTE, ML_SERVICE
    │   │   │   │   └── AccountStatus.java    # Enum: ACTIVE, DISABLED, SUSPENDED
    │   │   │   └── dto/
    │   │   │       ├── LoginRequest.java     # Email & Password payload
    │   │   │       ├── AuthResponse.java     # JWT token + UserSummaryResponse
    │   │   │       └── UserSummaryResponse.java # Sanitized user details without password
    │   │   │
    │   │   ├── institute/                    # Phase 2: Institute Management Module
    │   │   │   ├── controller/
    │   │   │   │   └── InstituteController.java # /api/institutes (CRUD with RBAC)
    │   │   │   ├── service/
    │   │   │   │   └── InstituteService.java # Business validation, unique code enforcement
    │   │   │   ├── repository/
    │   │   │   │   └── InstituteRepository.java # Case-insensitive lookups & uniqueness checks
    │   │   │   ├── entity/
    │   │   │   │   ├── Institute.java        # Database entity mapping institutes table
    │   │   │   │   └── InstituteStatus.java  # Enum: ACTIVE, INACTIVE, SUSPENDED, UNDER_REVIEW
    │   │   │   └── dto/
    │   │   │       ├── CreateInstituteRequest.java # Jakarta-validated creation payload
    │   │   │       ├── UpdateInstituteRequest.java # Modification payload
    │   │   │       └── InstituteResponse.java      # Formatted institute output
    │   │   │
    │   │   ├── assignment/                   # Phase 3: Inspector ↔ Institute Assignment Management
    │   │   │   ├── controller/
    │   │   │   │   └── InspectorInstituteAssignmentController.java # /api/inspector-assignments
    │   │   │   ├── service/
    │   │   │   │   └── InspectorInstituteAssignmentService.java # 1:1 active rule & soft deactivation
    │   │   │   ├── repository/
    │   │   │   │   └── InspectorInstituteAssignmentRepository.java # @EntityGraph eager join queries
    │   │   │   ├── entity/
    │   │   │   │   ├── InspectorInstituteAssignment.java # Relationship mapping entity
    │   │   │   │   └── AssignmentStatus.java # Enum: ACTIVE, INACTIVE
    │   │   │   └── dto/
    │   │   │       ├── CreateAssignmentRequest.java
    │   │   │       ├── AssignmentResponse.java
    │   │   │       ├── AssignmentSummaryResponse.java
    │   │   │       ├── InspectorSummaryResponse.java
    │   │   │       └── InstituteSummaryResponse.java
    │   │   │
    │   │   └── inspection/                   # Phase 4: Inspection Management & ML Integration
    │   │       ├── controller/
    │   │       │   └── InspectionController.java # /api/v1/inspections lifecycle & results
    │   │       ├── service/
    │   │       │   ├── InspectionService.java      # Inspection creation, start, cancel, isolation
    │   │       │   ├── InspectionResultService.java# Atomic ML JSONB processing & duplicate protection
    │   │       │   ├── InspectionNumberGenerator.java # Sequence-driven INS-YYYY-XXXXXX generator
    │   │       │   └── InspectionAuditService.java # Event logging into inspection_audit_events
    │   │       ├── repository/
    │   │       │   ├── InspectionRepository.java
    │   │       │   ├── InspectionResultRepository.java
    │   │       │   └── InspectionAuditEventRepository.java
    │   │       ├── entity/
    │   │       │   ├── Inspection.java          # Core lifecycle entity with UUID PK
    │   │       │   ├── InspectionResult.java    # PostgreSQL JSONB evaluation result entity
    │   │       │   └── InspectionAuditEvent.java# Audit event entity
    │   │       ├── enums/
    │   │       │   ├── InspectionStatus.java    # REQUESTED, PROCESSING, COMPLETED, FAILED, CANCELLED
    │   │       │   └── InspectionType.java      # FULL_INSPECTION, FOLLOW_UP, RE_INSPECTION
    │   │       └── dto/
    │   │           ├── CreateInspectionRequest.java
    │   │           ├── InspectionResponse.java
    │   │           ├── MLInspectionResultRequest.java # Combined 3-model JSON payload
    │   │           ├── InspectionResultResponse.java  # Persisted result output
    │   │           └── InspectionSummaryResponse.java # Grid/Dashboard summary DTO
    │   │
    │   └── resources/
    │       ├── application.yml               # Global Spring Boot configuration
    │       └── application-local.yml         # Local development environment overrides
    │
    └── test/java/com/sih/inspection/          # 105 Passing Automated Tests
        ├── InspectionApplicationTests.java
        ├── auth/
        │   ├── SingleAdminInvariantTest.java # 7 tests: Storage-engine & service admin concurrency tests
        │   ├── controller/AuthControllerIntegrationTest.java # Auth API integration tests
        │   └── service/AuthServiceTest.java
        ├── institute/
        │   ├── controller/InstituteControllerIntegrationTest.java # Institute CRUD tests
        │   └── service/InstituteServiceTest.java
        ├── assignment/
        │   ├── controller/InspectorInstituteAssignmentControllerIntegrationTest.java # Single-active inspector tests
        │   └── service/InspectorInstituteAssignmentServiceTest.java
        ├── inspection/
        │   ├── controller/InspectionControllerIntegrationTest.java # Full lifecycle & ML integration tests
        │   └── service/
        │       ├── InspectionServiceTest.java
        │       └── InspectionResultServiceTest.java
        └── security/
            └── JwtServiceTest.java
```

---

## 3. Four Security Layers & Authentication Model

The backend applies a 4-layer defense-in-depth security model:

```
[ Incoming HTTP Request ]
           │
           ▼
┌────────────────────────────────────────────────────────┐
│ Layer 1: Network & CORS Filter                         │
│ - Validates allowed origins (e.g. localhost:5173)      │
│ - Permits pre-flight OPTIONS requests                  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Layer 2: Spring Security Filter Chain                  │
│ - Enforces SessionCreationPolicy.STATELESS             │
│ - Disables CSRF (REST stateless token architecture)    │
│ - Permits public endpoints (/api/auth/login, /seed)    │
│ - Rejects unauthenticated traffic with HTTP 401        │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Layer 3: JwtAuthenticationFilter                       │
│ - Extracts 'Authorization: Bearer <token>' header      │
│ - Validates cryptographic signature with HMAC-SHA256   │
│ - Checks expiration timestamp                          │
│ - Checks user account status (ACTIVE vs DISABLED)      │
│ - Populates SecurityContextHolder with SecurityUser    │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Layer 4: Method-Level RBAC (@PreAuthorize)             │
│ - Evaluates role permissions before controller execution│
│ - Enforces data isolation (Institutes only see self)  │
│ - Rejects unauthorized roles with HTTP 403 Forbidden   │
└────────────────────────────────────────────────────────┘
```

### System Roles (`Role.java`)
1. `ADMIN` (`ROLE_ADMIN`): Full administrative access. Can manage institutes, assign inspectors, start/cancel any inspection, and access all results.
2. `INSPECTOR` (`ROLE_INSPECTOR`): Expert Visit Committee member. Can view assigned institutes (`/my`), start assigned inspections, and review results.
3. `INSTITUTE` (`ROLE_INSTITUTE`): College representative. Can request inspections for their own college, view own inspection progress, and retrieve results. Isolated from other institutes.
4. `ML_SERVICE` (`ROLE_ML_SERVICE`): Dedicated machine-to-machine service identity. Has the single restricted capability to submit combined ML evaluation results to `POST /api/v1/inspections/{id}/results`. Cannot access user management or administrative features.

---

## 4. Hard Invariant: Exactly One Administrator

To guarantee security and business compliance:
* **The system permits exactly ONE Administrator account (`ADMIN`).**
* **Enforced at the Database Level**: A PostgreSQL partial unique index ensures that concurrent creation attempts are rejected by the database engine itself:
  ```sql
  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_single_admin ON users (role) WHERE role = 'ADMIN';
  ```
* **Enforced at the Service Layer**: `AuthService.validateSingleAdminInvariant()` checks before saving and throws `DuplicateResourceException` (`409 Conflict`).
* **Idempotent Seed Logic**: Running the startup seed multiple times safely updates the existing admin without ever creating a second admin.

---

## 5. Domain Modules & Workflows

### Module 1: Authentication Subsystem (Phase 1)
- **Token Format**: Standard RFC 7519 JWT signed with HMAC-SHA256.
- **Claims**: `sub` (email), `userId` (Long), `role` (Role), `status` (AccountStatus), `iat` (Issued At), `exp` (Expires At).
- **Passwords**: Hashed with BCrypt (strength 10).

---

### Module 2: Institutes Management (Phase 2)
- **Institute Entity**: Unique institute code (e.g. `DEC001`), name, address, region, city, state, contact email, contact phone, status (`ACTIVE`, `INACTIVE`, `SUSPENDED`, `UNDER_REVIEW`).
- **Authorization**:
  - `ROLE_ADMIN`: Full CRUD (`POST`, `GET`, `PUT`).
  - `ROLE_INSPECTOR`: Read access (`GET /api/institutes`, `GET /api/institutes/{id}`).
  - `ROLE_INSTITUTE`: Forbidden from global directory.

---

### Module 3: Inspector ↔ Institute Assignment Management (Phase 3)
- **Direct Assignment Architecture**: Inspectors are directly assigned to Institutes via `inspector_institute_assignments`.
- **Single-Active-Inspector Rule**: An institute can have **at most one active inspector** at any given time. Attempting to assign a second active inspector without deactivating the previous one returns `409 Conflict`.
- **Soft Deactivation**: Deactivating an assignment sets `status = INACTIVE` and records `deactivated_at`, preserving the audit history.
- **N+1 Query Prevention**: Repositories use `@EntityGraph(attributePaths = {"inspector", "institute"})` for single-query SQL joins.

---

### Module 4: Inspection Management & ML Result Integration (Phase 4)

#### Inspection Lifecycle State Machine:
```
[ POST /api/v1/inspections ]
            │
            ▼
       REQUESTED ──────────────────────────► CANCELLED (POST /{id}/cancel)
            │
  (POST /{id}/start)
            │
            ▼
       PROCESSING
            │
 ┌──────────┴────────────────────────┐
 │                                   │
 │ (POST /{id}/results)              │ (Timeout / Failure)
 ▼                                   ▼
COMPLETED                          FAILED
(Atomic Result Persistence)
```

#### Collision-Free Inspection Number Generation:
- Generates human-readable IDs: `INS-YYYY-XXXXXX` (e.g., `INS-2026-000001`).
- Driven by PostgreSQL sequence `inspection_number_seq` (`START WITH 1 INCREMENT BY 1`).
- Concurrency-safe and collision-free across distributed requests.

#### 3 ML Inspection Components & JSONB Storage:
The external ML application combines three distinct models into a single payload:
1. **Model 1 — Garbage Detection**: Detects campus waste, trash density, and hygiene hotspots.
2. **Model 2 — Infrastructure Checkup**: Analyzes classroom conditions, building structural status, and physical amenities.
3. **Model 3 — Computer Connectivity / Analysis**: Discovers computer hardware status, network availability, and lab readiness.

**PostgreSQL JSONB Strategy**:
- Individual outputs (`garbage_result`, `infrastructure_result`, `computer_result`) are mapped via Hibernate 6 `@JdbcTypeCode(SqlTypes.JSON)`.
- **Mandatory Raw Response Preservation**: The complete, untouched external JSON response is preserved in `raw_response JSONB` for auditing, debugging, and historical report reproducibility.
- **Final Score**: Validated in range `[0.0, 100.0]` and stored in a separate column with a database check constraint.
- **Duplicate Protection**: Re-submitting results for an already completed inspection is rejected with `409 Conflict`.

---

## 6. Role-Based Access Control (RBAC) Matrix

| Method | Endpoint | Description | ROLE_ADMIN | ROLE_INSPECTOR | ROLE_INSTITUTE | ROLE_ML_SERVICE |
|:---|:---|:---|:---:|:---:|:---:|:---:|
| `POST` | `/api/auth/login` | Authenticate with credentials | Public | Public | Public | Public |
| `GET` | `/api/auth/me` | Current authenticated user profile | Allowed | Allowed | Allowed | Allowed |
| `POST` | `/api/auth/seed` | Seed standard demo accounts | Public / Dev | Public / Dev | Public / Dev | Public / Dev |
| `GET` | `/api/institutes` | List all registered institutes | Allowed | Allowed | Forbidden (403) | Forbidden (403) |
| `POST` | `/api/institutes` | Create a new educational institute | Allowed | Forbidden (403) | Forbidden (403) | Forbidden (403) |
| `GET` | `/api/institutes/{id}` | Retrieve institute details | Allowed | Allowed | Forbidden (403) | Forbidden (403) |
| `PUT` | `/api/institutes/{id}` | Update institute details | Allowed | Forbidden (403) | Forbidden (403) | Forbidden (403) |
| `POST` | `/api/inspector-assignments` | Assign inspector to institute | Allowed | Forbidden (403) | Forbidden (403) | Forbidden (403) |
| `GET` | `/api/inspector-assignments` | List all assignments | Allowed | Forbidden (403) | Forbidden (403) | Forbidden (403) |
| `DELETE` | `/api/inspector-assignments/{id}` | Deactivate an active assignment | Allowed | Forbidden (403) | Forbidden (403) | Forbidden (403) |
| `GET` | `/api/inspector-assignments/my` | View my assigned institutes | Forbidden (403) | Allowed | Forbidden (403) | Forbidden (403) |
| `GET` | `/api/institutes/{id}/inspector` | View active inspector of institute | Allowed | Allowed | Forbidden (403) | Forbidden (403) |
| `POST` | `/api/v1/inspections` | Request a new inspection | Allowed | Forbidden (403) | Allowed (Own) | Forbidden (403) |
| `GET` | `/api/v1/inspections` | List inspections (isolated by role) | Allowed (All) | Allowed (All) | Allowed (Own) | Forbidden (403) |
| `GET` | `/api/v1/inspections/{id}` | Retrieve inspection details | Allowed | Allowed | Allowed (Own) | Forbidden (403) |
| `POST` | `/api/v1/inspections/{id}/start` | Start inspection (REQUESTED -> PROCESSING)| Allowed | Allowed | Allowed (Own) | Forbidden (403) |
| `POST` | `/api/v1/inspections/{id}/cancel`| Cancel inspection (REQUESTED -> CANCELLED)| Allowed | Forbidden (403) | Allowed (Own) | Forbidden (403) |
| `POST` | `/api/v1/inspections/{id}/results`| Submit combined ML JSON result | Allowed | Forbidden (403) | Forbidden (403) | Allowed |
| `GET` | `/api/v1/inspections/{id}/results`| Retrieve persisted ML result | Allowed | Allowed | Allowed (Own) | Forbidden (403) |
| `GET` | `/api/v1/inspections/{id}/summary`| Retrieve dashboard summary | Allowed | Allowed | Allowed (Own) | Forbidden (403) |

---

## 7. API Endpoints Reference & Payloads

### 1. Authentication Endpoints

#### `POST /api/auth/login`
Authenticates a user and returns a JWT Bearer token.
```json
// Request
{
  "email": "admin@sih.gov.in",
  "password": "Password@123"
}

// Response (HTTP 200 OK)
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "user": {
      "id": 1,
      "email": "admin@sih.gov.in",
      "role": "ADMIN",
      "status": "ACTIVE"
    }
  },
  "timestamp": "2026-08-19T10:30:00Z"
}
```

---

### 2. Institute Management Endpoints

#### `POST /api/institutes`
Creates a new educational institute (`ROLE_ADMIN` only).
```json
// Request
{
  "name": "Delhi Technological University",
  "code": "DTU001",
  "address": "Shahbad Daulatpur, Main Bawana Road",
  "region": "North",
  "city": "Delhi",
  "state": "Delhi",
  "contactEmail": "contact@dtu.ac.in",
  "contactPhone": "9876543210"
}

// Response (HTTP 201 Created)
{
  "success": true,
  "message": "Institute created successfully",
  "data": {
    "id": 1,
    "name": "Delhi Technological University",
    "code": "DTU001",
    "region": "North",
    "status": "ACTIVE"
  }
}
```

---

### 3. Inspector Assignment Endpoints

#### `POST /api/inspector-assignments`
Assigns an inspector to an institute (`ROLE_ADMIN` only).
```json
// Request
{
  "inspectorId": 2,
  "instituteId": 1
}

// Response (HTTP 201 Created)
{
  "success": true,
  "message": "Inspector assigned to institute successfully",
  "data": {
    "id": 10,
    "inspector": { "id": 2, "email": "inspector@sih.gov.in" },
    "institute": { "id": 1, "name": "Delhi Technological University", "code": "DTU001" },
    "status": "ACTIVE",
    "assignedAt": "2026-08-19T10:35:00Z"
  }
}
```

---

### 4. Inspection Management & ML Integration Endpoints

#### `POST /api/v1/inspections`
Requests a new inspection (`ROLE_INSTITUTE` or `ROLE_ADMIN`).
```json
// Request
{
  "inspectionType": "FULL_INSPECTION"
}

// Response (HTTP 201 Created)
{
  "success": true,
  "message": "Inspection requested successfully",
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "inspectionNumber": "INS-2026-000001",
    "institute": { "id": 1, "name": "Delhi Technological University", "code": "DTU001" },
    "inspectionType": "FULL_INSPECTION",
    "status": "REQUESTED",
    "requestedAt": "2026-08-19T10:40:00Z",
    "hasResult": false
  }
}
```

#### `POST /api/v1/inspections/{id}/start`
Transitions inspection status from `REQUESTED` to `PROCESSING`.
```json
// Response (HTTP 200 OK)
{
  "success": true,
  "message": "Inspection started successfully",
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "inspectionNumber": "INS-2026-000001",
    "status": "PROCESSING",
    "startedAt": "2026-08-19T10:45:00Z"
  }
}
```

#### `POST /api/v1/inspections/{id}/results`
Receives the combined evaluation JSON response from the external ML service (`ROLE_ML_SERVICE` or `ROLE_ADMIN`).
```json
// Request Payload (Combined 3 Models)
{
  "garbageDetection": {
    "score": 84.0,
    "detectedGarbageItems": 3,
    "hotspots": ["Cafeteria", "Sports Ground"]
  },
  "infrastructureCheckup": {
    "score": 91.5,
    "condition": "GOOD",
    "classroomsAudited": 40
  },
  "computerConnectivity": {
    "score": 95.0,
    "totalComputers": 100,
    "activeComputers": 98
  },
  "finalScore": 90.2,
  "modelVersion": "1.0.0"
}

// Response (HTTP 200 OK)
{
  "success": true,
  "message": "Inspection result processed and recorded successfully",
  "data": {
    "inspectionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "inspectionNumber": "INS-2026-000001",
    "status": "COMPLETED",
    "finalScore": 90.2,
    "modelVersion": "1.0.0",
    "completedAt": "2026-08-19T10:50:00Z"
  }
}
```

#### `GET /api/v1/inspections/{id}/results`
Retrieves the complete evaluation result for reporting and dashboards.
```json
// Response (HTTP 200 OK)
{
  "success": true,
  "data": {
    "inspectionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "inspectionNumber": "INS-2026-000001",
    "status": "COMPLETED",
    "finalScore": 90.2,
    "garbageDetection": { "score": 84.0, "detectedGarbageItems": 3 },
    "infrastructureCheckup": { "score": 91.5, "condition": "GOOD" },
    "computerConnectivity": { "score": 95.0, "activeComputers": 98 },
    "modelVersion": "1.0.0",
    "receivedAt": "2026-08-19T10:50:00Z",
    "completedAt": "2026-08-19T10:50:00Z",
    "rawResponse": { ... }
  }
}
```

---

## 8. Automated Test Suite (105 / 105 Tests Passing)

The backend features an automated test suite executed with JUnit 5, Mockito, and Spring MockMvc.

```
[INFO] Results:
[INFO] 
[INFO] Tests run: 105, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
```

### Breakdown of Test Suites:
1. **Phase 1 — Authentication & Security (20 Tests)**:
   - `AuthControllerIntegrationTest`: 13 tests (Login, Token issuance, 401 Unauthorized, Account disabled 403, /me validation).
   - `AuthServiceTest`: 4 tests (Credential verification, user summary formatting).
   - `JwtServiceTest`: 3 tests (Token generation, claims decoding, expiration handling).
2. **Phase 2 — Institutes Module (28 Tests)**:
   - `InstituteControllerIntegrationTest`: 18 tests (Admin CRUD, Inspector read-only, Institute 403, duplicate code 409, validation errors 400).
   - `InstituteServiceTest`: 10 tests (Uniqueness logic, region validations).
3. **Phase 3 — Inspector Assignments (24 Tests)**:
   - `InspectorInstituteAssignmentControllerIntegrationTest`: 12 tests (Assignment creation, single-active inspector rule 409, soft deactivation, /my inspector endpoint).
   - `InspectorInstituteAssignmentServiceTest`: 12 tests (Business rules, deactivation timestamps).
4. **Single-Admin Invariant (7 Tests)**:
   - `SingleAdminInvariantTest`: 7 tests (PostgreSQL partial unique index validation, concurrent creation prevention, idempotent seeding).
5. **Phase 4 — Inspection Management & ML Integration (26 Tests)**:
   - `InspectionControllerIntegrationTest`: 10 tests (Create inspection, start inspection, submit ML result, 403 isolation, duplicate ML result 409, cancel inspection).
   - `InspectionServiceTest`: 10 tests (State transitions, sequence numbering, institute resolution).
   - `InspectionResultServiceTest`: 6 tests (Atomic result persistence, score range check, rawResponse preservation).

---

## 9. How to Run & Configure the Backend

### Prerequisites
* **Java 21 OpenJDK** (`java -version`)
* **PostgreSQL 18.4** (`pg_isready -h localhost -p 5433`)

### 1. Database Configuration
The backend is configured to connect to PostgreSQL on port **5433** for local development (`sih_inspection` database):

```bash
# Start local PostgreSQL cluster (if not already running)
/usr/lib/postgresql/18/bin/postgres -D /home/kali/Desktop/inspection/SIH_Prototype/backend/pgdata -p 5433 -c unix_socket_directories=/tmp &
```

### 2. Run the Spring Boot Server
```bash
cd /home/kali/Desktop/inspection/SIH_Prototype/backend
SPRING_PROFILES_ACTIVE=local ./mvnw spring-boot:run
```
The server will start and bind to `http://localhost:8080`.

### 3. Run the Automated Test Suite
```bash
cd /home/kali/Desktop/inspection/SIH_Prototype/backend
./mvnw clean test
```

### 4. Seed Standard Demo Accounts
Trigger the automated idempotent seed via cURL:
```bash
curl -X POST http://localhost:8080/api/auth/seed
```
Default accounts created/verified:
* **Admin**: `admin@sih.gov.in` / `Password@123` (`ROLE_ADMIN`)
* **Inspector**: `inspector@sih.gov.in` / `Password@123` (`ROLE_INSPECTOR`)
* **Institute**: `institute@sih.gov.in` / `Password@123` (`ROLE_INSTITUTE`)
* **ML Service**: `ml_service@sih.gov.in` / `Password@123` (`ROLE_ML_SERVICE`)
* **Disabled Demo**: `disabled@sih.gov.in` / `Password@123` (`AccountStatus.DISABLED`)
