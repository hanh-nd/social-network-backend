import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { SocketGateway } from './socket.gateway';

@Module({
    imports: [JwtModule.register({})],
    providers: [JwtService, SocketGateway],
    exports: [SocketGateway],
})
export class SocketModule {}
