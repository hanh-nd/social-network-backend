import { ICreateMessageBody } from '../chats/chat.interfaces';

export interface IUserChatPayload {
    chatId: string;
    body: ICreateMessageBody;
}

export interface IUserRecallPayload {
    chatId: string;
    messageId: string;
}
