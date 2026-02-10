/**
 * API helper with automatic token refresh on 401 errors
 * Handles authentication headers and token refresh transparently
 */

let authContext = null;

export function setAuthContext(context) {
  authContext = context;
}

async function fetchWithAuth(url, options = {}) {
  // Get access token if auth context is available
  let token = null;
  if (authContext?.getAccessToken) {
    token = await authContext.getAccessToken();
  }
  
  // Add Authorization header if token is available
  const headers = {
    ...options.headers,
  };

  // Only set Content-Type if not already set
  if (!headers['Content-Type'] && !headers['content-type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Make the request
  let response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle 401 Unauthorized - try to refresh token once
  if (response.status === 401 && authContext) {
    const newToken = await authContext.refreshToken();
    
    if (newToken) {
      // Retry the request with new token
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });
    } else {
      // Refresh failed - user will be logged out by refreshToken
      throw new Error('Authentication failed');
    }
  }

  // Handle 403 Forbidden
  if (response.status === 403) {
    throw new Error('Access forbidden');
  }

  return response;
}

export async function apiGet(url, options = {}) {
  const response = await fetchWithAuth(url, { ...options, method: 'GET' });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

export async function apiPost(url, data, options = {}) {
  const response = await fetchWithAuth(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

export async function apiPut(url, data, options = {}) {
  const response = await fetchWithAuth(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

export async function apiDelete(url, options = {}) {
  const response = await fetchWithAuth(url, { ...options, method: 'DELETE' });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}
