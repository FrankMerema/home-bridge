import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Param } from '@nestjs/common/decorators/http/route-params.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserModel } from '@shared/models';
import { UserService } from '@shared/service';
import { Observable } from 'rxjs';

interface NewUserDto {
  username: string;
  password: string;
}

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  getCurrentUser(@Req() request): Observable<UserModel> {
    return request.user;
  }

  @Get('/:username')
  @UseGuards(AuthGuard('jwt'))
  getUser(@Param('username') username: string): Observable<UserModel> {
    return this.userService.getUser(username);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  addUser(@Body() userDto: NewUserDto): Observable<UserModel> {
    return this.userService.addUser(userDto.username, userDto.password);
  }
}
