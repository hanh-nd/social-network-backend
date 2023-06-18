import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginUser } from 'src/common/decorators/login-user.decorator';
import { AccessTokenGuard } from 'src/common/guards';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { TrimBodyPipe } from 'src/common/pipes';
import { IAnswerSurveyBody } from './surveys.interfaces';
import { SurveyService } from './surveys.service';

@Controller('/surveys')
@UseGuards(AccessTokenGuard)
export class SurveyController {
    constructor(private configService: ConfigService, private surveyService: SurveyService) {}

    private readonly logger = createWinstonLogger(SurveyController.name, this.configService);

    @Get('/:id')
    async getUserSurveyDetail(@LoginUser() loginUser, @Param('id') surveyId: string) {
        try {
            const result = await this.surveyService.getUserSurveyDetail(loginUser.userId, surveyId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getUserSurveyDetail] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:id/answers')
    async answerSurvey(
        @LoginUser() loginUser,
        @Param('id') surveyId: string,
        @Body(new TrimBodyPipe()) body: IAnswerSurveyBody,
    ) {
        try {
            const result = await this.surveyService.answerSurvey(loginUser.userId, surveyId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[answerSurvey] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}
