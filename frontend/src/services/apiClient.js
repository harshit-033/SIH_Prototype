/**
 * Centralized API Client for Spring Boot Backend (http://localhost:8080)
 */

export const BACKEND_URL = "http://localhost:8080";
export const API_BASE = `${BACKEND_URL}/api`;

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BACKEND_URL}/actuator/health`, {
      method: "GET",
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return { online: false, status: "DOWN" };
    const data = await res.json();
    return { online: data.status === "UP", ...data };
  } catch {
    return { online: false, status: "OFFLINE" };
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("sih_auth_token");
  
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      signal: AbortSignal.timeout(4000),
    });

    const isJson = (res.headers.get("content-type") || "").includes("application/json");
    const data = isJson ? await res.json() : null;

    if (!res.ok) {
      const errorMsg = data?.message || data?.error || `HTTP ${res.status}: ${res.statusText}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.name === "TimeoutError" || error.message.includes("Failed to fetch")) {
      error.isOffline = true;
    }
    throw error;
  }
}
