import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { Observable } from 'rxjs';
import { SensorModel } from '../../shared/models/sensor/sensor.model';
import { SensorService } from './sensor.service';

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
