import { Module } from '@nestjs/common';
import { HostController, SensorController, SwitchController } from '@server/rest';
import { ServiceModule } from '@shared/service';

@Module({
    imports: [
        ServiceModule
    ],
    controllers: [
        HostController,
        SensorController,
        SwitchController
    ]
})
export class ServerModule {
}
