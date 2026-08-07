import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { resetDb } from './helpers/db.js';
import { createUser } from '../data/userStore.js';
import { createRide, addRequestToRide } from '../data/rideStore.js';
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

const validRide = {
  car: 'Honda Civic', from: 'Yaba', to: 'Lekki', departureTime: '2026-08-08T08:00:00Z', seats: 3,
};

describe('POST /api/v1/users/rides', () => {
  let driver;

  beforeEach(async () => {
    await resetDb();
    driver = await createTestUser('driver1');
  });

  it('rejects an unauthenticated request', async () => {
    const res = await request(app).post('/api/v1/users/rides').send(validRide);
    assert.equal(res.status, 401);
  });

  it('creates a ride owned by the authenticated user', async () => {
    const res = await request(app)
      .post('/api/v1/users/rides')
      .set('Authorization', `Bearer ${driver.token}`)
      .send(validRide);

    assert.equal(res.status, 201);
    assert.equal(res.body.driverId, driver.id);
  });

  it('rejects an invalid payload', async () => {
    const { car, ...incomplete } = validRide;
    const res = await request(app)
      .post('/api/v1/users/rides')
      .set('Authorization', `Bearer ${driver.token}`)
      .send(incomplete);

    assert.equal(res.status, 400);
  });
});

describe('GET /api/v1/users/rides/:id/requests', () => {
  let driver;
  let otherUser;
  let ride;

  beforeEach(async () => {
    await resetDb();
    driver = await createTestUser('driver1');
    otherUser = await createTestUser('other1');
    const passenger = await createTestUser('passenger1');
    ride = await createRide({ driverId: driver.id, ...validRide });
    await addRequestToRide(ride.id, { passengerId: passenger.id });
  });

  it('lists requests with passenger names for the ride owner', async () => {
    const res = await request(app)
      .get(`/api/v1/users/rides/${ride.id}/requests`)
      .set('Authorization', `Bearer ${driver.token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].passengerName, 'Test User');
  });

  it('rejects a user who does not own the ride', async () => {
    const res = await request(app)
      .get(`/api/v1/users/rides/${ride.id}/requests`)
      .set('Authorization', `Bearer ${otherUser.token}`);

    assert.equal(res.status, 403);
  });

  it('returns 404 for an unknown ride', async () => {
    const res = await request(app)
      .get('/api/v1/users/rides/999999/requests')
      .set('Authorization', `Bearer ${driver.token}`);

    assert.equal(res.status, 404);
  });
});

describe('PUT /api/v1/users/rides/:id/requests/:requestId', () => {
  let driver;
  let otherUser;
  let ride;
  let joinRequest;

  beforeEach(async () => {
    await resetDb();
    driver = await createTestUser('driver1');
    otherUser = await createTestUser('other1');
    const passenger = await createTestUser('passenger1');
    ride = await createRide({ driverId: driver.id, ...validRide });
    joinRequest = await addRequestToRide(ride.id, { passengerId: passenger.id });
  });

  it('accepts a request for the ride owner', async () => {
    const res = await request(app)
      .put(`/api/v1/users/rides/${ride.id}/requests/${joinRequest.id}`)
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ status: 'accepted' });

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'accepted');
  });

  it('rejects an invalid status value', async () => {
    const res = await request(app)
      .put(`/api/v1/users/rides/${ride.id}/requests/${joinRequest.id}`)
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ status: 'maybe' });

    assert.equal(res.status, 400);
  });

  it('rejects a user who does not own the ride', async () => {
    const res = await request(app)
      .put(`/api/v1/users/rides/${ride.id}/requests/${joinRequest.id}`)
      .set('Authorization', `Bearer ${otherUser.token}`)
      .send({ status: 'accepted' });

    assert.equal(res.status, 403);
  });

  it('returns 404 for an unknown request', async () => {
    const res = await request(app)
      .put(`/api/v1/users/rides/${ride.id}/requests/999999`)
      .set('Authorization', `Bearer ${driver.token}`)
      .send({ status: 'accepted' });

    assert.equal(res.status, 404);
  });
});
