CREATE TABLE rides (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER NOT NULL REFERENCES users(id),
  car TEXT NOT NULL,
  from_location TEXT NOT NULL,
  to_location TEXT NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  seats INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
