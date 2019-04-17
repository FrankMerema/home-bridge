import { Module } from '@nestjs/common';
import { ServicesModule } from '../service/services.module';
import { AuthenticationController } from './authentication/authentication.controller';
import { UserController } from './user/user.controller';

@Module({
    imports: [ServicesModule],
    controllers: [AuthenticationController, UserController],
    providers: []
})
export class ClientModule {
}
