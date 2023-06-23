import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isArray } from 'lodash';
import { SocketEvent } from 'src/common/constants';
import { extractJSONFromText, toObjectId } from 'src/common/helper';
import { ChatGPTService } from 'src/common/modules/chatgpt/chatgpt.service';
import { createWinstonLogger } from 'src/common/modules/winston';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Survey, SurveyAnswer } from 'src/mongo-schemas';
import { SocketGateway } from '../gateway/socket.gateway';
import { SurveyType } from './surveys.constants';
import { IAnswerSurveyBody } from './surveys.interfaces';

@Injectable()
export class SurveyService {
    constructor(
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private configService: ConfigService,
        private chatGPTService: ChatGPTService,
        private socketGateway: SocketGateway,
    ) {}

    private readonly logger = createWinstonLogger(SurveyService.name, this.configService);

    async getUserSurveyDetail(userId: string, surveyId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const survey = (await this.dataServices.surveys.findById(surveyId)).toObject();
        if (!survey) {
            throw new NotFoundException(`Không tìm thấy khảo sát này.`);
        }

        const userAnswer = await this.dataServices.surveyAnswers.findOne({
            user: user._id,
            survey: survey._id,
        });

        survey.userAnswer = userAnswer;
        return survey;
    }

    async answerSurvey(userId: string, surveyId: string, body: IAnswerSurveyBody) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const existedSurvey = await this.dataServices.surveys.findById(surveyId);
        if (!existedSurvey) {
            throw new NotFoundException(`Không tìm thấy khảo sát này.`);
        }

        const createdAnswer = await this.dataServices.surveyAnswers.create({
            user: toObjectId(userId),
            survey: toObjectId(surveyId),
            ...body,
        });

        this.updateSurveyAnswer(existedSurvey, createdAnswer);
        return createdAnswer;
    }

    private async updateSurveyAnswer(survey: Survey, surveyAnswer: SurveyAnswer) {
        if (survey.type === SurveyType.CARE) {
            const response = await this.chatGPTService.sendMessage(`
            Recommend some youtube music and link provided for me if I got question: "${survey.question}" and my answer is: "${surveyAnswer.answer}", in a JSON array format of title, and link.`);
            this.logger.info(`[updateSurveyAnswer] answerId = ${surveyAnswer._id}, message = ${response.text}`);
            const json = await extractJSONFromText(response.text);
            if (json) {
                if (isArray(json)) {
                    this.socketGateway.server
                        .to(`${surveyAnswer.user}`)
                        .emit(SocketEvent.USER_SURVEY_MUSIC_RECOMMEND, json);

                    await this.dataServices.surveyAnswers.updateById(surveyAnswer._id, {
                        additionalData: {
                            recommendedMusics: json,
                        },
                    });
                }
            } else {
                const lastId = response.id;
                const resendResponse = await this.chatGPTService.sendMessage(
                    `Please give me the youtube link a in a JSON array format of title, and link.`,
                    {
                        parentMessageId: lastId,
                    },
                );
                this.logger.info(
                    `[updateSurveyAnswer] answerId = ${surveyAnswer._id}, message = ${resendResponse.text}`,
                );

                const json = await extractJSONFromText(resendResponse.text);
                if (json) {
                    if (isArray(json)) {
                        this.socketGateway.server
                            .to(`${surveyAnswer.user}`)
                            .emit(SocketEvent.USER_SURVEY_MUSIC_RECOMMEND, json);

                        await this.dataServices.surveyAnswers.updateById(surveyAnswer._id, {
                            additionalData: {
                                recommendedMusics: json,
                            },
                        });
                    }
                }
            }
        }
    }
}
