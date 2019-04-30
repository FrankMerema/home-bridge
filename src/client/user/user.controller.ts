import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Param } from '@nestjs/common/decorators/http/route-params.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserModel } from '@shared/models';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { UserService } from '../../shared/services/user/user.service';

interface newUserDto {
    username: string;
    password: string;
}

@Controller('user')
export class UserController {

    constructor(private userService: UserService) {
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    getCurrentUser(@Req() request: Request): Observable<UserModel> {
        return request.user;
    }

    @Get('/:username')
    @UseGuards(AuthGuard('jwt'))
    getUser(@Param('username') username: string): Observable<UserModel> {
        return this.userService.getUser(username);
    }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    addUser(@Body() userDto: newUserDto): Observable<UserModel> {
        return this.userService.addUser(userDto.username, userDto.password);
    }
}
