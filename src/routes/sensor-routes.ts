import { Request, Response, Router } from 'express';
import { SensorHandler } from '../handlers/sensor-handler';

export class SensorRoutes {

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
        this.router.put('/:hostId/:pin', (req: Request, res: Response) => this.updateState(req, res));

        this.router.delete('/:id', (req: Request, res: Response) => this.removeSensor(req, res));
    }

    private getAllSensorsForHost(req: Request, res: Response): void {
        const hostId = req.params.hostId;

        this.sensorHandler.getSensors(hostId)
            .then(sensors => {
                res.json(sensors);
            }).catch(error => {
            res.status(404).json({error: error});
        });
    }

    private getState(req: Request, res: Response): void {
        const sensorId = req.params.id;

        this.sensorHandler.getSensorState(sensorId)
            .then(status => {
                res.json({status: status});
            }).catch(error => {
            res.status(404).json({error: error});
        });
    }

    private updateState(req: Request, res: Response): void {
        const {hostId, pin} = req.params;
        const newState = req.body.state;

        this.sensorHandler.changeState(hostId, pin, newState)
            .then(() => {
                res.json({});
            }).catch(error => {
            res.status(404).json(error);
        });
    }

    private addTarget(req: Request, res: Response): void {
        const {sensorId, targetId} = req.params;

        this.sensorHandler.addTarget(sensorId, targetId)
            .then(s => {
                res.json(s);
            }).catch(error => {
            res.status(404).json(error);
        });
    }

    private addSensor(req: Request, res: Response): void {
        const {pin, hostId, name, targetId} = req.body;

        this.sensorHandler.addSensor(pin, hostId, name, targetId)
            .then(s => {
                res.json(s);
            }).catch(error => {
            res.status(404).json(error);
        });
    }

    private removeSensor(req: Request, res: Response): void {
        const sensorId = req.params.id;

        this.sensorHandler.removeSensor(sensorId)
            .then(() => {
                res.status(200).json({});
            }).catch(error => {
            res.status(404).json({error: error});
        });
    }
}
