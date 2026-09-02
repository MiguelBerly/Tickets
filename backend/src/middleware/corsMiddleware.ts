import type { Request, Response, NextFunction } from 'express';

const ALLOWED_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

const ALLOWED_METHODS = 'GET, POST, DELETE, OPTIONS';

const ALLOWED_HEADERS = 'Content-Type';

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS);
    res.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS);
    res.setHeader('Vary', 'Origin');

    if (req.method === 'OPTIONS') {
        res.sendStatus(204);
        return;
    }

    next();
}
