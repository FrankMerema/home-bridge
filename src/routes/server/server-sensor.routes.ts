import { SensorHandler } from '@handlers';
import { Request, Response, Router } from 'express';

export class ServerSensorRoutes {

    private readonly router: Router;
    private sensorHandler: SensorHandler;

    constructor(sensorHandler: SensorHandler) {
        this.router = Router();
        this.sensorHandler = sensorHandler;
        this.setupRoutes();
    }

    getRouter(): Router {
        return this.router;
    }

    private setupRoutes(): void {
        this.router.get('/all/:hostId', (req: Request, res: Response) => this.getAllSensorsForHost(req, res));

        this.router.put('/:hostId/:pin', (req: Request, res: Response) => this.updateState(req, res));
    }

    private getAllSensorsForHost(req: Request, res: Response): void {
        const hostId = req.params.hostId;

        this.sensorHandler.getSensors(hostId)
            .subscribe(sensors => {
                res.json(sensors);
            }, error => {
                res.status(404).json(error);
            });
    }

    private updateState(req: Request, res: Response): void {
        const {hostId, pin} = req.params;
        const newState = req.body.state;

        this.sensorHandler.changeState(hostId, pin, newState)
            .subscribe(() => {
                res.json({});
            }, error => {
                res.status(404).json(error);
            });
    }
}
