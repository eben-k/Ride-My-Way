import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { resetRides } from '../data/rideStore.js';

describe('POST /api/v1/rides', () => {
  beforeEach(() => {
    resetRides();
  });

  const validRide = {
    driver: 'Ada',
    car: 'Honda Civic',
    from: 'Yaba',
    to: 'Lekki',
    departureTime: '2026-08-08T08:00:00Z',
    seats: 3,
  };

  it('creates a ride offer when the payload is valid', async () => {
    const res = await request(app).post('/api/v1/rides').send(validRide);

    assert.equal(res.status, 201);
    assert.equal(typeof res.body.id, 'number');
    assert.equal(res.body.driver, validRide.driver);
    assert.deepEqual(res.body.requests, []);

    const listRes = await request(app).get('/api/v1/rides');
    assert.ok(listRes.body.some((ride) => ride.id === res.body.id));
  });

  it('rejects a payload missing required fields', async () => {
    const { driver, ...incomplete } = validRide;
    const res = await request(app).post('/api/v1/rides').send(incomplete);

    assert.equal(res.status, 400);
    assert.ok(res.body.message);
  });

  it('rejects a payload with an invalid field type', async () => {
    const res = await request(app).post('/api/v1/rides').send({ ...validRide, seats: 'three' });

    assert.equal(res.status, 400);
    assert.ok(res.body.message);
  });
});
