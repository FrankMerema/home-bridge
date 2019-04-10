import { Request, Response } from 'express';
import { MongoLogger } from '../helpers/mongo-logger/mongo-logger';

export const requestLoggerMiddleware = (req: Request, res: Response, next: (err?: any) => void, dbLogger: MongoLogger) => {
    const message = `Inbound request info: {protocol: ${req.protocol}, hostname: ${req.hostname}, ip: ${req.ip}, path: ${req.path}}`;
    dbLogger.writeLogRecord(message, 'WebServerRequest');
    next();
};
