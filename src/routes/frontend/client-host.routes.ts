import {Request, Response, Router} from 'express';
import {HostHandler} from '../../handlers/host-handler';

export class ClientHostRoutes {

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
        this.router.get('/all', (req: Request, res: Response) => this.getAllHosts(req, res));
        this.router.get('/:ip/status', (req: Request, res: Response) => this.getHostStatus(req, res));
        this.router.get('/:ip', (req: Request, res: Response) => this.getHost(req, res));

        this.router.delete('/:ip', (req: Request, res: Response) => this.removeHost(req, res));
    }

    private getHost(req: Request, res: Response): void {
        const ip = req.params.ip;

        this.hostHandler.getHost(ip)
            .then(host => {
                res.json(host);
            }).catch(error => {
            res.status(404).json(error);
        });
    }

    private getHostStatus(req: Request, res: Response) {
        const ip = req.params.ip;

        this.hostHandler.getHostStatus(ip)
            .then(status => {
                res.json(status);
            }).catch(err => {
            res.status(404).json(err);
        });
    }

    private getAllHosts(req: Request, res: Response): void {
        this.hostHandler.getAllHosts()
            .then(hosts => {
                res.json(hosts);
            }).catch(error => {
            res.status(404).json(error);
        });
    }

    private removeHost(req: Request, res: Response): void {
        const ip = req.params.ip;

        this.hostHandler.removeHost(ip)
            .then(() => {
                res.json();
            }).catch(error => {
            res.status(404).json(error);
        });
    }
}
