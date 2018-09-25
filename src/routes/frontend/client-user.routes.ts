import {Request, Response, Router} from 'express';
import {UserHandler} from '../../handlers/user-handler';
import {jwtMiddleware} from '../../middleware/jwt-verifier.middleware';

export class ClientUserRoutes {

    private readonly router: Router;
    private readonly userHandler: UserHandler;

    constructor() {
        this.router = Router();
        this.userHandler = new UserHandler();
        this.setupRoutes();
    }

    getRouter(): Router {
        return this.router;
    }

    private setupRoutes(): void {
        this.router.get('/current', jwtMiddleware, (req: Request, res: Response) => this.getCurrentUser(req, res));

        this.router.post('/authenticate', (req: Request, res: Response) => this.authenticateUser(req, res));
        this.router.post('', (req: Request, res: Response) => this.addUser(req, res));
    }

    private getCurrentUser(req: Request, res: Response): void {
        const decoded = req.body.decoded;

        this.userHandler.getUser(decoded.username)
            .then(currentUser => {
                res.json(currentUser);
            }).catch(error => {
            res.status(404).json({error: error});
        });
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
            .then(result => {
                res.cookie('SESSIONID', result.token, {httpOnly: true});
                res.json(result.user);
            }).catch(error => {
            res.status(401).json(error);
        });
    }
}
