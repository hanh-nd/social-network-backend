import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { BullModule } from 'src/common/modules/bull/bull.module';
import { RedisModule } from 'src/common/modules/redis/redis.module';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { ChatModule } from '../chats/chat.module';
import { AuthGateway } from './auth.gateway';
import { ChatGateway } from './chat.gateway';
import { SocketGateway } from './socket.gateway';

@Module({
    imports: [JwtModule.register({}), ChatModule, RedisModule, DataServicesModule, BullModule],
    providers: [JwtService, SocketGateway, ChatGateway, AuthGateway],
    exports: [SocketGateway, ChatGateway, AuthGateway],
})
export class SocketModule {}
