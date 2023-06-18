import { ICommonGetListQuery } from 'src/common/interfaces';
import { ChatType } from './chat.constants';

export interface ICreateChatBody {
    name?: string;
    members?: string[];
    type?: ChatType;
}

export interface IUpdateChatBody {
    name?: string;
    avatarId?: string;
}

export interface ICreateMessageBody {
    content: string;
    mediaId?: string;
}

export interface IGetMessageListQuery extends ICommonGetListQuery {}
