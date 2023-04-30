import {
    CommentDocument,
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
    abstract comments: IGenericResource<CommentDocument>;
    abstract reactions: IGenericResource<ReactionDocument>;
    abstract reports: IGenericResource<ReportDocument>;
    abstract notifications: IGenericResource<NotificationDocument>;
}
