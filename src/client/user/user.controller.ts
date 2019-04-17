import { Body, Controller, Get, Post } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserDto } from '../../models/user/user.dto';
import { UserService } from '../../service/user/user.service';

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

    @Post()
    addUser(@Body() userDto: newUserDto): Observable<UserDto> {
        return this.userService.addUser(userDto.username, userDto.password);
    }
}
