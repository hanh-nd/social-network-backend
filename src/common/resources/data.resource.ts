import {
    ChatDocument,
    CommentDocument,
    GroupDocument,
    GroupPostDocument,
    NotificationDocument,
    PostDocument,
    ReactionDocument,
    ReportDocument,
    UserDocument,
} from 'src/mongo-schemas';
import { IGenericResource } from './generic.resource';

export abstract class IDataResources {
    abstract users: IGenericResource<UserDocument>;
    abstract posts: IGenericResource<PostDocument, UserDocument>;
    abstract comments: IGenericResource<CommentDocument, UserDocument>;
    abstract reactions: IGenericResource<ReactionDocument, UserDocument>;
    abstract reports: IGenericResource<ReportDocument>;
    abstract notifications: IGenericResource<NotificationDocument>;
    abstract groups: IGenericResource<GroupDocument, UserDocument>;
    abstract chats: IGenericResource<ChatDocument, UserDocument>;
    abstract groupPosts: IGenericResource<GroupPostDocument, UserDocument>;
}
