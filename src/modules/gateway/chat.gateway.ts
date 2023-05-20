import { UseFilters, UseGuards } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
import * as _ from 'lodash';
import { ObjectId } from 'mongodb';
import { Socket } from 'socket.io';
import { SocketEvent } from 'src/common/constants';
import { SocketToken } from 'src/common/guards/socket-token.guard';
import { toStringArray } from 'src/common/helper';
import { IJwtPayload } from '../auth/auth.interface';
import { ChatService } from '../chats/chat.service';
import { WebsocketExceptionsFilter } from './exceptions';
import { SocketGateway } from './socket.gateway';
import { IUserChatPayload, IUserRecallPayload } from './socket.interfaces';

@WebSocketGateway({
    allowEIO3: true,
    cors: {
        origin: true,
        credentials: true,
    },
})
@UseFilters(WebsocketExceptionsFilter)
export class ChatGateway {
    constructor(private readonly socketGateway: SocketGateway, private readonly chatService: ChatService) {}

    @UseGuards(SocketToken)
    @SubscribeMessage(SocketEvent.USER_CHAT)
    async receiveUserChat(
        client: Socket & { user: IJwtPayload },
        payload: IUserChatPayload,
    ): Promise<WsResponse<unknown>> {
        console.info('receive event USER_CHAT: ', payload);
        const { chatId, body } = payload;
        const userId = client.user.userId;

        const chat = await this.chatService.createMessage(userId, chatId, body);
        const { members = [], blockedIds = [] } = chat;
        console.log(_.get({ id: 1 }, 'id', 2));
        const activeMembers = _.difference(
            toStringArray(members as unknown as ObjectId[]),
            toStringArray(blockedIds as unknown as ObjectId[]),
        );
        this.socketGateway.server.to(activeMembers).emit(SocketEvent.USER_CHAT, {
            chatId: chatId,
        });
        return;
    }

    @UseGuards(SocketToken)
    @SubscribeMessage(SocketEvent.USER_RECALL)
    async receiveUserRecall(
        client: Socket & { user: IJwtPayload },
        payload: IUserRecallPayload,
    ): Promise<WsResponse<unknown>> {
        console.info('receive event USER_RECALL: ', payload);
        const { chatId, messageId } = payload;
        const userId = client.user.userId;

        const chat = await this.chatService.recallMessage(userId, chatId, messageId);
        const { members = [], blockedIds = [] } = chat;
        const activeMembers = _.difference(
            toStringArray(members as unknown as ObjectId[]),
            toStringArray(blockedIds as unknown as ObjectId[]),
        );
        this.socketGateway.server.to(activeMembers).emit(SocketEvent.USER_RECALL, {
            chatId: chatId,
            messageId: messageId,
        });
        return;
    }
}
