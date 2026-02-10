// Minimal auth helper: refresh access token via HttpOnly refresh cookie
export async function refreshAccessToken() {
  const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
  if (!res.ok) throw new Error('Failed to refresh token');
  const data = await res.json();
  return data.accessToken;
}
