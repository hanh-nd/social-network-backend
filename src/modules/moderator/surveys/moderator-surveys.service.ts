import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isArray } from 'lodash';
import * as moment from 'moment';
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_VALUE } from 'src/common/constants';
import { extractJSONFromText, toObjectId } from 'src/common/helper';
import { ChatGPTService } from 'src/common/modules/chatgpt/chatgpt.service';
import { createWinstonLogger } from 'src/common/modules/winston';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Survey } from 'src/mongo-schemas';
import {
    ICreateSurveyBody,
    IGetSurveyListQuery,
    IGetUserAnswerQuery,
    IUpdateSurveyBody,
} from './moderator-surveys.interfaces';

@Injectable()
export class ModeratorSurveyService {
    constructor(
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private configService: ConfigService,
        private chatGPTService: ChatGPTService,
    ) {}

    private readonly logger = createWinstonLogger(ModeratorSurveyService.name, this.configService);

    async createSurvey(body: ICreateSurveyBody) {
        const { askDate, quickAnswers } = body;
        const toCreateBody: Partial<Survey> = {
            ...body,
        };

        if (askDate) {
            toCreateBody.askDate = moment(askDate, 'YYYY-MM-DD HH:mm:ss').subtract(7, 'hours').toDate();
        }

        if (quickAnswers) {
            toCreateBody.quickAnswers = `${quickAnswers}`.split(';').map((e) => e.trim());
        }

        const createdSurvey = await this.dataServices.surveys.create(toCreateBody);
        if (!quickAnswers) {
            this.updateQuickAnswers(createdSurvey);
        }
        return createdSurvey;
    }

    async updateSurvey(id: string, body: IUpdateSurveyBody) {
        const existedSurvey = await this.dataServices.surveys.findById(id);
        if (!existedSurvey) {
            throw new NotFoundException(`Không tìm thấy khảo sát này.`);
        }

        const { askDate, quickAnswers } = body;
        const toUpdateBody: Partial<Survey> = {
            ...body,
        };

        if (askDate) {
            toUpdateBody.askDate = moment(askDate, 'YYYY-MM-DD HH:mm:ss').subtract(7, 'hours').toDate();
        }

        if (quickAnswers) {
            toUpdateBody.quickAnswers = `${quickAnswers}`.split(';').map((e) => e.trim());
        }

        if (
            !body.quickAnswers ||
            (!existedSurvey.quickAnswers && body.question && existedSurvey.question !== body.question)
        ) {
            this.updateQuickAnswers(existedSurvey);
        }
        const updatedSurvey = await this.dataServices.surveys.updateById(id, toUpdateBody);
        return updatedSurvey;
    }

    private async updateQuickAnswers(survey: Survey) {
        const prompts = [];
        prompts.push({
            role: 'user',
            content: `Give me 3 answer for the following question: "${survey.question}", in the json array of 3 objects with following interface: { answer }`,
        });
        const response = await this.chatGPTService.sendMessage(JSON.stringify(prompts));
        prompts.push({
            role: 'assistant',
            content: response.text,
        });
        this.logger.info(`[getQuickAnswers] surveyId = ${survey._id}, message = ${response.text}`);
        let json = await extractJSONFromText(response.text);

        let retriedTimes = 0;
        while ((!json || !isArray(json)) && retriedTimes < 3) {
            retriedTimes++;
            prompts.push({
                role: 'user',
                content: `Give me the answers a in a JSON array format with 3 objects of key answer.`,
            });
            const resendResponse = await this.chatGPTService.sendMessage(JSON.stringify(prompts));
            prompts.push({
                role: 'assistant',
                content: resendResponse.text,
            });
            this.logger.info(`[getQuickAnswers] surveyId = ${survey._id}, message = ${resendResponse.text}`);
            json = await extractJSONFromText(resendResponse.text);
        }
        if (json && isArray(json)) {
            const quickAnswers = json.map((j) => j.answer);
            await this.dataServices.surveys.updateById(survey._id, {
                quickAnswers: quickAnswers,
            });
        }
    }

    async deleteSurvey(id: string) {
        const existedSurvey = await this.dataServices.surveys.findById(id);
        if (!existedSurvey) {
            throw new NotFoundException(`Không tìm thấy khảo sát này.`);
        }

        await this.dataServices.surveys.deleteById(id);
        return true;
    }

    async getSurveyList(query?: IGetSurveyListQuery) {
        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT } = query;
        const skip = (+page - 1) * +limit;
        const where = this._buildWhereQuery(query);

        const surveys = await this.dataServices.surveys.findAll(where, {
            skip: skip,
            limit: +limit,
            sort: [['createdAt', -1]],
        });

        return surveys;
    }

    private _buildWhereQuery(query: IGetSurveyListQuery) {
        const { keyword } = query;

        const where: any = {};

        if (keyword?.trim()) {
            where.$or = [
                {
                    name: new RegExp(keyword.trim(), 'gi'),
                },
                {
                    description: new RegExp(keyword.trim(), 'gi'),
                },
            ];
        }

        return where;
    }

    async getAdminSurveyDetail(surveyId: string) {
        const survey = await this.dataServices.surveys.findById(surveyId);
        if (!survey) {
            throw new NotFoundException(`Không tìm thấy khảo sát này.`);
        }

        return survey;
    }

    async getUserAnswers(surveyId: string, query: IGetUserAnswerQuery) {
        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT } = query;
        const skip = (+page - 1) * +limit;
        const where = this._buildWhereUserAnswersQuery(surveyId, query);

        const userAnswers = await this.dataServices.surveyAnswers.findAll(where, {
            skip: skip,
            limit: +limit,
            sort: [['createdAt', -1]],
        });

        return userAnswers;
    }

    private _buildWhereUserAnswersQuery(surveyId: string, query: IGetUserAnswerQuery) {
        const { keyword } = query;

        const where: any = {
            survey: toObjectId(surveyId),
        };
        if (keyword?.trim()) {
            where.username = new RegExp(keyword.trim(), 'gi');
        }

        return where;
    }
}
