import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as dotenv from 'dotenv';
import 'isomorphic-fetch';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';
import { ConfigKey } from './common/config';
import { RedisIoAdapter } from './modules/gateway/redis-io.adapter';
dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const origin = configService.get(ConfigKey.CORS_WHITELIST)?.split(',');
    const corsOptions: CorsOptions = {
        origin: origin,
        allowedHeaders: ['Content-Type', 'Authorization', 'Language', 'X-Timezone', 'X-Timezone-Name'],
        optionsSuccessStatus: 200,
        methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    };
    app.enableCors(corsOptions);
    app.setGlobalPrefix(configService.get(ConfigKey.BASE_PATH));
    // use winston for logger
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
    // use redis adapter
    const redisIoAdapter = new RedisIoAdapter(app);
    app.useWebSocketAdapter(redisIoAdapter);
    await app.listen(configService.get(ConfigKey.PORT));
}
bootstrap();
