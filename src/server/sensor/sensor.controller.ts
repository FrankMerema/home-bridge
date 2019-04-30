import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { HardwareCreateDto, SensorModel, State } from '@shared/models';
import { SensorService } from '@shared/service';
import { Observable } from 'rxjs';

interface SensorCreateDto extends HardwareCreateDto {
    targetId?: string;
}

@Controller('server/sensor')
export class SensorController {

    constructor(private sensorService: SensorService) {
    }

    @Get('all/:host')
    getAllSensorsForHost(@Param('host') name: string): Observable<SensorModel[]> {
        return this.sensorService.getSensors(name);
    }

    @Put(':host/:pin')
    updateState(@Param('host') name: string, @Param('pin') pin: string, @Body() state: State): Observable<void> {
        return this.sensorService.updateState(name, pin, state);
    }
}
