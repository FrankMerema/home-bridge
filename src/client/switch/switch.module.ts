import { HttpModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SwitchSchema } from '../../shared/models/switch/switch.schema';
import { HostModule } from '../host/host.module';
import { SwitchController } from './switch.controller';
import { SwitchService } from './switch.service';

@Module({
    imports: [
        HttpModule,
        HostModule,
        MongooseModule.forFeature([{name: 'Switch', schema: SwitchSchema}])
    ],
    controllers: [SwitchController],
    providers: [SwitchService],
    exports: [SwitchService]
})
export class SwitchModule {
}
