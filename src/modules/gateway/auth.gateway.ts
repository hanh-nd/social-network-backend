import { UseFilters } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
import { SocketEvent } from 'src/common/constants';
import { WebsocketExceptionsFilter } from './exceptions';
import { SocketGateway } from './socket.gateway';
import { ICheckOnlinePayload, ISocket, IUserLoginPayload } from './socket.interfaces';

@WebSocketGateway(3011, {
    allowEIO3: true,
    cors: {
        origin: true,
        credentials: true,
    },
    namespace: 'api',
})
@UseFilters(WebsocketExceptionsFilter)
export class AuthGateway {
    constructor(private readonly socketGateway: SocketGateway) {}

    @SubscribeMessage(SocketEvent.USER_LOGIN)
    async receiveUserLogin(client: ISocket, payload: IUserLoginPayload): Promise<WsResponse<unknown>> {
        console.info('receive event USER_LOGIN: ', payload);
        const { userId } = payload;
        if (!userId) return;

        client.userId = userId;

        client.join(`${userId}`);
        return;
    }

    @SubscribeMessage(SocketEvent.USER_LOGOUT)
    async receiveUserLogout(client: ISocket, payload: IUserLoginPayload): Promise<WsResponse<unknown>> {
        console.info('receive event USER_LOGOUT: ', payload);
        const { userId } = client;
        if (!userId) return;

        client.leave(`${userId}`);
        return;
    }

    @SubscribeMessage(SocketEvent.CHECK_ONLINE)
    async receiveCheckOnline(client: ISocket, payload: ICheckOnlinePayload): Promise<WsResponse<unknown>> {
        console.info('receive event CHECK_ONLINE: ', payload);
        const { userId } = payload;
        if (!userId) return;

        const sockets = await this.socketGateway.server.in(`${userId}`).fetchSockets();
        this.socketGateway.server.to(`${client.userId}`).emit(SocketEvent.CHECK_ONLINE, {
            userId: (sockets[0] as any)?.userId,
        });
        return;
    }
}
