import { ClientModule } from '@client/rest';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServerModule } from '@server/rest';
import { AppController } from './app.controller';

@Module({
    imports: [
        ClientModule,
        MongooseModule.forRoot('mongodb://localhost/home-automation'),
        ServerModule
    ],
    controllers: [
        AppController
    ]
})
export class AppModule {
}
