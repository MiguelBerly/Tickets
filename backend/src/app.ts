import express from 'express';
import { corsMiddleware } from './middleware/corsMiddleware.ts';
import ticketRoutes from './routes/ticketRoutes.ts';

const app = express();

app.use(corsMiddleware);

app.use(express.json());

app.use('/api/tickets', ticketRoutes);

export default app;
