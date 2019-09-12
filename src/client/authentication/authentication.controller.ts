import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { UserModel } from '@shared/models';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';

interface LoginRequest {
  username: string;
  password: string;
}

@Controller('authenticate')
export class AuthenticationController {
  constructor(private authenticationService: AuthenticationService) {}

  @Post()
  authenticateUser(@Body() loginRequest: LoginRequest): Observable<UserModel> {
    return this.authenticationService.authenticate(loginRequest.username, loginRequest.password);
  }

  @Get('add2factor/:username')
  create2FAuth(@Param('username') username: string): Observable<string> {
    return this.authenticationService.create2FactorAuthUrl(username);
  }

  @Get('/verify2factor/:username/:code')
  verify2FactorAuthCode(@Param('username') username: string, @Param('code') code: string, @Req() req: Request): Observable<{}> {
    return this.authenticationService.verify2FactorAuthCode(username, code).pipe(
      map(jwt => {
        req.res.cookie('SESSIONID', jwt, { httpOnly: true });

        return {};
      })
    );
  }

  @Post('logout')
  logout(@Req() req: Request): {} {
    req.res.clearCookie('SESSIONID');
    return {};
  }
}
