import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from '../config/config.service';
import { JwtPayload } from '../shared/models/jwt/jwt-payload';
import { UserModel } from '../shared/models/user/user.model';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private userService: UserService,
                private configService: ConfigService) {
        super({
            jwtFromRequest: (request: Request): string => request.cookies['SESSIONID'] || null,
            secretOrKey: configService.get('applicationSecret')
        });
    }

    validate(payload: JwtPayload): Observable<UserModel> {
        return this.userService.getUser(payload.username)
            .pipe(catchError(() => {
                throw new UnauthorizedException();
            }));
    }
}
