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

    // Serve the Frontend
    // app.use(express.static(path.join(__dirname, '../dist')));

    app.use('/api', new Routes().getRouter());

    // Catch all urls not defined and serve Frontend
    // app.get('*', (req: Request, res: Response) => {
    //     res.sendFile(path.join(__dirname, '../dist/index.html'));
    // });

    app.listen(port, () => {
        console.log(`Express app listening on port ${port}!`);
    });
}
