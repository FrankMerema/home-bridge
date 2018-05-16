import { Request, Response } from 'express';
import { HostRoutes } from './routes/host-routes';
import { SwitchRoutes } from './routes/switch-routes';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const config = require('../service.config.json');

export function start() {
    const port = config.serverPort || 8080;

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    app.use('/api/host', new HostRoutes().getRouter());
    app.use('/api/switch', new SwitchRoutes().getRouter());
    // app.use('/api/tahoma', new TahomaRoutes(plugin.host, plugin.port).getRouter());

    app.get('/api/status', (req: Request, res: Response) => {
        res.json({status: 'OK'});
    });


    app.listen(port, () => {
        console.log(`Express app listening on port ${port}!`);
    });
}
