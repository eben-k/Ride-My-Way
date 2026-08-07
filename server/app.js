import express from 'express';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import ridesRouter from './routes/rides.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/v1/rides', ridesRouter);

export default app;
