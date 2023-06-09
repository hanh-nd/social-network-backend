import { Injectable, NotFoundException } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_VALUE } from 'src/common/constants';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { AskUserQuestion } from 'src/mongo-schemas';
import {
    ICreateAskUserQuestionBody,
    IGetAskUserQuestionQuery,
    IUpdateAskUserQuestionBody,
} from './ask-user-question.interfaces';
import { toObjectId } from 'src/common/helper';

@Injectable()
export class AskUserQuestionService {
    constructor(private dataServices: IDataServices, private dataResources: IDataResources) {}

    async create(userId: string, body: ICreateAskUserQuestionBody) {
        const { receiver } = body;
        const toCreateAskUserQuestionBody: Partial<AskUserQuestion> = {
            ...body,
            sender: toObjectId(userId),
            receiver: toObjectId(receiver),
        };
        const createdQuestion = await this.dataServices.askUserQuestions.create(toCreateAskUserQuestionBody);
        return createdQuestion;
    }

    async getList(query?: IGetAskUserQuestionQuery) {
        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT } = query;
        const skip = (+page - 1) * +limit;
        const where = this.buildWhereQuery(query);

        const askUserQuestions = await this.dataServices.askUserQuestions.findAll(where, {
            skip: skip,
            limit: +limit,
        });

        return askUserQuestions;
    }

    private buildWhereQuery(query?: IGetAskUserQuestionQuery) {
        const { keyword } = query;

        const where: any = {};

        if (keyword?.trim()) {
            where.code = keyword.trim();
        }

        return where;
    }

    async update(id: string, body: IUpdateAskUserQuestionBody) {
        const existedAskUserQuestion = await this.dataServices.askUserQuestions.findById(id);
        if (existedAskUserQuestion) {
            throw new NotFoundException(`Tin nhắn không tồn tại trong hê thống`);
        }

        const updatedQuestion = await this.dataServices.askUserQuestions.updateById(id, body);
        return updatedQuestion;
    }

    async delete(id: string) {
        await this.dataServices.askUserQuestions.deleteById(id);
        return true;
    }
}
