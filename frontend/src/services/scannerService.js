/**
 * Telemetry Service for FastAPI Scanner integration (server.py)
 */
const API_BASE = "http://127.0.0.1:8000";

export async function fetchServerStatus() {
  try {
    const res = await fetch(`${API_BASE}/`, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { online: true, ...data };
  } catch {
    return { online: false, clients: 0, inventory_count: 0 };
  }
}

export async function fetchLiveClients() {
  try {
    const res = await fetch(`${API_BASE}/clients`, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null; // Signals offline fallback
  }
}

export async function fetchInventory() {
  try {
    const res = await fetch(`${API_BASE}/inventory`, { method: "GET" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return null; // Signals offline fallback
  }
}
