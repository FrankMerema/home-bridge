import { Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { from, Observable, of, throwError } from 'rxjs';
import { bindNodeCallback } from 'rxjs/internal/observable/bindNodeCallback';
import { catchError, switchMap } from 'rxjs/operators';
import { UserDto } from '../../models/user/user.dto';
import { JwtService } from '../jwt/jwt.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthenticationService {

    constructor(private userService: UserService,
                private jwtService: JwtService) {
    }

    authenticate(username: string, password: string): Observable<UserDto> {
        if (!username || !password) {
            return throwError('Username and password are required!');
        }

        return this.userService.getUser(username)
            .pipe(switchMap(user => from(compare(password, user.password))
                .pipe(switchMap(success => {
                    if (success) {
                        return of({
                            username: user.username,
                            twoFactorSecretConfirmed: !!user.twoFactorAuthSecret && user.twoFactorSecretConfirmed
                        });
                    } else {
                        return throwError('Username / Password incorrect');
                    }
                }))
            ), catchError(() => throwError('Username / Password incorrect')));
    }

    create2FactorAuthUrl(username: string): Observable<string> {
        const toDataUrl = bindNodeCallback(toDataURL);

        return this.userService.updateUser(username, {twoFactorAuthSecret: authenticator.generateSecret()}, {new: true})
            .pipe(switchMap(user => {
                const otpAuthPath = authenticator.keyuri(encodeURIComponent(user.username), encodeURIComponent('Home-Bridge'), user.twoFactorAuthSecret);

                return toDataUrl(otpAuthPath) as Observable<string>;
            }));
    }
}
