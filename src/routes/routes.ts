import { Request, Response, Router } from 'express';
import { HostHandler } from '../handlers/host-handler';
import { SensorHandler } from '../handlers/sensor-handler';
import { SwitchHandler } from '../handlers/switch-handler';
import { jwtMiddleware } from '../middleware/jwt-verifier.middleware';
import { ClientHostRoutes } from './frontend/client-host.routes';
import { ClientSensorRoutes } from './frontend/client-sensor.routes';
import { ClientSwitchRoutes } from './frontend/client-switch.routes';
import { ClientUserRoutes } from './frontend/client-user.routes';
import { ServerHostRoutes } from './server/server-host.routes';
import { ServerSensorRoutes } from './server/server-sensor.routes';
import { ServerSwitchRoutes } from './server/server-switch.routes';

export class Routes {
    private readonly router: Router;

    // TODO think of jwtMiddleware for other backends as well :)
    // TODO They can get one on saying hi

    constructor() {
        this.router = Router();
        this.setupRoutes();
    }

    getRouter(): Router {
        return this.router;
    }

    private setupRoutes(): void {
        const hostHandler = new HostHandler();
        const switchHandler = new SwitchHandler();

        // CLIENT ROUTES
        this.router.use('/user', new ClientUserRoutes().getRouter());
        this.router.use('/host', jwtMiddleware, new ClientHostRoutes(hostHandler).getRouter());
        this.router.use('/switch', jwtMiddleware, new ClientSwitchRoutes(switchHandler).getRouter());

        // SERVER ROUTES
        this.router.use('/server/host', new ServerHostRoutes(hostHandler).getRouter());
        this.router.use('/server/switch', new ServerSwitchRoutes(switchHandler).getRouter());

        switchHandler.initialize()
            .subscribe(() => {
                const sensorHandler = new SensorHandler(switchHandler);

                // CLIENT ROUTES
                this.router.use('/sensor', jwtMiddleware, new ClientSensorRoutes(sensorHandler).getRouter());

                // SERVER ROUTES
                this.router.use('/server/sensor', new ServerSensorRoutes(sensorHandler).getRouter());
            });

        this.router.get('/status', (req: Request, res: Response) => {
            res.json({status: 'OK'});
        });
    }
}
