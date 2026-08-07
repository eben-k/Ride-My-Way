import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import authenticate from '../middleware/authenticate.js';
import { signToken } from '../auth/jwt.js';

function buildTestApp() {
  const app = express();
  app.get('/protected', authenticate, (req, res) => {
    res.status(200).json({ user: req.user });
  });
  return app;
}

describe('authenticate middleware', () => {
  it('rejects a request with no Authorization header', async () => {
    const res = await request(buildTestApp()).get('/protected');
    assert.equal(res.status, 401);
  });

  it('rejects a malformed Authorization header', async () => {
    const res = await request(buildTestApp()).get('/protected').set('Authorization', 'not-bearer-format');
    assert.equal(res.status, 401);
  });

  it('rejects an invalid token', async () => {
    const res = await request(buildTestApp()).get('/protected').set('Authorization', 'Bearer garbage.token.here');
    assert.equal(res.status, 401);
  });

  it('sets req.user and calls next for a valid token', async () => {
    const token = signToken({ id: 1, username: 'ada' });
    const res = await request(buildTestApp()).get('/protected').set('Authorization', `Bearer ${token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.user.id, 1);
    assert.equal(res.body.user.username, 'ada');
  });
});
