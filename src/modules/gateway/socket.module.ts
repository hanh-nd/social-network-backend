import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ChatModule } from '../chats/chat.module';
import { ChatGateway } from './chat.gateway';
import { SocketGateway } from './socket.gateway';

@Module({
    imports: [JwtModule.register({}), ChatModule],
    providers: [JwtService, SocketGateway, ChatGateway],
    exports: [SocketGateway, ChatGateway],
})
export class SocketModule {}
