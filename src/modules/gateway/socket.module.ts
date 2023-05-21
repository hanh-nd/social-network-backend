import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ChatModule } from '../chats/chat.module';
import { AuthGateway } from './auth.gateway';
import { ChatGateway } from './chat.gateway';
import { SocketGateway } from './socket.gateway';

@Module({
    imports: [JwtModule.register({}), ChatModule],
    providers: [JwtService, SocketGateway, ChatGateway, AuthGateway],
    exports: [SocketGateway, ChatGateway, AuthGateway],
})
export class SocketModule {}
