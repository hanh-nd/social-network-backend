import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
    AskUserQuestion,
    AskUserQuestionDocument,
    Chat,
    ChatDocument,
    Comment,
    CommentDocument,
    Config,
    ConfigDocument,
    Group,
    GroupDocument,
    GroupPost,
    GroupPostDocument,
    JobConfig,
    JobConfigDocument,
    JoinRequest,
    JoinRequestDocument,
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
    Survey,
    SurveyAnswer,
    SurveyAnswerDocument,
    SurveyDocument,
    SystemMessage,
    SystemMessageDocument,
    Tag,
    TagDocument,
    User,
    UserDailyStatistic,
    UserDailyStatisticDocument,
    UserDetail,
    UserDetailDocument,
    UserDocument,
    UserToken,
    UserTokenDocument,
} from 'src/mongo-schemas';
import { IDataServices } from '../data.service';
import { IGenericRepository } from '../generic.repository';
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
    groups: MongoGenericRepository<GroupDocument>;
    groupPosts: MongoGenericRepository<GroupPostDocument>;
    joinRequests: MongoGenericRepository<JoinRequestDocument>;
    tags: MongoGenericRepository<TagDocument>;
    userDetails: IGenericRepository<UserDetailDocument>;
    userDailyStatistics: IGenericRepository<UserDailyStatisticDocument>;
    systemMessages: IGenericRepository<SystemMessageDocument>;
    askUserQuestions: IGenericRepository<AskUserQuestionDocument>;
    jobConfigs: IGenericRepository<JobConfigDocument>;
    surveyAnswers: IGenericRepository<SurveyAnswerDocument>;
    surveys: IGenericRepository<SurveyDocument>;
    configs: IGenericRepository<ConfigDocument>;

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
        @InjectModel(Group.name)
        private groupModel: Model<GroupDocument>,
        @InjectModel(JoinRequest.name)
        private joinRequestModel: Model<JoinRequestDocument>,
        @InjectModel(GroupPost.name)
        private groupPostModel: Model<GroupPostDocument>,
        @InjectModel(Tag.name)
        private tagModel: Model<TagDocument>,
        @InjectModel(UserDetail.name)
        private userDetailModel: Model<UserDetailDocument>,
        @InjectModel(UserDailyStatistic.name)
        private userDailyStatisticModel: Model<UserDailyStatisticDocument>,
        @InjectModel(SystemMessage.name)
        private systemMessageModel: Model<SystemMessageDocument>,
        @InjectModel(AskUserQuestion.name)
        private askUserQuestionModel: Model<AskUserQuestionDocument>,
        @InjectModel(JobConfig.name)
        private jobConfigModel: Model<JobConfigDocument>,
        @InjectModel(Survey.name)
        private surveyModel: Model<SurveyDocument>,
        @InjectModel(SurveyAnswer.name)
        private surveyAnswerModel: Model<SurveyAnswerDocument>,
        @InjectModel(Config.name)
        private configModel: Model<ConfigDocument>,
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
        this.groups = new MongoGenericRepository<GroupDocument>(this.groupModel);
        this.joinRequests = new MongoGenericRepository<JoinRequestDocument>(this.joinRequestModel);
        this.groupPosts = new MongoGenericRepository<GroupPostDocument>(this.groupPostModel);
        this.tags = new MongoGenericRepository<TagDocument>(this.tagModel);
        this.userDetails = new MongoGenericRepository<UserDetailDocument>(this.userDetailModel);
        this.userDailyStatistics = new MongoGenericRepository<UserDailyStatisticDocument>(this.userDailyStatisticModel);
        this.systemMessages = new MongoGenericRepository<SystemMessageDocument>(this.systemMessageModel);
        this.askUserQuestions = new MongoGenericRepository<AskUserQuestionDocument>(this.askUserQuestionModel);
        this.jobConfigs = new MongoGenericRepository<JobConfigDocument>(this.jobConfigModel);
        this.surveys = new MongoGenericRepository<SurveyDocument>(this.surveyModel);
        this.surveyAnswers = new MongoGenericRepository<SurveyAnswerDocument>(this.surveyAnswerModel);
        this.configs = new MongoGenericRepository<ConfigDocument>(this.configModel);
    }
}
