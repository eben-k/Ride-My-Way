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

describe('GET /api/v1/users/requests', () => {
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

  it('rejects an unauthenticated request', async () => {
    const res = await request(app).get('/api/v1/users/requests');
    assert.equal(res.status, 401);
  });

  it("returns the authenticated user's own join requests with ride details", async () => {
    await addRequestToRide(ride.id, { passengerId: passenger.id });

    const res = await request(app)
      .get('/api/v1/users/requests')
      .set('Authorization', `Bearer ${passenger.token}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].rideId, ride.id);
    assert.equal(res.body[0].car, 'Honda Civic');
    assert.equal(res.body[0].status, 'pending');
  });

  it('returns an empty list for a user with no requests', async () => {
    const res = await request(app)
      .get('/api/v1/users/requests')
      .set('Authorization', `Bearer ${driver.token}`);

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, []);
  });
});
