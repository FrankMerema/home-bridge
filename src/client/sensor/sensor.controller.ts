import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HardwareCreateDto, SensorModel } from '@shared/models';
import { SensorService } from '@shared/service';
import { Observable } from 'rxjs';

interface SensorCreateDto extends HardwareCreateDto {
  targetId?: string;
}

@Controller('sensor')
export class SensorController {
  constructor(private sensorService: SensorService) {}

  @Get('/all/:hostId')
  @UseGuards(AuthGuard('jwt'))
  getAllSensorsForHost(@Param('hostId') hostId: string): Observable<SensorModel[]> {
    return this.sensorService.getSensors(hostId);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  addSensor(@Body() newSensor: SensorCreateDto): Observable<SensorModel> {
    return this.sensorService.addSensor(newSensor.pin, newSensor.hostName, newSensor.name, newSensor.targetId);
  }

  @Put('/:id/target/:targetId')
  @UseGuards(AuthGuard('jwt'))
  addTarget(@Param('id') sensorId: string, @Param('targetId') targetId: string): Observable<SensorModel> {
    return this.sensorService.addTarget(sensorId, targetId);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard('jwt'))
  deleteSensor(@Param('id') sensorId: string): Observable<void> {
    return this.sensorService.deleteSensor(sensorId);
  }
}
