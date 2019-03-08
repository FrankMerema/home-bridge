import { Request, Response, Router } from 'express';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { UserHandler } from '../../handlers/user-handler';
import { jwtMiddleware } from '../../middleware/jwt-verifier.middleware';

export class ClientUserRoutes {

    private readonly router: Router;
    private readonly userHandler: UserHandler;

    private secret: string;

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
        this.router.get('/verify2factor/:username/:token', jwtMiddleware, (req: Request, res: Response) => this.verify2FAuth(req, res));

        this.router.post('/logout', (req: Request, res: Response) => this.logout(req, res));
        this.router.post('/authenticate', (req: Request, res: Response) => this.authenticateUser(req, res));
        this.router.post('', jwtMiddleware, (req: Request, res: Response) => this.addUser(req, res));
        this.router.post('/add2factor/:username', jwtMiddleware, (req: Request, res: Response) => this.create2FAuth(req, res));
    }

    private getCurrentUser(req: Request, res: Response): void {
        const {decoded} = req.body;

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
        const {username} = req.body;

        // TODO store secret in the database on the user object
        this.secret = authenticator.generateSecret();
        const otpAuth = authenticator.keyuri(encodeURIComponent(username), encodeURIComponent('Home-Bridge'), this.secret);

        toDataURL(otpAuth, ((error, url) => {
            res.json(url);
        }));
    }

    private verify2FAuth(req: Request, res: Response) {
        const {username, token} = req.params;

        // TODO retrieve the secret from the database user object
        res.json({verified: authenticator.check(token, this.secret)});
    }
}
