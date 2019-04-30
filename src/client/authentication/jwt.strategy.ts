import { ConfigService } from '@config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload, UserModel } from '@shared/models';
import { UserService } from '@shared/service';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(private userService: UserService,
                private configService: ConfigService) {
        super({
            jwtFromRequest: (request: Request): string => request.cookies['SESSIONID'] || null,
            secretOrKey: configService.get('applicationClientSecret')
        });
    }

    validate(payload: JwtPayload): Observable<UserModel> {
        return this.userService.getUser(payload.username)
            .pipe(catchError(() => {
                throw new UnauthorizedException();
            }));
    }
}
