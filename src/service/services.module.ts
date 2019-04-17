import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../models/user/user.schema';
import { AuthenticationService } from './authentication/authentication.service';
import { JwtService } from './jwt/jwt.service';
import { UserService } from './user/user.service';

@Module({
    imports: [
        MongooseModule.forFeature([{name: 'User', schema: UserSchema}])
    ],
    providers: [
        AuthenticationService,
        UserService,
        JwtService
    ],
    exports: [
        AuthenticationService,
        UserService
    ]
})
export class ServicesModule {
}
