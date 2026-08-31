import db from '../config/db.ts';

db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY,
        ticket_code TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        redeemed_at TEXT NULL
    )
`);

export type Ticket = {
    id: number;
    ticket_code: string;
    created_at: string;
    redeemed_at: string | null;
};

const insertStm = db.prepare<[string], Ticket>(
    'INSERT INTO tickets (ticket_code) VALUES (?) RETURNING *'
);

const getAllStm = db.prepare<[], Ticket>(
    'SELECT * FROM tickets ORDER BY id DESC'
);

const findByCodeStm = db.prepare<[string], Ticket>(
    'SELECT * FROM tickets WHERE ticket_code = ?'
);

const redeemTicketStm = db.prepare<[string]>(`
    UPDATE tickets
    SET redeemed_at = datetime('now')
    WHERE ticket_code = ?
      AND redeemed_at IS NULL
`);

const deleteTicketStm = db.prepare<[string]>(`
    DELETE FROM tickets
    WHERE ticket_code = ?
      AND redeemed_at IS NULL
`);

export function insertTicket(code: string): Ticket {
    return insertStm.get(code)!;
}

export function findAllTickets(): Ticket[] {
    return getAllStm.all();
}

export function findTicketByCode(code: string): Ticket | undefined {
    return findByCodeStm.get(code);
}

export function redeemTicket(code: string): boolean {
    return redeemTicketStm.run(code).changes === 1;
}

export function deleteTicket(code: string): boolean {
    return deleteTicketStm.run(code).changes === 1;
}
