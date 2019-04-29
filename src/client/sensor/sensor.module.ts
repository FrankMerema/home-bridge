import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SensorSchema } from '../../shared/models/sensor/sensor.schema';
import { HostModule } from '../host/host.module';
import { SwitchModule } from '../switch/switch.module';
import { SensorController } from './sensor.controller';
import { SensorService } from './sensor.service';

@Module({
    imports: [
        HostModule,
        HttpModule,
        MongooseModule.forFeature([{name: 'Sensor', schema: SensorSchema}]),
        SwitchModule
    ],
    controllers: [SensorController],
    providers: [SensorService]
})
export class SensorModule {
}
