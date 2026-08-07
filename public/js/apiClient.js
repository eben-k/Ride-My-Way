export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new ApiError(data.message || 'Request failed', res.status);
  }
  return data;
}

export function signup(payload) {
  return apiFetch('/api/v1/auth/signup', { method: 'POST', body: payload });
}

export function login(credentials) {
  return apiFetch('/api/v1/auth/login', { method: 'POST', body: credentials });
}

export function getRides(token) {
  return apiFetch('/api/v1/rides', { token });
}

export function getRide(id, token) {
  return apiFetch(`/api/v1/rides/${id}`, { token });
}

export function requestToJoinRide(id, token) {
  return apiFetch(`/api/v1/rides/${id}/requests`, { method: 'POST', token });
}

export function createRide(payload, token) {
  return apiFetch('/api/v1/users/rides', { method: 'POST', body: payload, token });
}

export function getRideRequests(rideId, token) {
  return apiFetch(`/api/v1/users/rides/${rideId}/requests`, { token });
}

export function updateRequestStatus(rideId, requestId, status, token) {
  return apiFetch(`/api/v1/users/rides/${rideId}/requests/${requestId}`, {
    method: 'PUT',
    body: { status },
    token,
  });
}

export function getMyRequests(token) {
  return apiFetch('/api/v1/users/requests', { token });
}
