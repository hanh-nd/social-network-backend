import { UseGuards } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { SocketEvent } from 'src/common/constants';
import { SocketToken } from 'src/common/guards/socket-token.guard';
import { Notification } from 'src/mongo-schemas/notification.schema';
import { IJwtPayload } from '../auth/auth.interface';
import { NotificationService } from '../notifications/notification.service';
import { SocketGateway } from './socket.gateway';

@WebSocketGateway({
    allowEIO3: true,
    cors: {
        origin: true,
        credentials: true,
    },
})
export class NotificationGateway {
    constructor(
        private readonly socketGateway: SocketGateway,
        private readonly notificationService: NotificationService,
    ) {}

    @UseGuards(SocketToken)
    @SubscribeMessage(SocketEvent.USER_REACT)
    async receiveUserReact(
        client: Socket & { user: IJwtPayload },
        payload: {
            authorId: string;
            targetId: string;
            targetType: string;
        },
    ): Promise<WsResponse<Notification>> {
        console.info('receive event USER_LIKE: ', payload);
        const { authorId, targetId, targetType } = payload;
        const senderId = client.user.userId;

        this.socketGateway.server.to(authorId).emit(SocketEvent.USER_REACT);
        return;
    }
}
