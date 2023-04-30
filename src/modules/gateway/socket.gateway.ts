import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConfigKey } from 'src/common/config';
import { IJwtPayload } from '../auth/auth.interface';

@WebSocketGateway({
    allowEIO3: true,
    cors: {
        origin: true,
        credentials: true,
    },
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(private configService: ConfigService, private jwtService: JwtService) {}

    @WebSocketServer()
    server: Server;

    wsClients = [];

    afterInit(server: Server) {
        console.info('Init socket server', server);
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

        const { token } = client.handshake.headers;

        if (!token || Array.isArray(token)) {
            throw new WsException('Invalid token');
        }

        try {
            const user = this.jwtService.verify<IJwtPayload>(token, {
                secret: this.configService.get<string>(ConfigKey.JWT_ACCESS_TOKEN_SECRET),
            });

            const { userId } = user;
            client.join(`${userId}`);
        } catch (error) {}
    }
}
