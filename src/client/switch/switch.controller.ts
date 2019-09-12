import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HardwareCreateDto, SwitchModel } from '@shared/models';
import { SwitchService } from '@shared/service';
import { Observable } from 'rxjs';

@Controller('switch')
export class SwitchController {
  constructor(private switchService: SwitchService) {}

  @Get('/all/:hostname')
  @UseGuards(AuthGuard('jwt'))
  getAllSwitchesForHost(@Param() hostname: string): Observable<SwitchModel[]> {
    return this.switchService.getSwitches(hostname);
  }

  @Get('/status/:name')
  @UseGuards(AuthGuard('jwt'))
  getState(@Param('name') switchName: string): Observable<SwitchModel> {
    return this.switchService.getSwitchState(switchName);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  addSwitch(@Body() newSwitch: HardwareCreateDto): Observable<SwitchModel> {
    return this.switchService.addSwitch(newSwitch.pin, newSwitch.hostName, newSwitch.name);
  }

  @Post('/toggle/:name')
  @UseGuards(AuthGuard('jwt'))
  toggleState(@Param('name') switchName: string): Observable<void> {
    return this.switchService.changeState(switchName);
  }

  @Delete('/:name')
  @UseGuards(AuthGuard('jwt'))
  deleteSwitch(@Param('name') switchName: string): Observable<void> {
    return this.switchService.deleteSwitch(switchName);
  }
}
