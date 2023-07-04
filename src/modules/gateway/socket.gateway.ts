import { UseFilters } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebsocketExceptionsFilter } from './exceptions';

@WebSocketGateway(3011, {
    allowEIO3: true,
    cors: {
        origin: true,
        credentials: true,
    },
    namespace: 'api',
})
@UseFilters(new WebsocketExceptionsFilter())
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(private configService: ConfigService, private jwtService: JwtService) {}

    @WebSocketServer()
    server: Server;

    wsClients = [];

    afterInit(server: Server) {
        console.info('Socket server initialized');
    }

    handleDisconnect(client: Socket) {
        console.info(`Client disconnected: ${client.id}`);
        for (let i = 0; i < this.wsClients.length; i += 1) {
            if (this.wsClients[i].id === client.id) {
                this.wsClients.splice(i, 1);
                break;
            }
        }
    }

    handleConnection(client: Socket) {
        console.info(`Client connected: ${client.id}`);
        this.wsClients.push(client);
    }
}
