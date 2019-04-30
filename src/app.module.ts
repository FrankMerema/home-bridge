import { ClientModule } from '@client/rest';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        ClientModule,
        MongooseModule.forRoot('mongodb://localhost/home-automation')
    ]
})
export class AppModule {
}
