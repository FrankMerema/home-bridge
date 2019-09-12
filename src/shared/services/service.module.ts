import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HostSchema, SensorSchema, SwitchSchema, UserSchema } from '@shared/models';
import { HostService } from './host/host.service';
import { SensorService } from './sensor/sensor.service';
import { SwitchService } from './switch/switch.service';
import { UserService } from './user/user.service';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: 'Host', schema: HostSchema },
      { name: 'Sensor', schema: SensorSchema },
      { name: 'Switch', schema: SwitchSchema },
      { name: 'User', schema: UserSchema }
    ])
  ],
  providers: [HostService, SensorService, SwitchService, UserService],
  exports: [HostService, SensorService, SwitchService, UserService]
})
export class ServiceModule {}
