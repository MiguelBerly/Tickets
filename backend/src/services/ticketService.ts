import { randomInt } from 'node:crypto';
import {
    insertTicket,
    findAllTickets,
    redeemTicket,
    deleteTicket,
    findTicketByCode,
    type Ticket,
} from '../models/Ticket.ts';


function isUniqueConstraintError(err: unknown): err is { code: string } {
    return (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        err.code === 'SQLITE_CONSTRAINT_UNIQUE'
    );
}

const MAX_ATTEMPTS = 10;

export function createTicket(): Ticket {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const code = String(randomInt(100_000, 1_000_000));
        try {
            return insertTicket(code);
        } catch (err) {
            if (!isUniqueConstraintError(err)) throw err;
        }
    }
    throw new Error(`Unable to generate a unique ticket after ${MAX_ATTEMPTS} attempts`);
}

export function listTickets(): Ticket[] {
    return findAllTickets();
}

export type TicketOutcome = 'ok' | 'already-used' | 'not-found';

export function useTicket(code: string): TicketOutcome {
    if (redeemTicket(code)) return 'ok';
    return findTicketByCode(code) ? 'already-used' : 'not-found';
}

export function removeTicket(code: string): TicketOutcome {
    if (deleteTicket(code)) return 'ok';
    return findTicketByCode(code) ? 'already-used' : 'not-found';
}
