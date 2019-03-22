import { HostHandler, SensorHandler, SwitchHandler } from '@handlers';
import { jwtMiddleware } from '@middleware';
import { ClientHostRoutes, ClientSensorRoutes, ClientSwitchRoutes, ClientUserRoutes } from '@routes/frontend';
import { ServerHostRoutes, ServerSensorRoutes, ServerSwitchRoutes } from '@routes/server';
import { Request, Response, Router } from 'express';

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
