import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ServerOptions } from 'socket.io';
import { ConfigKey } from 'src/common/config';

export class RedisIoAdapter extends IoAdapter {
    protected redisAdapter;

    constructor(app: INestApplication) {
        super(app);
        const configService = app.get(ConfigService);

        const pubClient = createClient({
            url: configService.get<string>(ConfigKey.REDIS_CONNECTION_STRING),
        });
        const subClient = pubClient.duplicate();

        pubClient.connect();
        subClient.connect();

        this.redisAdapter = createAdapter(pubClient, subClient);
    }

    createIOServer(port: number, options?: ServerOptions): any {
        const server = super.createIOServer(port, options);
        server.adapter(this.redisAdapter);
        return server;
    }
}
