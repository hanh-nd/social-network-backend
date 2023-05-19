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
import { IDataServices } from 'src/common/repositories/data.service';

@Injectable()
export class MongoDataResources implements IDataResources, OnApplicationBootstrap {
    constructor(private dataServices: IDataServices) {}

    users: IGenericResource<UserDocument>;
    posts: IGenericResource<PostDocument, UserDocument>;
    comments: IGenericResource<CommentDocument, UserDocument>;
    reactions: IGenericResource<ReactionDocument>;
    reports: IGenericResource<ReportDocument>;
    notifications: IGenericResource<NotificationDocument>;
    groups: IGenericResource<GroupDocument, UserDocument>;

    onApplicationBootstrap() {
        this.users = new UserResource(this.dataServices);
        this.posts = new PostResource(this.dataServices);
        this.comments = new CommentResource(this.dataServices);
        this.reactions = new ReactionResource(this.dataServices);
        this.reports = new ReportResource(this.dataServices);
        this.notifications = new NotificationResource(this.dataServices);
        this.groups = new GroupResource(this.dataServices);
    }
}
