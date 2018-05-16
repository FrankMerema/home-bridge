import { Request, Response, Router } from 'express';
import { SwitchHandler } from '../handlers/switch-handler';

export class SwitchRoutes {

    private readonly router: Router;
    private switchHandler: SwitchHandler;

    constructor() {
        this.router = Router();
        this.switchHandler = new SwitchHandler();
        this.setupRoutes();
    }

    getRouter(): Router {
        return this.router;
    }

    private setupRoutes(): void {
        this.router.get('/all/:ip/:port', (req: Request, res: Response) => this.getAllSwitchesForHost(req, res));
        this.router.get('/status/:id', (req: Request, res: Response) => this.getStatus(req, res));

        this.router.post('', (req: Request, res: Response) => this.addSwitch(req, res));
        this.router.post('/status/:id', (req: Request, res: Response) => this.changeStatus(req, res));

        this.router.delete('/:id', (req: Request, res: Response) => this.removeSwitch(req, res));
    }

    private getAllSwitchesForHost(req: Request, res: Response): void {
        const ip = req.params.ip;
        const port = req.params.port;

        this.switchHandler.getSwitches(ip, port)
            .then(switches => {
                res.json(switches);
            }).catch(error => {
            res.status(404).json({error: error});
        });
    }

    private getStatus(req: Request, res: Response): void {
        const switchId = req.params.id;

        this.switchHandler.getSwitchState(switchId)
            .then(status => {
                res.json({status: status});
            }).catch(error => {
            res.status(404).json({error: error});
        });
    }

    private changeStatus(req: Request, res: Response): void {
        const switchId = req.params.id;

        this.switchHandler.changeStatus(switchId)
            .then((updatedSwitch) => {
                res.json(updatedSwitch);
            }).catch(error => {
            res.status(404).json(error);
        });
    }

    private addSwitch(req: Request, res: Response): void {
        const pin = req.body.pin;
        const direction = req.body.direction;
        const host = req.body.host;
        const port = req.body.port;
        const name = req.body.name;

        this.switchHandler.addSwitch(pin, direction, host, port, name)
            .then((s: any) => {
                res.json(s);
            }).catch(error => {
            res.status(404).json(error);
        });
    }

    private removeSwitch(req: Request, res: Response): void {
        const switchId = req.params.id;

        this.switchHandler.removeSwitch(switchId)
            .then(() => {
                res.status(200).json({});
            }).catch(error => {
            res.status(404).json({error: error});
        });
    }
}
