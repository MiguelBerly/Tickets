import { Router } from 'express';
import {
    postTicket,
    getTickets,
    redeemTicket,
    deleteTicket,
} from '../controllers/ticketController.ts';

const router = Router();

// Paths are relative to where this router is mounted (see app.ts).
router.post('/', postTicket);
router.get('/', getTickets);
router.post('/:code/redeem', redeemTicket);
router.delete('/:code', deleteTicket);

export default router;
