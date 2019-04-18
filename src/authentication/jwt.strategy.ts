import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { JwtPayload } from '../shared/models/jwt/jwt-payload';
import { UserDto } from '../shared/models/user/user.dto';
import { ConfigService } from '../config/config.service';
import { UserService } from '../user/user.service';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private userService: UserService,
                private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('applicationSecret')
        });
    }

    validate(payload: JwtPayload): Observable<UserDto> {
        return this.userService.getUser(payload.username)
            .pipe(catchError(() => {
                throw new UnauthorizedException();
            }));
    }
}
