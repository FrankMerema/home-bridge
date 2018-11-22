import { Request, Response, Router } from 'express';
import { SwitchHandler } from '../../handlers/switch-handler';

export class ClientSwitchRoutes {

    private readonly router: Router;
    private switchHandler: SwitchHandler;

    constructor(switchHandler: SwitchHandler) {
        this.router = Router();
        this.switchHandler = switchHandler;
        this.setupRoutes();
    }

    getRouter(): Router {
        return this.router;
    }

    private setupRoutes(): void {
        this.router.get('/all/:hostId', (req: Request, res: Response) => this.getAllSwitchesForHost(req, res));
        this.router.get('/status/:id', (req: Request, res: Response) => this.getState(req, res));

        this.router.post('', (req: Request, res: Response) => this.addSwitch(req, res));
        this.router.post('/status/:id', (req: Request, res: Response) => this.changeState(req, res));

        this.router.delete('/:id', (req: Request, res: Response) => this.removeSwitch(req, res));
    }

    private getAllSwitchesForHost(req: Request, res: Response): void {
        const hostId = req.params.hostId;

        this.switchHandler.getSwitches(hostId)
            .subscribe(switches => {
                res.json(switches);
            }, error => {
                res.status(400).json(error);
            });
    }

    private getState(req: Request, res: Response): void {
        const switchId = req.params.id;

        this.switchHandler.getSwitchState(switchId)
            .subscribe(status => {
                res.json({status: status});
            }, error => {
                res.status(400).json(error);
            });
    }

    private changeState(req: Request, res: Response): void {
        const switchId = req.params.id;

        this.switchHandler.changeState(switchId)
            .subscribe((updatedSwitch) => {
                res.json(updatedSwitch);
            }, error => {
                res.status(400).json(error);
            });
    }

    private addSwitch(req: Request, res: Response): void {
        const {pin, hostId, name} = req.body;

        this.switchHandler.addSwitch(pin, hostId, name)
            .subscribe(s => {
                res.json(s);
            }, error => {
                res.status(400).json(error);
            });
    }

    private removeSwitch(req: Request, res: Response): void {
        const switchId = req.params.id;

        this.switchHandler.removeSwitch(switchId)
            .subscribe(() => {
                res.status(200).json({});
            }, error => {
                res.status(400).json(error);
            });
    }
}
