import { Module } from '@nestjs/common';
import { HostController } from '@server/rest';
import { ServiceModule } from '@shared/service';

@Module({
    imports: [
        ServiceModule
    ],
    controllers: [
        HostController
    ]
})
export class ServerModule {
}
