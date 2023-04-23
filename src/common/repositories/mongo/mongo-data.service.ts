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
    User,
    UserDocument,
    UserToken,
    UserTokenDocument,
} from 'src/mongo-schemas';
import { IDataServices } from '../data.service';
import { MongoGenericRepository } from './mongo-generic.repository';

@Injectable()
export class MongoDataServices implements IDataServices, OnApplicationBootstrap {
    users: MongoGenericRepository<User>;
    posts: MongoGenericRepository<Post>;
    comments: MongoGenericRepository<Comment>;
    chats: MongoGenericRepository<Chat>;
    messages: MongoGenericRepository<Message>;
    notifications: MongoGenericRepository<Notification>;
    reactions: MongoGenericRepository<Reaction>;
    reports: MongoGenericRepository<Report>;
    roles: MongoGenericRepository<Role>;
    userTokens: MongoGenericRepository<UserToken>;

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
    ) {}

    onApplicationBootstrap() {
        this.users = new MongoGenericRepository<User>(this.userModel);
        this.posts = new MongoGenericRepository<Post>(this.postModel, ['postShared']);
        this.comments = new MongoGenericRepository<Comment>(this.commentModel);
        this.chats = new MongoGenericRepository<Chat>(this.chatModel);
        this.messages = new MongoGenericRepository<Message>(this.messageModel);
        this.notifications = new MongoGenericRepository<Notification>(this.notificationModel);
        this.reactions = new MongoGenericRepository<Reaction>(this.reactionModel);
        this.reports = new MongoGenericRepository<Report>(this.reportModel);
        this.roles = new MongoGenericRepository<Role>(this.roleModel);
        this.userTokens = new MongoGenericRepository<UserToken>(this.userTokenModel);
    }
}
