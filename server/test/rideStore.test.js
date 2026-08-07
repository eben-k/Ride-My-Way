import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  listRides, getRideById, createRide, addRequestToRide, resetRides,
} from '../data/rideStore.js';

describe('rideStore', () => {
  beforeEach(() => {
    resetRides();
  });

  it('lists the seeded rides', () => {
    const rides = listRides();
    assert.ok(Array.isArray(rides));
    assert.ok(rides.length > 0);
  });

  it('finds a ride by id', () => {
    const [first] = listRides();
    const found = getRideById(first.id);
    assert.deepEqual(found, first);
  });

  it('returns undefined for an unknown id', () => {
    assert.equal(getRideById(999999), undefined);
  });

  it('creates a new ride with a generated id and empty requests', () => {
    const before = listRides().length;
    const ride = createRide({
      driver: 'Ada',
      car: 'Honda Civic',
      from: 'Yaba',
      to: 'Lekki',
      departureTime: '2026-08-08T08:00:00Z',
      seats: 3,
    });

    assert.equal(typeof ride.id, 'number');
    assert.deepEqual(ride.requests, []);
    assert.equal(listRides().length, before + 1);
    assert.deepEqual(getRideById(ride.id), ride);
  });

  it('adds a join request to an existing ride', () => {
    const [ride] = listRides();
    const request = addRequestToRide(ride.id, { passenger: 'Bola' });

    assert.equal(typeof request.id, 'number');
    assert.equal(request.passenger, 'Bola');
    assert.equal(request.status, 'pending');
    assert.equal(getRideById(ride.id).requests.length, 1);
  });

  it('returns null when adding a request to an unknown ride', () => {
    const request = addRequestToRide(999999, { passenger: 'Bola' });
    assert.equal(request, null);
  });
});
