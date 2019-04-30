import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as RateLimit from 'express-rate-limit';
import * as session from 'express-session';
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

    // Global prefix
    app.setGlobalPrefix('api');

    app.use(cookieParser());
    app.use(session({
        secret: config.applicationClientSecret,
        resave: false,
        saveUninitialized: false
    }));

    await app.listen(port);
}

bootstrap();
