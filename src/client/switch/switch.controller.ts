import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { HardwareCreateDto, SwitchModel } from '@shared/models';
import { SwitchService } from '@shared/service';
import { Observable } from 'rxjs';

@Controller('switch')
export class SwitchController {

    constructor(private switchService: SwitchService) {
    }

    @Get('/all/:hostname')
    getAllSwitchesForHost(@Param() hostname: string): Observable<SwitchModel[]> {
        return this.switchService.getSwitches(hostname);
    }

    @Get('/status/:name')
    getState(@Param('name') switchName: string): Observable<SwitchModel> {
        return this.switchService.getSwitchState(switchName);
    }

    @Post()
    addSwitch(@Body() newSwitch: HardwareCreateDto): Observable<SwitchModel> {
        return this.switchService.addSwitch(newSwitch.pin, newSwitch.hostName, newSwitch.name);
    }

    @Post('/toggle/:name')
    toggleState(@Param('name') switchName: string): Observable<void> {
        return this.switchService.changeState(switchName);
    }

    @Delete('/:name')
    deleteSwitch(@Param('name') switchName: string): Observable<void> {
        return this.switchService.deleteSwitch(switchName);
    }
}
