const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('auth_token');
}

export async function apiCall<T = any>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (res.status === 401) {
    clearToken();
    // Only redirect if we're not already on the login page
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    // TODO - we should probably throw a specific error here and catch it in the components to show a toast instead of redirecting immediately, in case the 401 is due to an expired session and not an invalid token
    throw new Error('Session expired');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data as any)?.error || `Error ${res.status}`);
  }
  return data as T;
}

// Types

export interface DnsRecord {
  id: number;
  hostname: string;
  ip: string;
  type: 'A' | 'AAAA' | 'CNAME' | 'TXT';
  enabled: boolean;
}

export interface StatusInfo {
  running: boolean;
  records_count: number;
  upstream_count: number;
  version: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  mustChangePassword?: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Auth

export function login(email: string, password: string) {
  return apiCall<LoginResponse>(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function getMe() {
  return apiCall<User>(`${API_BASE}/auth/me`);
}

export function changePassword(currentPassword: string, newPassword: string) {
  return apiCall<{ success: boolean; token: string }>(
    `${API_BASE}/auth/change-password`,
    {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    },
  );
}

export function forceChangePassword(newPassword: string) {
  return apiCall<{ success: boolean; token: string }>(
    `${API_BASE}/auth/change-password`,
    {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    },
  );
}

export function updateProfile(name: string, email: string) {
  return apiCall<{ success: boolean; token: string; user: User }>(
    `${API_BASE}/auth/profile`,
    {
      method: 'PUT',
      body: JSON.stringify({ name, email }),
    },
  );
}

export function fetchVersion() {
  return apiCall<{ version: string }>(`${API_BASE}/version`);
}

// DNS Records

export function fetchStatus() {
  return apiCall<StatusInfo>(`${API_BASE}/status`);
}

export function fetchRecords() {
  return apiCall<DnsRecord[]>(`${API_BASE}/dns/records`);
}

export function addRecord(hostname: string, ip: string, type: string) {
  return apiCall(`${API_BASE}/dns/records`, {
    method: 'POST',
    body: JSON.stringify({ hostname, ip, type }),
  });
}

export function toggleRecord(id: number, enabled: boolean) {
  return apiCall(`${API_BASE}/dns/records/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ enabled }),
  });
}

export function deleteRecord(id: number) {
  return apiCall(`${API_BASE}/dns/records/${id}`, { method: 'DELETE' });
}

// Upstream

export function fetchUpstream() {
  return apiCall<string[]>(`${API_BASE}/dns/upstream`);
}

export function addUpstream(server: string) {
  return apiCall(`${API_BASE}/dns/upstream`, {
    method: 'POST',
    body: JSON.stringify({ server }),
  });
}

export function deleteUpstream(server: string) {
  return apiCall(`${API_BASE}/dns/upstream/${encodeURIComponent(server)}`, {
    method: 'DELETE',
  });
}
