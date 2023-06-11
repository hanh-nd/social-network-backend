import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { IDataServices } from 'src/common/repositories/data.service';
import { FileService } from 'src/modules/files/file.service';
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
import { IDataResources } from '../data.resource';
import { IGenericResource } from '../generic.resource';
import { ChatResource } from './chat.resource';
import { CommentResource } from './comment.resource';
import { GroupPostResource } from './group-post.resource';
import { GroupResource } from './group.resource';
import { NotificationResource } from './notification.resource';
import { PostResource } from './post.resource';
import { ReactionResource } from './reaction.resource';
import { ReportResource } from './report.resource';
import { UserResource } from './user.resource';

@Injectable()
export class MongoDataResources implements IDataResources, OnApplicationBootstrap {
    constructor(private dataServices: IDataServices, private fileService: FileService) {}

    users: IGenericResource<UserDocument>;
    posts: IGenericResource<PostDocument, UserDocument>;
    comments: IGenericResource<CommentDocument, UserDocument>;
    reactions: IGenericResource<ReactionDocument, UserDocument>;
    reports: IGenericResource<ReportDocument>;
    notifications: IGenericResource<NotificationDocument>;
    groups: IGenericResource<GroupDocument, UserDocument>;
    chats: IGenericResource<ChatDocument, UserDocument>;
    groupPosts: IGenericResource<GroupPostDocument, UserDocument>;

    onApplicationBootstrap() {
        this.users = new UserResource(this.dataServices);
        this.posts = new PostResource(this.dataServices, this.fileService);
        this.comments = new CommentResource(this.dataServices);
        this.reactions = new ReactionResource(this.dataServices);
        this.reports = new ReportResource(this.dataServices);
        this.notifications = new NotificationResource(this.dataServices);
        this.groups = new GroupResource(this.dataServices, this.fileService);
        this.chats = new ChatResource(this.dataServices);
        this.groupPosts = new GroupPostResource(this.dataServices, this.fileService);
    }
}
