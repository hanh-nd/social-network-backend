import { Chat, Comment, Message, Notification, Post, Reaction, Report, Role, User, UserToken } from 'src/mongo-schemas';
import { IGenericRepository } from './generic.repository';

export abstract class IDataServices {
    abstract users: IGenericRepository<User>;
    abstract posts: IGenericRepository<Post>;
    abstract comments: IGenericRepository<Comment>;
    abstract chats: IGenericRepository<Chat>;
    abstract messages: IGenericRepository<Message>;
    abstract notifications: IGenericRepository<Notification>;
    abstract reactions: IGenericRepository<Reaction>;
    abstract reports: IGenericRepository<Report>;
    abstract roles: IGenericRepository<Role>;
    abstract userTokens: IGenericRepository<UserToken>;
}
