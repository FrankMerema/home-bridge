import {Request, Response} from 'express';
import {verify, VerifyErrors} from 'jsonwebtoken';

const config = require('../../service.config.json');

export const jwtMiddleware = (req: Request, res: Response, next: (err?: any) => void) => {
    const token = req.cookies['SESSIONID'];

    if (token) {
        verify(token, config.applicationSecret, (err: VerifyErrors, decoded: object | string) => {
            if (err) {
                return res.status(401).json({error: 'Failed to authenticate token.'});
            } else {
                req.body.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(401).json({error: 'No token provided'});
    }
};
