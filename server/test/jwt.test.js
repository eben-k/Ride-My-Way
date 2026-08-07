import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signToken, verifyToken } from '../auth/jwt.js';

describe('jwt', () => {
  it('signs a token with three dot-separated segments', () => {
    const token = signToken({ id: 1, username: 'ada' });
    assert.equal(token.split('.').length, 3);
  });

  it('verifies a valid token and returns its payload', () => {
    const token = signToken({ id: 1, username: 'ada' });
    const payload = verifyToken(token);
    assert.equal(payload.id, 1);
    assert.equal(payload.username, 'ada');
  });

  it('throws for a tampered token', () => {
    const token = signToken({ id: 1, username: 'ada' });
    const tampered = `${token}garbage`;
    assert.throws(() => verifyToken(tampered));
  });
});
