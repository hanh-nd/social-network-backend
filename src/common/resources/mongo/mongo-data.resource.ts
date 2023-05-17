import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import {
    CommentDocument,
    GroupDocument,
    NotificationDocument,
    PostDocument,
    ReactionDocument,
    ReportDocument,
    UserDocument,
} from 'src/mongo-schemas';
import { IDataResources } from '../data.resource';
import { IGenericResource } from '../generic.resource';
import { CommentResource } from './comment.resource';
import { GroupResource } from './group.resource';
import { NotificationResource } from './notification.resource';
import { PostResource } from './post.resource';
import { ReactionResource } from './reaction.resource';
import { ReportResource } from './report.resource';
import { UserResource } from './user.resource';

@Injectable()
export class MongoDataResources implements IDataResources, OnApplicationBootstrap {
    users: IGenericResource<UserDocument>;
    posts: IGenericResource<PostDocument, UserDocument>;
    comments: IGenericResource<CommentDocument, UserDocument>;
    reactions: IGenericResource<ReactionDocument>;
    reports: IGenericResource<ReportDocument>;
    notifications: IGenericResource<NotificationDocument>;
    groups: IGenericResource<GroupDocument, UserDocument>;

    onApplicationBootstrap() {
        this.users = new UserResource();
        this.posts = new PostResource();
        this.comments = new CommentResource();
        this.reactions = new ReactionResource();
        this.reports = new ReportResource();
        this.notifications = new NotificationResource();
        this.groups = new GroupResource();
    }
}
