import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { resetRides } from '../data/rideStore.js';

describe('POST /api/v1/rides/:id/requests', () => {
  beforeEach(() => {
    resetRides();
  });

  it('returns 404 when the ride does not exist', async () => {
    const res = await request(app)
      .post('/api/v1/rides/999999/requests')
      .send({ passenger: 'Bola' });

    assert.equal(res.status, 404);
    assert.ok(res.body.message);
  });

  it('rejects a payload missing the passenger name', async () => {
    const listRes = await request(app).get('/api/v1/rides');
    const [ride] = listRes.body;

    const res = await request(app).post(`/api/v1/rides/${ride.id}/requests`).send({});

    assert.equal(res.status, 400);
    assert.ok(res.body.message);
  });

  it('creates a join request against an existing ride', async () => {
    const listRes = await request(app).get('/api/v1/rides');
    const [ride] = listRes.body;

    const res = await request(app)
      .post(`/api/v1/rides/${ride.id}/requests`)
      .send({ passenger: 'Bola' });

    assert.equal(res.status, 201);
    assert.equal(res.body.passenger, 'Bola');
    assert.equal(res.body.status, 'pending');

    const rideRes = await request(app).get(`/api/v1/rides/${ride.id}`);
    assert.equal(rideRes.body.requests.length, 1);
  });
});
