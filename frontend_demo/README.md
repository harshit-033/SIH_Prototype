# SIH Inspection Platform — Frontend Development & Inspection Console (`frontend_demo`)

---

## 1. Overview (Simple & Technical Explanations)

### Simple Explanation (In Plain English)
The **`frontend_demo`** application is an interactive **Development, Debugging & Inspection Console** for the SIH Inspection Platform. 

Rather than hiding API calls behind basic forms, this console turns the entire frontend into a transparent **live laboratory**:
* You can click a single button to log in as an **Admin**, **Inspector**, or **Institute representative**.
* You can see your **JWT Token**, watch its expiration countdown timer tick in real-time, and inspect every decoded security claim (`sub`, `role`, `userId`).
* You can trigger API calls for **Institutes**, **Inspector Assignments**, and **Inspections**, and watch the exact HTTP request headers, response payload, status code, and latency ($ms$) appear live in the built-in wire debugger.
* You can test what happens when someone tries to tamper with a token, access unauthorized endpoints, or break security rules.

---

### Technical Explanation (For Frontend & Full-Stack Engineers)
The development console is a Single Page Application (SPA) built with **React 19** and **Vite**. It features a centralized HTTP client (`apiClient.js`) that wraps the native Fetch API with automated latency measurement, error normalization, and an in-memory event-driven logger (subscriber pattern capped at $N=50$ requests).

```
+─────────────────────────────────────────────────────────────────────────────+
|                         REACT DEVELOPMENT CONSOLE                           |
|                                                                             |
|  [ DevConsoleHeader ] ──► Live Health Ping (/actuator/health) [● ONLINE 4ms]|
|  [ AuthStatusCard ]   ──► Session State, Role Badge, Expiry Countdown       |
|  [ Live Wire Console] ──► Split-Pane: Request History List + Raw JSON Wire  |
|                                                                             |
|  +─────────────────────────+──────────────────────────+                  |
|  | Phase 1: Auth & Tamper  | Phase 2: Institutes CRUD |                  |
|  +─────────────────────────+──────────────────────────+                  |
|  | Phase 3: Assignments    | JWT & Claims Inspector   |                  |
|  +─────────────────────────+──────────────────────────+                  |
|  | RBAC Permission Matrix  | End-to-End Security Flow |                  |
|  +─────────────────────────+──────────────────────────+                  |
+──────────────────────────────────────┬──────────────────────────────────────+
                                       │ Centralized apiClient
                                       ▼
+─────────────────────────────────────────────────────────────────────────────+
|           SPRING BOOT BACKEND API (http://localhost:8080)                   |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Directory Structure

```
frontend_demo/
├── package.json                              # Vite & React scripts
├── vite.config.js                            # Vite dev server configuration (Port 5173)
├── .env.development                          # Dev environment variables & Quick-Login credentials
├── index.html                                # HTML5 root entry with Google Fonts (Outfit & JetBrains Mono)
└── src/
    ├── main.jsx                              # React DOM root bootstrapping
    ├── App.jsx                               # Master container assembling all 10 console modules
    ├── App.css                               # Complete design system (Dark mode, glassmorphism, badges)
    ├── index.css                             # Base reset & typography rules
    │
    ├── services/
    │   └── apiClient.js                      # Centralized fetch wrapper with latency & wire logging
    │
    ├── utils/
    │   └── jwtUtils.js                       # Base64URL claims decoder & live countdown formatter
    │
    └── components/
        ├── DevConsoleHeader.jsx              # Header with Backend/Frontend URLs & live health status
        ├── AuthStatusCard.jsx                # Active identity, User ID, Role badge, Expiry timer
        ├── RequestHistoryConsole.jsx         # Live HTTP request history + split-pane JSON wire inspector
        ├── Phase1AuthConsole.jsx             # Role quick-logins, manual login form, token tampering tests
        ├── Phase2InstitutesConsole.jsx       # Phase 2 Institutes CRUD console with RBAC guards
        ├── Phase3AssignmentsConsole.jsx      # Phase 3 Assignment manager & single-active inspector table
        ├── JwtInspector.jsx                  # Header/Payload claims inspector & localStorage storage info
        ├── RoleAuthorizationVisualizer.jsx   # Live matrix showing ALLOWED vs FORBIDDEN per active role
        ├── SecurityFlowDiagram.jsx           # 10-step visual security architecture flow
        └── ErrorExplainer.jsx                # Reference guide for HTTP status codes (200, 201, 400, 401, 403, 409)
