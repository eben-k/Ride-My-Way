import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getToken, setToken, clearToken, parseJwtPayload } from '../auth.js';

function fakeStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
  };
}

describe('token storage', () => {
  it('returns null when no token is stored', () => {
    assert.equal(getToken(fakeStorage()), null);
  });

  it('stores and retrieves a token', () => {
    const storage = fakeStorage();
    setToken('abc.def.ghi', storage);
    assert.equal(getToken(storage), 'abc.def.ghi');
  });

  it('clears a stored token', () => {
    const storage = fakeStorage();
    setToken('abc.def.ghi', storage);
    clearToken(storage);
    assert.equal(getToken(storage), null);
  });
});

describe('parseJwtPayload', () => {
  it('decodes the payload segment of a JWT', () => {
    const payload = { id: 1, username: 'ada' };
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const token = `header.${payloadB64}.signature`;

    assert.deepEqual(parseJwtPayload(token), payload);
  });
});
