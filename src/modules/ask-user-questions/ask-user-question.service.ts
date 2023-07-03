import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import {
    DEFAULT_PAGE_LIMIT,
    DEFAULT_PAGE_VALUE,
    NotificationAction,
    NotificationTargetType,
} from 'src/common/constants';
import { toObjectId } from 'src/common/helper';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { AskUserQuestion } from 'src/mongo-schemas';
import { NotificationService } from '../notifications/notification.service';
import {
    ICreateAskUserQuestionBody,
    IGetAskUserQuestionQuery,
    IUpdateAskUserQuestionBody,
} from './ask-user-question.interfaces';

@Injectable()
export class AskUserQuestionService {
    constructor(
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private notificationService: NotificationService,
    ) {}

    async create(userId: string, body: ICreateAskUserQuestionBody) {
        const { receiver } = body;
        const toCreateAskUserQuestionBody: Partial<AskUserQuestion> = {
            ...body,
            sender: toObjectId(userId),
            receiver: toObjectId(receiver),
        };
        const createdQuestion = await this.dataServices.askUserQuestions.create(toCreateAskUserQuestionBody);
        this.notificationService.create(
            {
                _id: userId,
            },
            {
                _id: receiver,
            },
            NotificationTargetType.QUESTION,
            createdQuestion,
            NotificationAction.ASK_QUESTION,
        );
        return createdQuestion;
    }

    async getList(userId: string, query?: IGetAskUserQuestionQuery) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT } = query;
        const skip = (+page - 1) * +limit;
        const where = this.buildWhereQuery({
            ...query,
            userId: user._id,
        });

        const askUserQuestions = await this.dataServices.askUserQuestions.findAll(where, {
            populate: ['sender'],
            skip: skip,
            limit: +limit,
        });

        const questionDtos = await this.dataResources.askUserQuestions.mapToDtoList(askUserQuestions);
        return questionDtos;
    }

    private buildWhereQuery(query?: IGetAskUserQuestionQuery) {
        const { keyword, userId, pending } = query;

        const where: any = {};

        if (keyword?.trim()) {
            where.code = keyword.trim();
        }

        if (userId) {
            where.receiver = toObjectId(userId);
        }

        if (+pending) {
            where.answer = {
                $eq: null,
            };
        }

        return where;
    }

    async update(id: string, body: IUpdateAskUserQuestionBody) {
        const existedAskUserQuestion = await this.dataServices.askUserQuestions.findById(id);
        if (!existedAskUserQuestion) {
            throw new NotFoundException(`Câu hỏi không tồn tại trong hê thống`);
        }

        const updatedQuestion = await this.dataServices.askUserQuestions.updateById(id, body);
        return updatedQuestion;
    }

    async delete(id: string) {
        await this.dataServices.askUserQuestions.deleteById(id);
        return true;
    }
}
