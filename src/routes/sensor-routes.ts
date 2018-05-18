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
        this.router.get('/all/:host/:port', (req: Request, res: Response) => this.getAllSensorsForHost(req, res));
        this.router.get('/status/:id', (req: Request, res: Response) => this.getState(req, res));

        this.router.post('', (req: Request, res: Response) => this.addSensor(req, res));

        this.router.put('/:host/:port/:pin', (req: Request, res: Response) => this.updateState(req, res));

        this.router.delete('/:id', (req: Request, res: Response) => this.removeSwitch(req, res));
    }

    private getAllSensorsForHost(req: Request, res: Response): void {
        const host = req.params.host;
        const port = req.params.port;

        this.sensorHandler.getSensors(host, port)
            .then(switches => {
                res.json(switches);
            }).catch(error => {
            res.status(404).json({error: error});
        });
    }

    private getState(req: Request, res: Response): void {
        const switchId = req.params.id;

        this.sensorHandler.getSensorState(switchId)
            .then(status => {
                res.json({status: status});
            }).catch(error => {
            res.status(404).json({error: error});
        });
    }

    private updateState(req: Request, res: Response): void {
        const host = req.params.host;
        const port = req.params.port;
        const pin = req.params.pin;
        const newState = req.body.state;

        this.sensorHandler.changeState(host, port, pin, newState)
            .then(() => {
                res.json({});
            }).catch(error => {
            res.status(404).json(error);
        });
    }

    private addSensor(req: Request, res: Response): void {
        const pin = req.body.pin;
        const host = req.body.host;
        const port = req.body.port;
        const name = req.body.name;
        const targetId = req.body.targetId;

        this.sensorHandler.addSensor(pin, host, port, name, targetId)
            .then((s: any) => {
                res.json(s);
            }).catch(error => {
            res.status(404).json(error);
        });
    }

    private removeSwitch(req: Request, res: Response): void {
        const sensorId = req.params.id;

        this.sensorHandler.removeSensor(sensorId)
            .then(() => {
                res.status(200).json({});
            }).catch(error => {
            res.status(404).json({error: error});
        });
    }
}
