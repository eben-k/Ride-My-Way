import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { resetRides } from '../data/rideStore.js';

describe('GET /api/v1/rides', () => {
  beforeEach(() => {
    resetRides();
  });

  it('returns all ride offers', async () => {
    const res = await request(app).get('/api/v1/rides');

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length > 0);
    assert.ok('id' in res.body[0]);
  });
});

describe('GET /api/v1/rides/:id', () => {
  beforeEach(() => {
    resetRides();
  });

  it('returns a single ride offer when it exists', async () => {
    const listRes = await request(app).get('/api/v1/rides');
    const [firstRide] = listRes.body;

    const res = await request(app).get(`/api/v1/rides/${firstRide.id}`);

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, firstRide);
  });

  it('returns 404 when the ride does not exist', async () => {
    const res = await request(app).get('/api/v1/rides/999999');

    assert.equal(res.status, 404);
    assert.ok(res.body.message);
  });
});
