import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from '@shared/models';
import { UserService } from '@shared/service';
import { compare } from 'bcrypt';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { from, Observable } from 'rxjs';
import { bindNodeCallback } from 'rxjs/internal/observable/bindNodeCallback';
import { catchError, map, switchMap } from 'rxjs/operators';

@Injectable()
export class AuthenticationService {
  constructor(private userService: UserService, private jwtService: JwtService) {}

  authenticate(username: string, password: string): Observable<UserModel> {
    if (!username || !password) {
      throw new BadRequestException('Username and password are required!');
    }

    return this.userService.getUser(username).pipe(
      switchMap(user =>
        from(compare(password, user.password)).pipe(
          map(success => {
            if (success) {
              return user;
            } else {
              throw new UnauthorizedException('Username / Password incorrect');
            }
          })
        )
      ),
      catchError(() => {
        throw new UnauthorizedException('Username / Password incorrect');
      })
    );
  }

  create2FactorAuthUrl(username: string): Observable<string> {
    const toDataUrl = bindNodeCallback(toDataURL);

    return this.userService.getUser(username).pipe(
      switchMap(user => {
        if (user && user.twoFactorSecretConfirmed) {
          throw new UnauthorizedException('Two factor authentication is already confirmed');
        } else {
          return this.userService.updateUser(username, { twoFactorAuthSecret: authenticator.generateSecret() }, { new: true }).pipe(
            switchMap(u => {
              const otpAuthPath = authenticator.keyuri(encodeURIComponent(u.username), encodeURIComponent('Home-Bridge'), u.twoFactorAuthSecret);

              return toDataUrl(otpAuthPath) as Observable<string>;
            })
          );
        }
      })
    );
  }

  verify2FactorAuthCode(username: string, code: string): Observable<string> {
    return this.userService.getUser(username).pipe(
      map(user => {
        if (authenticator.check(code, user.twoFactorAuthSecret)) {
          if (!user.twoFactorSecretConfirmed) {
            this.userService.updateUser(username, { twoFactorSecretConfirmed: true }).subscribe();
          }
          return this.jwtService.sign({ username: user.username }, { expiresIn: 3600 });
        } else {
          throw new UnauthorizedException('The code is expired or not valid, please try again.');
        }
      })
    );
  }
}