```

---

## 3. Key Components & Capabilities

### 1. DevConsoleHeader (`DevConsoleHeader.jsx`)
- Displays the active **Backend Target URL** (`http://localhost:8080`) and **Frontend Host** (`http://localhost:5173`).
- **Live Heartbeat Ping**: Polling `/actuator/health` every 10 seconds to show live connection status (`● ONLINE (4ms)`).
- **Instant DB Seed Trigger**: `[ ⚡ Seed Demo Database ]` button triggers `POST /api/auth/seed` to ensure standard demo credentials exist in PostgreSQL.

---

### 2. AuthStatusCard (`AuthStatusCard.jsx`)
- Shows current authentication status (`AUTHENTICATED` vs `UNAUTHENTICATED`).
- Displays authenticated **Email**, **User ID**, **Role Badge** (`ROLE_ADMIN`, `ROLE_INSPECTOR`, `ROLE_INSTITUTE`, `ROLE_ML_SERVICE`), and **Account Status** (`ACTIVE`).
- **Live Expiry Countdown**: Updates every second, displaying remaining validity in `Xh Ym Zs` format with visual alert when expired.
- One-click **Copy Token** and **Logout** actions.

---

### 3. Live Request & Response Debug Console (`RequestHistoryConsole.jsx`)
- Automatically intercepts and records every HTTP request dispatched from the UI.
- **Left Panel (History List)**: Chronological list of past requests showing HTTP Method badge (`GET`, `POST`, `PUT`, `DELETE`), URL path, HTTP Status badge (`200 OK`, `201 Created`, `401 Unauthorized`, `403 Forbidden`, `409 Conflict`), and response latency in milliseconds ($ms$).
- **Right Panel (Raw Wire Inspector)**:
  - **Request Tab**: Displays exact request URL, HTTP Method, and full HTTP Headers (including `Authorization: Bearer <token>` and `Content-Type`), plus the raw request body.
  - **Response Tab**: Displays HTTP status, latency, and formatted, syntax-highlighted JSON response payload returned by Spring Boot.

---

### 4. Phase 1 Authentication Console (`Phase1AuthConsole.jsx`)
- **Role Quick-Login Buttons**:
  - `[ QUICK LOGIN — ADMIN ]` ➔ `admin@sih.gov.in` / `Password@123`
  - `[ QUICK LOGIN — INSPECTOR ]` ➔ `inspector@sih.gov.in` / `Password@123`
  - `[ QUICK LOGIN — INSTITUTE ]` ➔ `institute@sih.gov.in` / `Password@123`
  - `[ QUICK LOGIN — DISABLED ]` ➔ `disabled@sih.gov.in` (Tests `403 Forbidden` for disabled accounts)
  - `[ DEV QUICK LOGIN — SUPER ADMIN ]` ➔ `SUPER_ADMIN` / `SUDO@123` (Development-only credential test)
- **Manual Login Form**: Custom email/password login test form.
- **Negative Security Suite**:
  - `[ ⚡ GET /api/auth/me (Valid JWT) ]` ➔ Verifies profile with valid token.
  - `[ 💥 Test Invalid / Tampered JWT (Expect 401) ]` ➔ Modifies signature bits and sends to backend; verifies backend rejects tampered token with `401 Unauthorized`.
  - `[ 🚫 Test No Token (Expect 401) ]` ➔ Sends request without Authorization header; verifies rejection.

---

