import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { UserModule } from '../user/user.module';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        ConfigModule,
        PassportModule.register({defaultStrategy: 'jwt'}),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                return {
                    secretOrPrivateKey: configService.get('applicationSecret'),
                    signOptions: {
                        expiresIn: 3600
                    }
                };
            },
            inject: [ConfigService]
        }),
        UserModule
    ],
    controllers: [AuthenticationController],
    providers: [AuthenticationService, JwtStrategy]
})
export class AuthenticationModule {
}
