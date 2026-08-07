const seedRides = () => [
  {
    id: 1,
    driver: 'John',
    car: 'KIA Picanto',
    from: 'Point A',
    to: 'Point B',
    departureTime: '2026-08-08T08:00:00Z',
    seats: 3,
    requests: [],
  },
  {
    id: 2,
    driver: 'Jake',
    car: 'Toyota Matrix',
    from: 'Point A',
    to: 'Point B',
    departureTime: '2026-08-08T09:00:00Z',
    seats: 2,
    requests: [],
  },
  {
    id: 3,
    driver: 'Jane',
    car: 'Range Rover Sport',
    from: 'Point A',
    to: 'Point B',
    departureTime: '2026-08-08T10:00:00Z',
    seats: 4,
    requests: [],
  },
];

let rides = seedRides();
let nextRideId = rides.length + 1;
let nextRequestId = 1;

export function resetRides() {
  rides = seedRides();
  nextRideId = rides.length + 1;
  nextRequestId = 1;
}

export function listRides() {
  return rides;
}

export function getRideById(id) {
  return rides.find((ride) => ride.id === id);
}

export function createRide(data) {
  const ride = {
    id: nextRideId,
    ...data,
    requests: [],
  };
  nextRideId += 1;
  rides.push(ride);
  return ride;
}

export function addRequestToRide(rideId, data) {
  const ride = getRideById(rideId);
  if (!ride) return null;

  const request = {
    id: nextRequestId,
    status: 'pending',
    ...data,
  };
  nextRequestId += 1;
  ride.requests.push(request);
  return request;
}
