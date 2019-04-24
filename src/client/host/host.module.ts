import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HostSchema } from '../../shared/models/host/host.schema';
import { HostController } from './host.controller';
import { HostService } from './host.service';

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'Host', schema: HostSchema}])
    ],
    controllers: [HostController],
    providers: [HostService]
})
export class HostModule {
}
