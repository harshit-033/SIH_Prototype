/**
 * Centralized API Client with automated latency measurement and live request logging.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Global listeners for live request logging
const logListeners = new Set();
let requestHistory = [];
const MAX_HISTORY = 50;

export function subscribeToLogs(callback) {
  logListeners.add(callback);
  callback([...requestHistory]);
  return () => logListeners.delete(callback);
}

export function clearRequestHistory() {
  requestHistory = [];
  logListeners.forEach(cb => cb([]));
}

function notifyLog(entry) {
  requestHistory = [entry, ...requestHistory.slice(0, MAX_HISTORY - 1)];
  logListeners.forEach(cb => cb([...requestHistory]));
}

/**
 * Executes an HTTP request, recording headers, latency, status, and responses for the debug console.
 */
export async function executeApiRequest({
  method = 'GET',
  path = '',
  body = null,
  token = null,
  customHeaders = {}
}) {
  const url = `${API_BASE_URL}${path}`;
  const startTime = performance.now();
  const timestamp = new Date().toLocaleTimeString();

  const headers = {
    'Accept': 'application/json',
    ...customHeaders
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const requestLogData = {
    id: Date.now() + Math.random(),
    timestamp,
    method,
    url,
    path,
    headers: {
      ...headers,
      ...(headers['Authorization'] ? { 'Authorization': `Bearer ${token.substring(0, 12)}...` } : {})
    },
    rawAuthorizationHeader: headers['Authorization'] || 'None',
    body: body ? JSON.stringify(body, null, 2) : null
  };

  try {
    const fetchOptions = {
      method,
      headers
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);
    const latency = Math.round(performance.now() - startTime);

    let responseData = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch {
        responseData = { error: 'Failed to parse JSON response' };
      }
    } else {
      const text = await response.text();
      responseData = text ? { rawText: text } : null;
    }

    const completedEntry = {
      ...requestLogData,
      status: response.status,
      statusText: response.statusText || (response.ok ? 'OK' : 'ERROR'),
      latency,
      responseBody: responseData,
      isSuccess: response.ok
    };

    notifyLog(completedEntry);

    return {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      latency,
      data: responseData,
      logEntry: completedEntry
    };
  } catch (error) {
    const latency = Math.round(performance.now() - startTime);
    const failedEntry = {
      ...requestLogData,
      status: 0,
      statusText: 'NETWORK_ERROR',
      latency,
      responseBody: {
        error: error.message,
        message: 'Could not connect to backend server. Ensure Spring Boot is running on port 8080.'
      },
      isSuccess: false
    };

    notifyLog(failedEntry);

    return {
      status: 0,
      statusText: 'NETWORK_ERROR',
      ok: false,
      latency,
      data: failedEntry.responseBody,
      logEntry: failedEntry
    };
  }
}

// Convenient Domain API Helpers
export const api = {
  // Health
  checkHealth: () => executeApiRequest({ method: 'GET', path: '/actuator/health' }),

  // Auth (Phase 1)
  login: (email, password) =>
    executeApiRequest({
      method: 'POST',
      path: '/api/auth/login',
      body: { email, password }
    }),

  getMe: (token) =>
    executeApiRequest({
      method: 'GET',
      path: '/api/auth/me',
      token
    }),

  seedUsers: () =>
    executeApiRequest({
      method: 'POST',
      path: '/api/auth/seed'
    }),

  // Institutes (Phase 2)
  listInstitutes: (token) =>
    executeApiRequest({
      method: 'GET',
      path: '/api/institutes',
      token
    }),

  getInstitute: (id, token) =>
    executeApiRequest({
      method: 'GET',
      path: `/api/institutes/${id}`,
      token
    }),

  createInstitute: (instituteData, token) =>
    executeApiRequest({
      method: 'POST',
      path: '/api/institutes',
      body: instituteData,
      token
    }),

  updateInstitute: (id, instituteData, token) =>
    executeApiRequest({
      method: 'PUT',
      path: `/api/institutes/${id}`,
      body: instituteData,
      token
    }),

  // Assignments (Phase 3)
  listAssignments: (status, token) =>
    executeApiRequest({
      method: 'GET',
      path: status ? `/api/inspector-assignments?status=${status}` : '/api/inspector-assignments',
      token
    }),

  getAssignment: (id, token) =>
    executeApiRequest({
      method: 'GET',
      path: `/api/inspector-assignments/${id}`,
      token
    }),

  createAssignment: (inspectorId, instituteId, token) =>
    executeApiRequest({
      method: 'POST',
      path: '/api/inspector-assignments',
      body: { inspectorId: Number(inspectorId), instituteId: Number(instituteId) },
      token
    }),

  deactivateAssignment: (id, token) =>
    executeApiRequest({
      method: 'DELETE',
      path: `/api/inspector-assignments/${id}`,
      token
    }),

  getMyAssignments: (token) =>
    executeApiRequest({
      method: 'GET',
      path: '/api/inspector-assignments/my',
      token
    }),

  getInstituteInspector: (instituteId, token) =>
    executeApiRequest({
      method: 'GET',
      path: `/api/institutes/${instituteId}/inspector`,
      token
    })
};
