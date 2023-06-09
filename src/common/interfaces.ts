import { IJwtPayload } from 'src/modules/auth/auth.interface';
import { Comment, Message, Post, SubscribeRequest, SystemMessage, User } from 'src/mongo-schemas';
import { OrderBy, OrderDirection } from './constants';

export interface ICommonGetListQuery {
    page?: number;
    limit?: number;
    keyword?: string;
    orderDirection?: OrderDirection;
    orderBy?: OrderBy;
}

export interface RequestWithUser extends Request {
    user: IJwtPayload;
}

export type ReactionTarget = Post | Comment;
export type ReportTarget = Post | Comment | Message | User;
export type NotificationTarget = Post | Comment | Message | User | SubscribeRequest | SystemMessage;
