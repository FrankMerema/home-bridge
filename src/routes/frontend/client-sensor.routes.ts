import { Request, Response, Router } from 'express';
import { SensorHandler } from '../../handlers/sensor-handler';

export class ClientSensorRoutes {

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
        this.router.get('/status/:id', (req: Request, res: Response) => this.getState(req, res));

        this.router.post('', (req: Request, res: Response) => this.addSensor(req, res));

        this.router.put('/:id/target/:targetId', (req: Request, res: Response) => this.addTarget(req, res));

        this.router.delete('/:id', (req: Request, res: Response) => this.removeSensor(req, res));
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

    private getState(req: Request, res: Response): void {
        const sensorId = req.params.id;

        this.sensorHandler.getSensorState(sensorId)
            .subscribe(status => {
                res.json({status: status});
            }, error => {
                res.status(404).json(error);
            });
    }

    private addTarget(req: Request, res: Response): void {
        const {sensorId, targetId} = req.params;

        this.sensorHandler.addTarget(sensorId, targetId)
            .subscribe(s => {
                res.json(s);
            }, error => {
                res.status(404).json(error);
            });
    }

    private addSensor(req: Request, res: Response): void {
        const {pin, hostId, name, targetId} = req.body;

        this.sensorHandler.addSensor(pin, hostId, name, targetId)
            .subscribe(s => {
                res.json(s);
            }, error => {
                res.status(404).json(error);
            });
    }

    private removeSensor(req: Request, res: Response): void {
        const sensorId = req.params.id;

        this.sensorHandler.removeSensor(sensorId)
            .subscribe(() => {
                res.status(200).json({});
            }, error => {
                res.status(404).json(error);
            });
    }
}
