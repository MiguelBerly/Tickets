import express from 'express';
import ticketRoutes from './routes/ticketRoutes.ts';

const app = express();

app.use(express.json());

app.use('/api/tickets', ticketRoutes);

export default app;
