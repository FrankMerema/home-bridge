import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationModule } from './authentication/authentication.module';
import { UserModule } from './user/user.module';

@Module({
    imports: [
        MongooseModule.forRoot('mongodb://localhost/home-automation'),
        AuthenticationModule,
        UserModule
    ]
})
export class AppModule {
}
