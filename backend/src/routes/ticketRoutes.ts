import { Router } from 'express';
import {
    postTicket,
    getTickets,
    redeemTicket,
    deleteTicket,
} from '../controllers/ticketController.ts';

const router = Router();

router.post('/', postTicket);
router.get('/', getTickets);
router.post('/:code/redeem', redeemTicket);
router.delete('/:code', deleteTicket);

export default router;
