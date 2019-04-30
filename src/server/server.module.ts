import { Module } from '@nestjs/common';
import { HostController, SensorController } from '@server/rest';
import { ServiceModule } from '@shared/service';

@Module({
    imports: [
        ServiceModule
    ],
    controllers: [
        HostController,
        SensorController
    ]
})
export class ServerModule {
}
