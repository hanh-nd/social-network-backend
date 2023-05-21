import { Socket } from 'socket.io';
import { ICreateMessageBody } from '../chats/chat.interfaces';

export interface IUserLoginPayload {
    userId: string;
}

export interface IUserChatPayload {
    chatId: string;
    body: ICreateMessageBody;
}

export interface IUserRecallPayload {
    chatId: string;
    messageId: string;
}

export interface ISocket extends Socket {
    userId?: string;
}
