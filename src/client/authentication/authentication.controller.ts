import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserDto } from '../../models/user/user.dto';
import { AuthenticationService } from '../../service/authentication/authentication.service';
import { LoginRequest } from './login-request.interface';

@Controller('authentication')
export class AuthenticationController {

    constructor(private authenticationService: AuthenticationService) {
    }

    @Post()
    authenticateUser(@Body() loginRequest: LoginRequest): Observable<UserDto> {
        return this.authenticationService.authenticate(loginRequest.username, loginRequest.password)
            .pipe(catchError(err => {
                throw new HttpException(err, HttpStatus.UNAUTHORIZED);
            }));
    }

    @Get('add2factor/:username')
    create2FAuth(@Param('username') username: string): Observable<string> {
        return this.authenticationService.create2FactorAuthUrl(username);
    }
}
