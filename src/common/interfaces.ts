import { Comment, Message, Post, SubscribeRequest, User } from 'src/mongo-schemas';
import { OrderBy, OrderDirection } from './constants';

export interface ICommonGetListQuery {
    page?: number;
    limit?: number;
    keyword?: string;
    orderDirection?: OrderDirection;
    orderBy?: OrderBy;
}

export interface UserToken {
    sub: string;
    username: string;
    refreshToken?: string;
}

export interface RequestWithUser extends Request {
    user: UserToken;
}

export type ReactionTarget = Post | Comment;
export type ReportTarget = Post | Comment | Message | User;
export type NotificationTarget = Post | Comment | Message | User | SubscribeRequest;
