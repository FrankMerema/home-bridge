import { Request, Response, Router } from 'express';
import { toDataURL } from 'qrcode';
import { generateSecret } from 'speakeasy';
import { UserHandler } from '../../handlers/user-handler';
import { jwtMiddleware } from '../../middleware/jwt-verifier.middleware';

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

        this.router.post('/test', (req: Request, res: Response) => this.create2FAuth(req, res));

        this.router.post('/logout', (req: Request, res: Response) => this.logout(req, res));
        this.router.post('/authenticate', (req: Request, res: Response) => this.authenticateUser(req, res));
        this.router.post('', jwtMiddleware, (req: Request, res: Response) => this.addUser(req, res));
    }

    private getCurrentUser(req: Request, res: Response): void {
        const decoded = req.body.decoded;

        this.userHandler.getUser(decoded.username)
            .subscribe(currentUser => {
                res.json(currentUser);
            }, error => {
                res.status(404).json(error);
            });
    }

    private addUser(req: Request, res: Response): void {
        const {username, password} = req.body;

        this.userHandler.addUser(username, password)
            .subscribe(result => {
                res.cookie('SESSIONID', result.token, {httpOnly: true});
                res.json(result.user);
            }, error => {
                res.status(404).json(error);
            });
    }

    private authenticateUser(req: Request, res: Response): void {
        const {username, password} = req.body;

        this.userHandler.authenticateUser(username, password)
            .subscribe(result => {
                res.cookie('SESSIONID', result.token, {httpOnly: true});
                res.json(result.user);
            }, error => {
                res.status(401).json(error);
            });
    }

    private logout(req: Request, res: Response): void {
        res.clearCookie('SESSIONID');
        res.json({});
    }

    private create2FAuth(req: Request, res: Response) {
        const secret = generateSecret({name: 'Home Bridge', issuer: 'Frank Merema'});

        toDataURL(secret.otpauth_url, ((error, url) => {
            res.json(url);
        }));
    }
}
