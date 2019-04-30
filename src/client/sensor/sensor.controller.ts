import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { SensorModel } from '@shared/models';
import { SensorService } from '@shared/service';
import { Observable } from 'rxjs';

interface SensorCreationRequest {
    pin: number;
    hostName: string;
    name: string;
    targetId: string;
}

@Controller('sensor')
export class SensorController {

    constructor(private sensorService: SensorService) {
    }

    @Get('/all/:hostId')
    getAllSensorsForHost(@Param() hostId: string): Observable<SensorModel[]> {
        return this.sensorService.getSensors(hostId);
    }

    @Post()
    addSensor(@Body() newSensor: SensorCreationRequest): Observable<SensorModel> {
        return this.sensorService.addSensor(newSensor.pin, newSensor.hostName, newSensor.name, newSensor.targetId);
    }

    @Put('/:id/target/:targetId')
    addTarget(@Param() sensorId: string, targetId: string): Observable<SensorModel> {
        return this.sensorService.addTarget(sensorId, targetId);
    }

    @Delete('/:id')
    deleteSensor(@Param() sensorId: string): Observable<void> {
        return this.sensorService.deleteSensor(sensorId);
    }
}