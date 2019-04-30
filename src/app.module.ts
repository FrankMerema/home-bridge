import { ClientModule } from '@client/rest';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServerModule } from '@server/rest';

@Module({
    imports: [
        ClientModule,
        MongooseModule.forRoot('mongodb://localhost/home-automation'),
        ServerModule
    ]
})
export class AppModule {
}
