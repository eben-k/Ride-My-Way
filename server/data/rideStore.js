import pool from '../db/pool.js';

function mapRide(row) {
  return {
    id: row.id,
    driverId: row.driver_id,
    car: row.car,
    from: row.from_location,
    to: row.to_location,
    departureTime: row.departure_time,
    seats: row.seats,
    createdAt: row.created_at,
  };
}

function mapRequest(row) {
  return {
    id: row.id,
    rideId: row.ride_id,
    passengerId: row.passenger_id,
    status: row.status,
    createdAt: row.created_at,
    ...(row.passenger_name !== undefined ? { passengerName: row.passenger_name } : {}),
  };
}

export async function listRides() {
  const { rows } = await pool.query('SELECT * FROM rides ORDER BY id');
  return rows.map(mapRide);
}

export async function getRideById(id) {
  const { rows } = await pool.query('SELECT * FROM rides WHERE id = $1', [id]);
  return rows[0] ? mapRide(rows[0]) : undefined;
}

export async function createRide({
  driverId, car, from, to, departureTime, seats,
}) {
  const { rows } = await pool.query(
    `INSERT INTO rides (driver_id, car, from_location, to_location, departure_time, seats)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [driverId, car, from, to, departureTime, seats],
  );
  return mapRide(rows[0]);
}

export async function addRequestToRide(rideId, { passengerId }) {
  const ride = await getRideById(rideId);
  if (!ride) return null;

  const { rows } = await pool.query(
    `INSERT INTO ride_requests (ride_id, passenger_id)
     VALUES ($1, $2)
     RETURNING *`,
    [rideId, passengerId],
  );
  return mapRequest(rows[0]);
}

export async function listRequestsForRide(rideId) {
  const { rows } = await pool.query(
    `SELECT ride_requests.*, users.name AS passenger_name
     FROM ride_requests
     JOIN users ON users.id = ride_requests.passenger_id
     WHERE ride_requests.ride_id = $1
     ORDER BY ride_requests.id`,
    [rideId],
  );
  return rows.map(mapRequest);
}

export async function listRequestsForPassenger(passengerId) {
  const { rows } = await pool.query(
    `SELECT ride_requests.id, ride_requests.ride_id, ride_requests.status, ride_requests.created_at,
            rides.car, rides.from_location, rides.to_location, rides.departure_time, rides.driver_id
     FROM ride_requests
     JOIN rides ON rides.id = ride_requests.ride_id
     WHERE ride_requests.passenger_id = $1
     ORDER BY ride_requests.id`,
    [passengerId],
  );
  return rows.map((row) => ({
    id: row.id,
    rideId: row.ride_id,
    status: row.status,
    createdAt: row.created_at,
    driverId: row.driver_id,
    car: row.car,
    from: row.from_location,
    to: row.to_location,
    departureTime: row.departure_time,
  }));
}

export async function updateRequestStatus(rideId, requestId, status) {
  const { rows } = await pool.query(
    `UPDATE ride_requests SET status = $1
     WHERE id = $2 AND ride_id = $3
     RETURNING *`,
    [status, requestId, rideId],
  );
  return rows[0] ? mapRequest(rows[0]) : null;
}
