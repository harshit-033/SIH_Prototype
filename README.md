# Setup & Run

### Prerequisites

Install dependencies on **both the main PC and client PC**:

```bash
pip install -r requirements.txt
```

### Steps

1. On the **main PC**, open Terminal and run:

   ```bash
   ipconfig
   ```
2. Copy the **IPv4 Address** of your connected network.
3. In `client.py`, replace the server IP:

   ```text
   192.168.1.10 → YOUR_IPV4_ADDRESS
   ```
4. On the **main PC**, open Terminal in the `server` folder and run:

   ```bash
   uvicorn server:app --host 0.0.0.0 --port 8000
   ```
5. On the **client PC**, run:

   ```bash
   python client.py
   ```
6. On the **main PC**, open `dashboard/index.html` in your browser.

> **Note:** Both PCs must be connected to the same network.

---

## Backend (Spring Boot)

A production-grade Spring Boot backend has been added under [`backend/`](./backend/).

See [`backend/README.md`](./backend/README.md) for:
- Setup instructions
- Environment variable reference
- Database setup
- Architecture overview
- How to run the backend alongside the scanner

### Architecture

```
React Frontend (future)  →  Spring Boot Backend (port 8080)  →  PostgreSQL 18
                                       ↓
                        FastAPI Scanner Service (port 8000)
                                       ↑
                           client.py agents on remote PCs
```
