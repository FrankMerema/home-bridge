import { Request, Response, Router } from 'express';
import { HostHandler } from '../handlers/host-handler';

export class HostRoutes {

    private readonly router: Router;
    private hostHandler: HostHandler;

    constructor() {
        this.router = Router();
        this.hostHandler = new HostHandler();
        this.setupRoutes();
    }

    getRouter(): Router {
        return this.router;
    }

    private setupRoutes(): void {
        this.router.get('/all', (req: Request, res: Response) => this.getAllHosts(req, res));
        this.router.get('/:ip/status', (req: Request, res: Response) => this.getHostStatus(req, res));
        this.router.get('/:ip', (req: Request, res: Response) => this.getHost(req, res));

        this.router.post('', (req: Request, res: Response) => this.addHost(req, res));
        this.router.post('/:ip/status', (req: Request, res: Response) => this.updateHostStatus(req, res));

        this.router.delete('/:ip', (req: Request, res: Response) => this.removeHost(req, res));
    }

    private getHost(req: Request, res: Response): void {
        const ip = req.params.ip;

        this.hostHandler.getHost(ip)
            .then(host => {
                res.json(host);
            }).catch(error => {
            res.status(404).json({error: error});
        });
    }

    private getHostStatus(req: Request, res: Response) {
        const ip = req.params.ip;

        this.hostHandler.getHostStatus(ip)
            .then(status => {
                res.json(status);
            }).catch(err => {
            res.status(404).json({error: err});
        });
    }

    private updateHostStatus(req: Request, res: Response): void {
        const ip = req.params.ip;
        const status = req.body.status;

        this.hostHandler.updateHostStatus(ip, status)
            .then(() => {
                res.json();
            }).catch(error => {
            res.status(404).json({error: error});
        });
    }

    private getAllHosts(req: Request, res: Response): void {
        this.hostHandler.getAllHosts()
            .then(hosts => {
                res.json(hosts);
            }).catch(error => {
            res.status(404).json({error: error});
        });
    }

    private addHost(req: Request, res: Response): void {
        const hostName = req.body.host;
        const ip = req.body.ip;
        const port = req.body.port;

        this.hostHandler.addHost(hostName, ip, port)
            .then(addedHost => {
                res.json(addedHost);
            }).catch(error => {
            res.status(404).json({error: error});
        });
    }

    private removeHost(req: Request, res: Response): void {
        const ip = req.params.ip;

        this.hostHandler.removeHost(ip)
            .then(() => {
                res.json();
            }).catch(error => {
            res.status(404).json({error: error});
        });
    }
}
