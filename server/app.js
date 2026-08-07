import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ridesRouter from './routes/rides.js';
import authRouter from './routes/auth.js';
import userRidesRouter from './routes/userRides.js';
import userRequestsRouter from './routes/userRequests.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/rides', ridesRouter);
app.use('/api/v1/users/rides', userRidesRouter);
app.use('/api/v1/users/requests', userRequestsRouter);

export default app;
