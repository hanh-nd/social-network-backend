import { UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { SubscribeMessage, WebSocketGateway, WsResponse } from '@nestjs/websockets';
import * as _ from 'lodash';
import { ObjectId } from 'mongodb';
import { SocketEvent } from 'src/common/constants';
import { SocketToken } from 'src/common/guards/socket-token.guard';
import { toStringArray } from 'src/common/helper';
import { AccessLogInterceptor } from 'src/common/interceptors/access-log.interceptor';
import { ChatService } from '../chats/chat.service';
import { WebsocketExceptionsFilter } from './exceptions';
import { SocketGateway } from './socket.gateway';
import { ISocket, IUserChatPayload, IUserRecallPayload } from './socket.interfaces';

@WebSocketGateway({
    allowEIO3: true,
    cors: {
        origin: true,
        credentials: true,
    },
})
@UseFilters(WebsocketExceptionsFilter)
@UseInterceptors(AccessLogInterceptor)
export class ChatGateway {
    constructor(private readonly socketGateway: SocketGateway, private readonly chatService: ChatService) {}

    @UseGuards(SocketToken)
    @SubscribeMessage(SocketEvent.USER_CHAT)
    async receiveUserChat(client: ISocket, payload: IUserChatPayload): Promise<WsResponse<unknown>> {
        console.info('receive event USER_CHAT: ', payload);
        const { chatId, body } = payload;
        const { userId } = client;

        const { chat, message } = await this.chatService.createMessage(userId, chatId, body);
        const { members = [], blockedIds = [] } = chat;
        const activeMembers = _.difference(
            toStringArray(members as unknown as ObjectId[]),
            toStringArray(blockedIds as unknown as ObjectId[]),
        );
        this.socketGateway.server.to(activeMembers).emit(SocketEvent.USER_CHAT, {
            chatId: chatId,
            message,
        });
        return;
    }

    @UseGuards(SocketToken)
    @SubscribeMessage(SocketEvent.USER_RECALL)
    async receiveUserRecall(client: ISocket, payload: IUserRecallPayload): Promise<WsResponse<unknown>> {
        console.info('receive event USER_RECALL: ', payload);
        const { chatId, messageId } = payload;
        const { userId } = client;

        const { chat, message } = await this.chatService.recallMessage(userId, chatId, messageId);
        const { members = [], blockedIds = [] } = chat;
        const activeMembers = _.difference(
            toStringArray(members as unknown as ObjectId[]),
            toStringArray(blockedIds as unknown as ObjectId[]),
        );
        this.socketGateway.server.to(activeMembers).emit(SocketEvent.USER_RECALL, {
            chatId: chatId,
            message: message,
        });
        return;
    }
}
