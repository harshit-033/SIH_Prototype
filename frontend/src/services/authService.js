import { apiRequest } from './apiClient';

const TOKEN_KEY = 'sih_auth_token';
const USER_KEY = 'sih_auth_user';

export function decodeJwt(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getStoredAuth() {
  const token = localStorage.getItem(TOKEN_KEY);
  const userJson = localStorage.getItem(USER_KEY);
  
  if (!token) return null;
  
  const claims = decodeJwt(token);
  const user = userJson ? JSON.parse(userJson) : null;
  
  return {
    token,
    claims,
    user: user || {
      email: claims?.sub || 'user@sih.gov.in',
      role: claims?.role || 'ROLE_INSPECTOR',
      status: claims?.status || 'ACTIVE',
      id: claims?.userId || 1
    }
  };
}

export async function loginUser(email, password) {
  try {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });

    const loginData = res.data || res;
    if (loginData.token) {
      localStorage.setItem(TOKEN_KEY, loginData.token);
      localStorage.setItem(USER_KEY, JSON.stringify({
        id: loginData.userId,
        email: loginData.email,
        role: loginData.role,
        status: loginData.status,
      }));

      return {
        success: true,
        isLiveBackend: true,
        token: loginData.token,
        user: loginData,
        role: loginData.role
      };
    }
    throw new Error("Invalid response payload from authentication server");
  } catch (error) {
    // If backend is offline, generate demo JWT session so presentation never breaks
    if (error.isOffline) {
      const demoRole = email.includes('admin') ? 'ROLE_ADMIN' 
                     : email.includes('institute') || email.includes('college') ? 'ROLE_INSTITUTE' 
                     : 'ROLE_INSPECTOR';

      const simulatedUser = {
        id: Math.floor(Math.random() * 100) + 1,
        email: email.trim().toLowerCase(),
        role: demoRole,
        status: 'ACTIVE'
      };

      // Mock JWT structure (header.payload.sig)
      const mockPayload = btoa(JSON.stringify({
        sub: simulatedUser.email,
        role: simulatedUser.role,
        userId: simulatedUser.id,
        status: simulatedUser.status,
        exp: Math.floor(Date.now() / 1000) + 86400,
        iat: Math.floor(Date.now() / 1000)
      }));
      const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${mockPayload}.simulatedSignatureBit`;

      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(simulatedUser));

      return {
        success: true,
        isLiveBackend: false,
        token: mockToken,
        user: simulatedUser,
        role: demoRole,
        notice: "Connected via Demo Security Fallback (Spring Boot Offline)"
      };
    }
    throw error;
  }
}

export async function seedDemoUsers() {
  try {
    const res = await apiRequest('/auth/seed', { method: 'POST' });
    return { success: true, data: res.data || res };
  } catch (error) {
    if (error.isOffline) {
      return { success: true, isSimulated: true, message: "Simulated database seed completed." };
    }
    throw error;
  }
}

export async function fetchCurrentUser() {
  try {
    const res = await apiRequest('/auth/me', { method: 'GET' });
    return res.data || res;
  } catch {
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
