import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    Chat,
    ChatDocument,
    Comment,
    CommentDocument,
    Message,
    MessageDocument,
    Notification,
    NotificationDocument,
    Post,
    PostDocument,
    Reaction,
    ReactionDocument,
    Report,
    ReportDocument,
    Role,
    RoleDocument,
    SubscribeRequest,
    SubscribeRequestDocument,
    User,
    UserDocument,
    UserToken,
    UserTokenDocument,
} from 'src/mongo-schemas';
import { IDataServices } from '../data.service';
import { MongoGenericRepository } from './mongo-generic.repository';

@Injectable()
export class MongoDataServices implements IDataServices, OnApplicationBootstrap {
    users: MongoGenericRepository<UserDocument>;
    posts: MongoGenericRepository<PostDocument>;
    comments: MongoGenericRepository<CommentDocument>;
    chats: MongoGenericRepository<ChatDocument>;
    messages: MongoGenericRepository<MessageDocument>;
    notifications: MongoGenericRepository<NotificationDocument>;
    reactions: MongoGenericRepository<ReactionDocument>;
    reports: MongoGenericRepository<ReportDocument>;
    roles: MongoGenericRepository<RoleDocument>;
    userTokens: MongoGenericRepository<UserTokenDocument>;
    subscribeRequests: MongoGenericRepository<SubscribeRequestDocument>;

    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        @InjectModel(Post.name)
        private postModel: Model<PostDocument>,
        @InjectModel(Comment.name)
        private commentModel: Model<CommentDocument>,
        @InjectModel(Chat.name)
        private chatModel: Model<ChatDocument>,
        @InjectModel(Message.name)
        private messageModel: Model<MessageDocument>,
        @InjectModel(Notification.name)
        private notificationModel: Model<NotificationDocument>,
        @InjectModel(Reaction.name)
        private reactionModel: Model<ReactionDocument>,
        @InjectModel(Report.name)
        private reportModel: Model<ReportDocument>,
        @InjectModel(Role.name)
        private roleModel: Model<RoleDocument>,
        @InjectModel(UserToken.name)
        private userTokenModel: Model<UserTokenDocument>,
        @InjectModel(SubscribeRequest.name)
        private subscribeRequestModel: Model<SubscribeRequestDocument>,
    ) {}

    onApplicationBootstrap() {
        this.users = new MongoGenericRepository<UserDocument>(this.userModel);
        this.posts = new MongoGenericRepository<PostDocument>(this.postModel);
        this.comments = new MongoGenericRepository<CommentDocument>(this.commentModel);
        this.chats = new MongoGenericRepository<ChatDocument>(this.chatModel);
        this.messages = new MongoGenericRepository<MessageDocument>(this.messageModel);
        this.notifications = new MongoGenericRepository<NotificationDocument>(this.notificationModel);
        this.reactions = new MongoGenericRepository<ReactionDocument>(this.reactionModel);
        this.reports = new MongoGenericRepository<ReportDocument>(this.reportModel);
        this.roles = new MongoGenericRepository<RoleDocument>(this.roleModel);
        this.userTokens = new MongoGenericRepository<UserTokenDocument>(this.userTokenModel);
        this.subscribeRequests = new MongoGenericRepository<SubscribeRequestDocument>(this.subscribeRequestModel);
    }
}
