import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { resetDb } from './helpers/db.js';
import { createUser } from '../data/userStore.js';
import { createRide } from '../data/rideStore.js';
import { signToken } from '../auth/jwt.js';

async function createTestUser(username) {
  const user = await createUser({
    name: 'Test User',
    username,
    email: `${username}@rmw.com`,
    phone: '5551234',
    passwordHash: 'salt:hash',
  });
  return { ...user, token: signToken({ id: user.id, username: user.username }) };
}

describe('GET /api/v1/rides', () => {
  let driver;

  beforeEach(async () => {
    await resetDb();
    driver = await createTestUser('driver1');
  });

  it('rejects an unauthenticated request', async () => {
    const res = await request(app).get('/api/v1/rides');
    assert.equal(res.status, 401);
  });

  it('returns all rides for an authenticated request', async () => {
    await createRide({
      driverId: driver.id, car: 'Honda Civic', from: 'Yaba', to: 'Lekki', departureTime: '2026-08-08T08:00:00Z', seats: 3,
    });

    const res = await request(app).get('/api/v1/rides').set('Authorization', `Bearer ${driver.token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
  });
});

describe('GET /api/v1/rides/:id', () => {
  let driver;

  beforeEach(async () => {
    await resetDb();
    driver = await createTestUser('driver1');
  });

  it('returns a single ride when it exists', async () => {
    const ride = await createRide({
      driverId: driver.id, car: 'Honda Civic', from: 'Yaba', to: 'Lekki', departureTime: '2026-08-08T08:00:00Z', seats: 3,
    });

    const res = await request(app).get(`/api/v1/rides/${ride.id}`).set('Authorization', `Bearer ${driver.token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.id, ride.id);
  });

  it('returns 404 when the ride does not exist', async () => {
    const res = await request(app).get('/api/v1/rides/999999').set('Authorization', `Bearer ${driver.token}`);
    assert.equal(res.status, 404);
  });
});

describe('POST /api/v1/rides/:id/requests', () => {
  let driver;
  let passenger;
  let ride;

  beforeEach(async () => {
    await resetDb();
    driver = await createTestUser('driver1');
    passenger = await createTestUser('passenger1');
    ride = await createRide({
      driverId: driver.id, car: 'Honda Civic', from: 'Yaba', to: 'Lekki', departureTime: '2026-08-08T08:00:00Z', seats: 3,
    });
  });

  it('returns 404 when the ride does not exist', async () => {
    const res = await request(app)
      .post('/api/v1/rides/999999/requests')
      .set('Authorization', `Bearer ${passenger.token}`);
    assert.equal(res.status, 404);
  });

  it('rejects a driver requesting to join their own ride', async () => {
    const res = await request(app)
      .post(`/api/v1/rides/${ride.id}/requests`)
      .set('Authorization', `Bearer ${driver.token}`);
    assert.equal(res.status, 400);
  });

  it('creates a join request for an authenticated passenger', async () => {
    const res = await request(app)
      .post(`/api/v1/rides/${ride.id}/requests`)
      .set('Authorization', `Bearer ${passenger.token}`);

    assert.equal(res.status, 201);
    assert.equal(res.body.passengerId, passenger.id);
    assert.equal(res.body.status, 'pending');
  });
});
