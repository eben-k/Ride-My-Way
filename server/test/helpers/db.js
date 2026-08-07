import pool from '../../db/pool.js';

export async function resetDb() {
  await pool.query('TRUNCATE users, rides, ride_requests RESTART IDENTITY CASCADE');
}
