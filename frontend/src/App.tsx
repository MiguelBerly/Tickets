import { useEffect, useState } from 'react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;

type Ticket = {
    id: number;
    ticket_code: string;
    created_at: string;
    redeemed_at: string | null;
};

function App() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [code, setCode] = useState('');
    const [message, setMessage] = useState<string | null>(null);

    async function request<T>(path: string, options?: RequestInit): Promise<T | null> {
        setMessage(null);
        try {
            const res = await fetch(`${API_URL}${path}`, options);

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setMessage(body.error ?? `Request failed (${res.status})`);
                return null;
            }

            return res.status === 204 ? ({} as T) : ((await res.json()) as T);
        } catch (err) {
            setMessage(err instanceof Error ? err.message : 'Request failed');
            return null;
        }
    }

    async function loadTickets() {
        const data = await request<Ticket[]>('/api/tickets');
        if (data) setTickets(data);
    }

    useEffect(() => {
        void loadTickets();
    }, []);

    async function handleCreate() {
        const created = await request<Ticket>('/api/tickets', { method: 'POST' });
        if (created) setMessage(`Created ticket ${created.ticket_code}`);
        await loadTickets();
    }

    async function handleRedeem() {
        const trimmed = code.trim();
        if (!trimmed) return;

        const ok = await request(`/api/tickets/${trimmed}/redeem`, { method: 'POST' });
        if (ok) {
            setMessage(`Ticket ${trimmed} redeemed`);
            setCode('');
        }
        await loadTickets();
    }

    async function handleDelete(ticketCode: string) {
        const ok = await request(`/api/tickets/${ticketCode}`, { method: 'DELETE' });
        if (ok) setMessage(`Ticket ${ticketCode} deleted`);
        await loadTickets();
    }

    return (
        <main>
            <h1>Ticket system</h1>

            <section className="actions">
                <button type="button" onClick={handleCreate}>
                    Create ticket
                </button>

                <span className="redeem">
                    <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Ticket code"
                        aria-label="Ticket code"
                    />
                    <button type="button" onClick={handleRedeem}>
                        Use ticket
                    </button>
                </span>

                <button type="button" onClick={loadTickets}>
                    Refresh
                </button>
            </section>

            {message && <p className="message">{message}</p>}

            <table>
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th />
                    </tr>
                </thead>
                <tbody>
                    {tickets.length === 0 && (
                        <tr>
                            <td colSpan={4} className="empty">
                                No tickets yet.
                            </td>
                        </tr>
                    )}
                    {tickets.map((ticket) => {
                        const used = ticket.redeemed_at !== null;
                        return (
                            <tr key={ticket.id}>
                                <td className="code">{ticket.ticket_code}</td>
                                <td className={used ? 'used' : 'unused'}>
                                    {used ? `Used ${ticket.redeemed_at}` : 'Unused'}
                                </td>
                                <td>{ticket.created_at}</td>
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(ticket.ticket_code)}
                                        disabled={used}
                                        title={used ? 'Used tickets cannot be deleted' : undefined}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </main>
    );
}

export default App;
