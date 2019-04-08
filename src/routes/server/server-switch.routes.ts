import { Request, Response, Router } from 'express';
import { SwitchHandler } from '../../handlers';

export class ServerSwitchRoutes {

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
    }

    private getAllSwitchesForHost(req: Request, res: Response): void {
        const hostId = req.params.hostId;

        this.switchHandler.getSwitches(hostId)
            .subscribe(switches => {
                res.json(switches);
            }, error => {
                res.status(404).json(error);
            });
    }
}
