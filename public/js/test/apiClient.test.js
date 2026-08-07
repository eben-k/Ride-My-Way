import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ApiError, signup, login, getRides, getRide, requestToJoinRide, createRide,
  getRideRequests, updateRequestStatus, getMyRequests,
} from '../apiClient.js';

function mockFetchOnce(t, { status = 200, body = {} } = {}) {
  const fn = t.mock.fn(async () => new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  }));
  t.mock.method(globalThis, 'fetch', fn);
  return fn;
}

describe('apiClient', () => {
  it('signup posts to /api/v1/auth/signup with no auth header', async (t) => {
    const fetchMock = mockFetchOnce(t, { status: 201, body: { id: 1, username: 'ada' } });

    const result = await signup({ username: 'ada' });

    const [url, options] = fetchMock.mock.calls[0].arguments;
    assert.equal(url, '/api/v1/auth/signup');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), { username: 'ada' });
    assert.equal(options.headers.Authorization, undefined);
    assert.equal(result.username, 'ada');
  });

  it('login posts to /api/v1/auth/login and returns the token', async (t) => {
    mockFetchOnce(t, { status: 200, body: { token: 'a.b.c' } });

    const result = await login({ username: 'ada', password: 'secret' });

    assert.equal(result.token, 'a.b.c');
  });

  it('getRides sends the Authorization header', async (t) => {
    const fetchMock = mockFetchOnce(t, { status: 200, body: [] });

    await getRides('token-123');

    const [url, options] = fetchMock.mock.calls[0].arguments;
    assert.equal(url, '/api/v1/rides');
    assert.equal(options.headers.Authorization, 'Bearer token-123');
  });

  it('getRide fetches a single ride by id', async (t) => {
    const fetchMock = mockFetchOnce(t, { status: 200, body: { id: 5 } });

    const result = await getRide(5, 'token-123');

    const [url] = fetchMock.mock.calls[0].arguments;
    assert.equal(url, '/api/v1/rides/5');
    assert.equal(result.id, 5);
  });

  it('requestToJoinRide posts to the requests endpoint', async (t) => {
    const fetchMock = mockFetchOnce(t, { status: 201, body: { id: 1, status: 'pending' } });

    await requestToJoinRide(5, 'token-123');

    const [url, options] = fetchMock.mock.calls[0].arguments;
    assert.equal(url, '/api/v1/rides/5/requests');
    assert.equal(options.method, 'POST');
  });

  it('createRide posts to /api/v1/users/rides with the payload', async (t) => {
    const fetchMock = mockFetchOnce(t, { status: 201, body: { id: 1 } });

    await createRide({ car: 'Civic' }, 'token-123');

    const [url, options] = fetchMock.mock.calls[0].arguments;
    assert.equal(url, '/api/v1/users/rides');
    assert.deepEqual(JSON.parse(options.body), { car: 'Civic' });
  });

  it('getRideRequests fetches requests for a ride the user owns', async (t) => {
    const fetchMock = mockFetchOnce(t, { status: 200, body: [] });

    await getRideRequests(5, 'token-123');

    const [url] = fetchMock.mock.calls[0].arguments;
    assert.equal(url, '/api/v1/users/rides/5/requests');
  });

  it('updateRequestStatus PUTs the new status', async (t) => {
    const fetchMock = mockFetchOnce(t, { status: 200, body: { status: 'accepted' } });

    await updateRequestStatus(5, 9, 'accepted', 'token-123');

    const [url, options] = fetchMock.mock.calls[0].arguments;
    assert.equal(url, '/api/v1/users/rides/5/requests/9');
    assert.equal(options.method, 'PUT');
    assert.deepEqual(JSON.parse(options.body), { status: 'accepted' });
  });

  it('getMyRequests fetches the authenticated user\'s own requests', async (t) => {
    const fetchMock = mockFetchOnce(t, { status: 200, body: [] });

    await getMyRequests('token-123');

    const [url] = fetchMock.mock.calls[0].arguments;
    assert.equal(url, '/api/v1/users/requests');
  });

  it('throws an ApiError with the response message and status on failure', async (t) => {
    mockFetchOnce(t, { status: 400, body: { message: 'Invalid payload' } });

    await assert.rejects(
      () => getRides('token-123'),
      (error) => {
        assert.ok(error instanceof ApiError);
        assert.equal(error.status, 400);
        assert.equal(error.message, 'Invalid payload');
        return true;
      },
    );
  });
});
