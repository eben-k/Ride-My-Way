import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  listRides, getRideById, createRide, addRequestToRide, listRequestsForRide, updateRequestStatus,
  listRequestsForPassenger,
} from '../data/rideStore.js';
import { createUser } from '../data/userStore.js';
import { resetDb } from './helpers/db.js';

const newRidePayload = (driverId) => ({
  driverId,
  car: 'Honda Civic',
  from: 'Yaba',
  to: 'Lekki',
  departureTime: '2026-08-08T08:00:00Z',
  seats: 3,
});

async function createTestUser(username) {
  return createUser({
    name: 'Test User',
    username,
    email: `${username}@rmw.com`,
    phone: '5551234',
    passwordHash: 'salt:hash',
  });
}

describe('rideStore', () => {
  let driver;

  beforeEach(async () => {
    await resetDb();
    driver = await createTestUser('driver1');
  });

  it('lists no rides when none exist', async () => {
    assert.deepEqual(await listRides(), []);
  });

  it('creates and lists a ride', async () => {
    const ride = await createRide(newRidePayload(driver.id));

    assert.equal(typeof ride.id, 'number');
    assert.equal(ride.driverId, driver.id);
    assert.equal(ride.from, 'Yaba');
    assert.equal(ride.to, 'Lekki');

    const rides = await listRides();
    assert.equal(rides.length, 1);
    assert.equal(rides[0].id, ride.id);
  });

  it('finds a ride by id', async () => {
    const ride = await createRide(newRidePayload(driver.id));
    const found = await getRideById(ride.id);
    assert.deepEqual(found, ride);
  });

  it('returns undefined for an unknown ride id', async () => {
    assert.equal(await getRideById(999999), undefined);
  });

  it('adds a join request to an existing ride', async () => {
    const ride = await createRide(newRidePayload(driver.id));
    const passenger = await createTestUser('passenger1');

    const joinRequest = await addRequestToRide(ride.id, { passengerId: passenger.id });

    assert.equal(typeof joinRequest.id, 'number');
    assert.equal(joinRequest.rideId, ride.id);
    assert.equal(joinRequest.passengerId, passenger.id);
    assert.equal(joinRequest.status, 'pending');
  });

  it('returns null when adding a request to an unknown ride', async () => {
    const passenger = await createTestUser('passenger1');
    const result = await addRequestToRide(999999, { passengerId: passenger.id });
    assert.equal(result, null);
  });

  it('lists requests for a ride with the passenger name joined', async () => {
    const ride = await createRide(newRidePayload(driver.id));
    const passenger = await createTestUser('passenger1');
    await addRequestToRide(ride.id, { passengerId: passenger.id });

    const requests = await listRequestsForRide(ride.id);

    assert.equal(requests.length, 1);
    assert.equal(requests[0].passengerName, 'Test User');
    assert.equal(requests[0].status, 'pending');
  });

  it('updates a request status', async () => {
    const ride = await createRide(newRidePayload(driver.id));
    const passenger = await createTestUser('passenger1');
    const joinRequest = await addRequestToRide(ride.id, { passengerId: passenger.id });

    const updated = await updateRequestStatus(ride.id, joinRequest.id, 'accepted');

    assert.equal(updated.status, 'accepted');
  });

  it('returns null when updating a request that does not belong to the ride', async () => {
    const ride = await createRide(newRidePayload(driver.id));
    const otherRide = await createRide(newRidePayload(driver.id));
    const passenger = await createTestUser('passenger1');
    const joinRequest = await addRequestToRide(ride.id, { passengerId: passenger.id });

    const updated = await updateRequestStatus(otherRide.id, joinRequest.id, 'accepted');

    assert.equal(updated, null);
  });

  it('lists a passenger\'s own join requests with ride details', async () => {
    const ride = await createRide(newRidePayload(driver.id));
    const passenger = await createTestUser('passenger1');
    await addRequestToRide(ride.id, { passengerId: passenger.id });

    const requests = await listRequestsForPassenger(passenger.id);

    assert.equal(requests.length, 1);
    assert.equal(requests[0].rideId, ride.id);
    assert.equal(requests[0].car, 'Honda Civic');
    assert.equal(requests[0].from, 'Yaba');
    assert.equal(requests[0].to, 'Lekki');
    assert.equal(requests[0].status, 'pending');
  });

  it('lists no requests for a passenger with none', async () => {
    const passenger = await createTestUser('passenger1');
    assert.deepEqual(await listRequestsForPassenger(passenger.id), []);
  });
});
