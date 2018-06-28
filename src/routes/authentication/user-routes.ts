import { Request, Response, Router } from 'express';
import { UserHandler } from '../../handlers/user-handler';

export class UserRoutes {

    private readonly router: Router;
    private userHandler: UserHandler;

    constructor(userHandler: UserHandler) {
        this.router = Router();
        this.userHandler = userHandler;
        this.setupRoutes();
    }

    getRouter(): Router {
        return this.router;
    }

    private setupRoutes(): void {
        this.router.get('/current', (req: Request, res: Response) => this.getCurrentUser(req, res));
        // this.router.get('/:ip/status', (req: Request, res: Response) => this.getHostStatus(req, res));
        // this.router.get('/:ip', (req: Request, res: Response) => this.getHost(req, res));
        //
        this.router.post('', (req: Request, res: Response) => this.addUser(req, res));
        this.router.post('/authenticate', (req: Request, res: Response) => this.authenticateUser(req, res));
        //
        // this.router.delete('/:ip', (req: Request, res: Response) => this.removeHost(req, res));
    }

    private getCurrentUser(req: Request, res: Response): void {
        // const ip = req.params.ip;
        //
        // this.hostHandler.getHost(ip)
        //     .then(host => {
        res.status(401).json({});
        //     }).catch(error => {
        //     res.status(404).json({error: error});
        // });
    }

    private addUser(req: Request, res: Response): void {
        const {username, password} = req.body;

        this.userHandler.addUser(username, password)
            .then(addedUser => {
                res.json(addedUser);
            }).catch(error => {
            res.status(404).json({error: error});
        });
    }

    private authenticateUser(req: Request, res: Response): void {
        const {username, password} = req.body;

        this.userHandler.authenticateUser(username, password)
            .then(authenticatedUser => {
                res.json(authenticatedUser);
            }).catch(error => {
            res.status(404).json({error: error});
        });
    }
}
