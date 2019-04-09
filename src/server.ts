import { Request, Response } from 'express';
import { MongoLogger } from './helpers/mongo-logger/mongo-logger';
import { requestLoggerMiddleware } from './middleware/request-logger-middleware';
import { Routes } from './routes/routes';
import cookieParser = require('cookie-parser');
import RateLimit = require('express-rate-limit');
import session = require('express-session');
import helmet = require('helmet');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const config = require('../service.config.json');

export function start() {
    const port = config.serverPort || 8080;

    const dbLogger = new MongoLogger();
    const limiter = new RateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    });

    app.use(helmet());
    app.use(limiter);

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    app.use(cookieParser());
    app.use(session({
        secret: config.applicationSecret,
        resave: false,
        saveUninitialized: false
    }));

    app.use('', (req: Request, res: Response, next: (err?: any) => void) => requestLoggerMiddleware(req, res, next, dbLogger));
    app.use('/api', new Routes().getRouter());

    app.get('/status', (req: Request, res: Response) => {
        res.json({status: 'OK'});
    });

    app.listen(port, () => {
        console.log(`Express app listening on port ${port}!`);
    });
}
