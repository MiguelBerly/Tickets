import type { Request, Response } from 'express';
import {
    createTicket,
    listTickets,
    useTicket,
    removeTicket,
} from '../services/ticketService.ts';

export function postTicket(_req: Request, res: Response): void {
    const ticket = createTicket();
    res.status(201).json(ticket);
}

export function getTickets(_req: Request, res: Response): void {
    res.json(listTickets());
}

type CodeParams = { code: string };

export function redeemTicket(req: Request<CodeParams>, res: Response): void {
    const { code } = req.params;

    switch (useTicket(code)) {
        case 'ok':
            res.json({ code, redeemed: true });
            return;
        case 'already-used':
            res.status(409).json({ error: 'Ticket has already been used' });
            return;
        case 'not-found':
            res.status(404).json({ error: 'No ticket with that code' });
            return;
    }
}

export function deleteTicket(req: Request<CodeParams>, res: Response): void {
    const { code } = req.params;

    switch (removeTicket(code)) {
        case 'ok':
            res.sendStatus(204);
            return;
        case 'already-used':
            res.status(409).json({ error: 'Cannot delete a ticket that has been used' });
            return;
        case 'not-found':
            res.status(404).json({ error: 'No ticket with that code' });
            return;
    }
}
