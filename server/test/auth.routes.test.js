import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { resetDb } from './helpers/db.js';
import { verifyToken } from '../auth/jwt.js';

const validSignup = {
  name: 'Ada Lovelace',
  username: 'ada',
  email: 'ada@rmw.com',
  phone: '5551234',
  password: 'correct horse battery staple',
};

describe('POST /api/v1/auth/signup', () => {
  beforeEach(async () => {
    await resetDb();
  });

  it('creates an account and does not return the password', async () => {
    const res = await request(app).post('/api/v1/auth/signup').send(validSignup);

    assert.equal(res.status, 201);
    assert.equal(res.body.username, 'ada');
    assert.equal('password' in res.body, false);
    assert.equal('password_hash' in res.body, false);
  });

  it('rejects a payload missing required fields', async () => {
    const { password, ...incomplete } = validSignup;
    const res = await request(app).post('/api/v1/auth/signup').send(incomplete);

    assert.equal(res.status, 400);
    assert.ok(res.body.message);
  });

  it('rejects a duplicate username', async () => {
    await request(app).post('/api/v1/auth/signup').send(validSignup);
    const res = await request(app).post('/api/v1/auth/signup').send(validSignup);

    assert.equal(res.status, 409);
    assert.ok(res.body.message);
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    await resetDb();
    await request(app).post('/api/v1/auth/signup').send(validSignup);
  });

  it('logs in with correct credentials and returns a valid token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'ada', password: validSignup.password });

    assert.equal(res.status, 200);
    const payload = verifyToken(res.body.token);
    assert.equal(payload.username, 'ada');
  });

  it('rejects an incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'ada', password: 'wrong password' });

    assert.equal(res.status, 401);
    assert.ok(res.body.message);
  });

  it('rejects an unknown username', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ username: 'unknown', password: 'whatever' });

    assert.equal(res.status, 401);
    assert.ok(res.body.message);
  });
});
