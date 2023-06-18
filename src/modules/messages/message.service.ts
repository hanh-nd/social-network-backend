import { BadRequestException, Injectable } from '@nestjs/common';
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_VALUE, ReportTargetType } from 'src/common/constants';
import { toObjectId } from 'src/common/helper';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Chat, Message, User } from 'src/mongo-schemas';
import { ICreateMessageBody, IGetMessageListQuery } from '../chats/chat.interfaces';
import { ICreateReportBody } from '../reports/report.interface';
import { ReportService } from '../reports/report.service';

@Injectable()
export class MessageService {
    constructor(
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private reportService: ReportService,
    ) {}

    async createMessage(user: User, chat: Chat, body: ICreateMessageBody) {
        const { blockedIds = [] } = chat;
        const { content, mediaId } = body;
        const toCreateMessageBody: Partial<Message> = {
            author: toObjectId(user._id) as unknown,
            chat: toObjectId(chat._id) as unknown,
            content,
            mediaId: toObjectId(mediaId),
            isRecalled: false,
            deletedFor: blockedIds,
        };

        const createdMessage = await this.dataServices.messages.create(toCreateMessageBody);
        await createdMessage.populate([
            {
                path: 'author',
                select: '_id fullName avatarId',
            },
        ]);
        return createdMessage;
    }

    async getMessages(user: User, chat: Chat, query: IGetMessageListQuery) {
        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT } = query;
        const skip = (+page - 1) * +limit;

        const messages = await this.dataServices.messages.findAll(
            {
                chat: toObjectId(chat._id),
                deletedFor: {
                    $ne: toObjectId(user._id),
                },
            },
            {
                populate: [
                    {
                        path: 'author',
                        select: '_id fullName avatarId',
                    },
                ],
                sort: [['createdAt', -1]],
                skip,
                limit: +limit,
            },
        );

        return messages;
    }

    async recallMessage(user: User, chat: Chat, messageId: string) {
        const message = await this.dataServices.messages.findOne({
            _id: toObjectId(messageId),
            author: toObjectId(user._id),
            chat: toObjectId(chat._id),
            isRecalled: false,
        });
        if (!message) {
            throw new BadRequestException(`Không tìm thấy tin nhắn hoặc tin nhắn đã bị thu hồi.`);
        }

        await this.dataServices.messages.updateById(message._id, {
            isRecalled: true,
            content: `Tin nhắn đã bị thu hồi.`,
            mediaId: null,
        });

        const updatedMessage = await this.dataServices.messages.findById(message._id);
        return updatedMessage;
    }

    async deleteMessage(user: User, chat: Chat, messageId: string) {
        const message = await this.dataServices.messages.findOne({
            _id: toObjectId(messageId),
            chat: toObjectId(chat._id),
        });
        if (!message) {
            throw new BadRequestException(`Không tìm thấy tin nhắn hoặc tin nhắn đã bị thu hồi.`);
        }

        const { deletedFor = [] } = message;
        deletedFor.push(toObjectId(user._id) as unknown);

        await this.dataServices.messages.updateById(message._id, {
            deletedFor,
        });
    }

    async reportMessage(user: User, chat: Chat, messageId: string, body: ICreateReportBody) {
        const message = await this.dataServices.messages.findOne({
            _id: toObjectId(messageId),
            chat: toObjectId(chat._id),
        });
        if (!message) {
            throw new BadRequestException(`Không tìm thấy tin nhắn hoặc tin nhắn đã bị thu hồi.`);
        }

        const createdReportId = await this.reportService.create(user, ReportTargetType.MESSAGE, message, body);
        return createdReportId;
    }
}
