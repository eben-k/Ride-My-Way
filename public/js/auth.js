const TOKEN_KEY = 'ridemyway_token';

export function getToken(storage = localStorage) {
  return storage.getItem(TOKEN_KEY);
}

export function setToken(token, storage = localStorage) {
  storage.setItem(TOKEN_KEY, token);
}

export function clearToken(storage = localStorage) {
  storage.removeItem(TOKEN_KEY);
}

export function parseJwtPayload(token) {
  const [, payloadB64] = token.split('.');
  const normalized = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(normalized));
}

export function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = 'signin.html';
    return null;
  }
  return token;
}
