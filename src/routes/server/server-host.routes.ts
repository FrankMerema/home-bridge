import { HostHandler } from '@handlers';
import { Request, Response, Router } from 'express';

export class ServerHostRoutes {

    private readonly router: Router;
    private hostHandler: HostHandler;

    constructor(hostHandler: HostHandler) {
        this.router = Router();
        this.hostHandler = hostHandler;
        this.setupRoutes();
    }

    getRouter(): Router {
        return this.router;
    }

    private setupRoutes(): void {
        this.router.post('', (req: Request, res: Response) => this.addHost(req, res));

        this.router.post('/:ip/status', (req: Request, res: Response) => this.updateHostStatus(req, res));
    }

    private updateHostStatus(req: Request, res: Response): void {
        const ip = req.params.ip;
        const status = req.body.status;

        this.hostHandler.updateHostStatus(ip, status)
            .subscribe(() => {
                res.json();
            }, error => {
                res.status(404).json(error);
            });
    }

    private addHost(req: Request, res: Response): void {
        const {host, name, ip, port} = req.body;

        this.hostHandler.addHost(host, name, ip, port)
            .subscribe(addedHost => {
                res.json(addedHost);
            }, error => {
                res.status(404).json(error);
            });
    }
}
