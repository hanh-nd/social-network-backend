import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    Chat,
    ChatSchema,
    Comment,
    CommentSchema,
    Message,
    MessageSchema,
    Notification,
    NotificationSchema,
    Post,
    PostSchema,
    Reaction,
    ReactionSchema,
    Report,
    ReportSchema,
} from 'src/mongo-schemas';
import { User, UserSchema } from 'src/mongo-schemas/user.schema';
import { IDataServices } from '../data.service';
import { MongoDataServices } from './mongo-data.service';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
        MongooseModule.forFeature([
            { name: Comment.name, schema: CommentSchema },
        ]),
        MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
        MongooseModule.forFeature([
            { name: Message.name, schema: MessageSchema },
        ]),
        MongooseModule.forFeature([
            { name: Notification.name, schema: NotificationSchema },
        ]),
        MongooseModule.forFeature([
            { name: Reaction.name, schema: ReactionSchema },
        ]),
        MongooseModule.forFeature([
            { name: Report.name, schema: ReportSchema },
        ]),
    ],
    providers: [
        {
            provide: IDataServices,
            useClass: MongoDataServices,
        },
    ],
    exports: [IDataServices],
})
export class MongoDataServicesModule {}
