import pool from '../db/pool.js';

export async function createUser({
  name, username, email, phone, passwordHash,
}) {
  const { rows } = await pool.query(
    `INSERT INTO users (name, username, email, phone, password_hash)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, username, email, phone, created_at`,
    [name, username, email, phone, passwordHash],
  );
  return rows[0];
}

export async function findUserByUsername(username) {
  const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return rows[0];
}

export async function findUserById(id) {
  const { rows } = await pool.query(
    'SELECT id, name, username, email, phone, created_at FROM users WHERE id = $1',
    [id],
  );
  return rows[0];
}
