import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientModule } from './client/client.module';

@Module({
    imports: [
        ClientModule,
        MongooseModule.forRoot('mongodb://localhost/nest')
    ]
})
export class AppModule {
}
