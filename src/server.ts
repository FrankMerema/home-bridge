import { Request, Response } from 'express';
import { HostHandler } from './handlers/host-handler';
import { SensorHandler } from './handlers/sensor-handler';
import { SwitchHandler } from './handlers/switch-handler';
import { HostRoutes } from './routes/host-routes';
import { SensorRoutes } from './routes/sensor-routes';
import { SwitchRoutes } from './routes/switch-routes';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const config = require('../service.config.json');

export function start() {
    const port = config.serverPort || 8080;

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    const hostHandler = new HostHandler();
    const switchHandler = new SwitchHandler();
    app.use('/api/host', new HostRoutes(hostHandler).getRouter());
    app.use('/api/switch', new SwitchRoutes(switchHandler).getRouter());


    switchHandler.initialize()
        .then(() => {
            const sensorHandler = new SensorHandler(switchHandler);
            app.use('/api/sensor', new SensorRoutes(sensorHandler).getRouter());
        });


    // app.use('/api/tahoma', new TahomaRoutes(plugin.host, plugin.port).getRouter());

    app.get('/api/status', (req: Request, res: Response) => {
        res.json({status: 'OK'});
    });


    app.listen(port, () => {
        console.log(`Express app listening on port ${port}!`);
    });
}
