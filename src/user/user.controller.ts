import { Body, Controller, Get, Post } from '@nestjs/common';
import { Param } from '@nestjs/common/decorators/http/route-params.decorator';
import { Observable } from 'rxjs';
import { UserDto } from '../shared/models/user/user.dto';
import { UserService } from './user.service';

interface newUserDto {
    username: string;
    password: string;
}

@Controller('user')
export class UserController {

    constructor(private userService: UserService) {
    }

    @Get()
    getCurrentUser(): string {
        // return this.userService.getUser(payload.username);
        return 'hi';
    }

    @Get('/:username')
    getUser(@Param('username') username: string): Observable<UserDto> {
        return this.userService.getUser(username);
    }

    @Post()
    addUser(@Body() userDto: newUserDto): Observable<UserDto> {
        return this.userService.addUser(userDto.username, userDto.password);
    }
}
