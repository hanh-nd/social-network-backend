import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccessTokenGuard } from 'src/common/guards';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { RemoveEmptyQueryPipe, TrimBodyPipe } from 'src/common/pipes';
import {
    ICreateSurveyBody,
    IGetSurveyListQuery,
    IGetUserAnswerQuery,
    IUpdateSurveyBody,
} from './moderator-surveys.interfaces';
import { ModeratorSurveyService } from './moderator-surveys.service';

@Controller('/admin/surveys')
@UseGuards(AccessTokenGuard)
export class ModeratorSurveyController {
    constructor(private configService: ConfigService, private surveyService: ModeratorSurveyService) {}

    private readonly logger = createWinstonLogger(ModeratorSurveyController.name, this.configService);

    @Post('/')
    async createSurvey(@Body(new TrimBodyPipe()) body: ICreateSurveyBody) {
        try {
            const result = await this.surveyService.createSurvey(body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[createSurvey] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/:id')
    async updateSurvey(@Param('id') id: string, @Body(new TrimBodyPipe()) body: IUpdateSurveyBody) {
        try {
            const result = await this.surveyService.updateSurvey(id, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[surveyService] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Delete('/:id')
    async deleteSurvey(@Param('id') id: string) {
        try {
            const result = await this.surveyService.deleteSurvey(id);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[deleteSurvey] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/')
    async getSurveyList(@Query(new RemoveEmptyQueryPipe()) query: IGetSurveyListQuery) {
        try {
            const result = await this.surveyService.getSurveyList(query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getSurveyList] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id/admin')
    async getAdminSurveyDetail(@Param('id') surveyId: string) {
        try {
            const result = await this.surveyService.getAdminSurveyDetail(surveyId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getAdminSurveyDetail] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id/answers')
    async getUserAnswers(@Param('id') surveyId: string, @Query(new RemoveEmptyQueryPipe()) query: IGetUserAnswerQuery) {
        try {
            const result = await this.surveyService.getUserAnswers(surveyId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getUserAnswers] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}