### 5. Phase 2 Institutes Console (`Phase2InstitutesConsole.jsx`)
- `[ 📋 LIST ALL INSTITUTES (GET /api/institutes) ]`: Retrieves global institute directory (Allowed for `ADMIN` and `INSPECTOR`).
- `[ 🔍 GET INSTITUTE BY ID ]`: Fetches specific institute record.
- **Create Institute Form**: Admin-only form to create new colleges (`name`, `code`, `region`, `city`, `state`, `contactEmail`, `contactPhone`).
- **Update Institute Form**: Admin-only modification form.
- Automatically renders role warning notices if the active user lacks required permissions.

---

### 6. Phase 3 Assignments Console (`Phase3AssignmentsConsole.jsx`)
- `[ 📋 LIST ALL ASSIGNMENTS (GET /api/inspector-assignments) ]`: Lists all active/inactive inspector-to-institute assignments (`ADMIN` only).
- **Assign Inspector Form**: Assigns an inspector ID to an institute ID. Demonstrates the **Single-Active-Inspector Rule** (attempting a duplicate assignment returns `409 Conflict`).
- **Deactivate Assignment Action**: Deactivates an assignment and sets it to `INACTIVE`.
- `[ 🕵️ MY ASSIGNED INSTITUTES (GET /api/inspector-assignments/my) ]`: Inspector-only action that extracts assigned institutes securely from `SecurityContext`.
- `[ 🏛️ VIEW INSTITUTE INSPECTOR ]`: Retrieves the active inspector assigned to a given institute.

---

### 7. JWT Claims & Storage Inspector (`JwtInspector.jsx`)
- Decodes and displays JWT Header (`alg: HS256`, `typ: JWT`).
- Decodes and displays JWT Payload claims (`sub`, `role`, `status`, `userId`, `iat`, `exp`).
- Shows `localStorage` key details (`localStorage.sih_auth_token`).
- Allows toggling visibility of the raw encoded string, copying to clipboard, or purging session storage.

---

### 8. Role Authorization Matrix (`RoleAuthorizationVisualizer.jsx`)
- Displays an interactive permission matrix comparing all system endpoints against the currently active role.
- Dynamically flags each action as either **`✓ ALLOWED (200/201)`** or **`✗ FORBIDDEN (403)`** based on Spring Security `@PreAuthorize` rules.

---

### 9. Security Flow Diagram (`SecurityFlowDiagram.jsx`)
- Visual 10-step architectural diagram tracing the path of a request:
  `React UI ➔ Fetch Client ➔ Spring Security FilterChain ➔ JwtAuthenticationFilter ➔ SecurityContext ➔ @PreAuthorize ➔ Controller ➔ Service ➔ Repository ➔ PostgreSQL`.

---

### 10. HTTP Status Reference Card (`ErrorExplainer.jsx`)
- Quick reference card explaining the semantic meaning of HTTP status codes used throughout the platform: `200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, and `409 Conflict`.

---

## 4. Configuration & Environment Variables

The console is configured via `.env.development`:

| Variable | Description | Default |
|---|---|---|
| `VITE_API_BASE_URL` | Target backend REST API URL | `http://localhost:8080` |
| `VITE_DEV_ADMIN_EMAIL` | Development quick-login username | `SUPER_ADMIN` |
| `VITE_DEV_ADMIN_PASSWORD` | Development quick-login password | `SUDO@123` |

> [!NOTE]
> The `[ DEV QUICK LOGIN — SUPER ADMIN ]` button is only rendered in development mode (`import.meta.env.DEV === true`). It is automatically excluded from production builds.

---

## 5. How to Run & Build the Frontend

### Prerequisites
* **Node.js 18+** (`node -v`)
* **npm 9+** (`npm -v`)

### 1. Install Dependencies
```bash
cd /home/kali/Desktop/inspection/SIH_Prototype/frontend_demo
npm install
```

### 2. Start Development Server
```bash
cd /home/kali/Desktop/inspection/SIH_Prototype/frontend_demo
npm run dev
```
The console will start on **`http://localhost:5173`**.

### 3. Production Build & Validation
```bash
cd /home/kali/Desktop/inspection/SIH_Prototype/frontend_demo
npm run build
```
Creates an optimized production bundle in `dist/` (build time: ~180ms, 0 errors).
