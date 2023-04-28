import {
    ChatDocument,
    CommentDocument,
    MessageDocument,
    NotificationDocument,
    PostDocument,
    ReactionDocument,
    ReportDocument,
    RoleDocument,
    SubscribeRequestDocument,
    UserDocument,
    UserTokenDocument,
} from 'src/mongo-schemas';
import { IGenericRepository } from './generic.repository';

export abstract class IDataServices {
    abstract users: IGenericRepository<UserDocument>;
    abstract posts: IGenericRepository<PostDocument>;
    abstract comments: IGenericRepository<CommentDocument>;
    abstract chats: IGenericRepository<ChatDocument>;
    abstract messages: IGenericRepository<MessageDocument>;
    abstract notifications: IGenericRepository<NotificationDocument>;
    abstract reactions: IGenericRepository<ReactionDocument>;
    abstract reports: IGenericRepository<ReportDocument>;
    abstract roles: IGenericRepository<RoleDocument>;
    abstract userTokens: IGenericRepository<UserTokenDocument>;
    abstract subscribeRequests: IGenericRepository<SubscribeRequestDocument>;
}
