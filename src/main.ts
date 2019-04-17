import { NestFactory } from '@nestjs/core';
import * as RateLimit from 'express-rate-limit';
import * as helmet from 'helmet';
import { AppModule } from './app.module';

const config = require('../service.config.json');

async function bootstrap() {
    const port = config.serverPort || 8080;

    const app = await NestFactory.create(AppModule);

    // Security
    app.enableCors();
    app.use(helmet());
    app.use(new RateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    }));

    await app.listen(port);
}

bootstrap();
