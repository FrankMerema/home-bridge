import { Module } from '@nestjs/common';
import { ServiceModule } from '@shared/service';
import { AuthenticationModule } from './authentication/authentication.module';
import { HostController } from './host/host.controller';
import { SensorController } from './sensor/sensor.controller';
import { SwitchController } from './switch/switch.controller';
import { UserController } from './user/user.controller';

@Module({
  imports: [AuthenticationModule, ServiceModule],
  controllers: [HostController, SensorController, SwitchController, UserController]
})
export class ClientModule {}
