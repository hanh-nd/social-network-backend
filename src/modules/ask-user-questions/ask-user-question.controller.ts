import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginUser } from 'src/common/decorators/login-user.decorator';
import { AccessTokenGuard } from 'src/common/guards';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { RemoveEmptyQueryPipe, TrimBodyPipe } from 'src/common/pipes';
import {
    ICreateAskUserQuestionBody,
    IGetAskUserQuestionQuery,
    IUpdateAskUserQuestionBody,
} from './ask-user-question.interfaces';
import { AskUserQuestionService } from './ask-user-question.service';

@Controller('/questions')
@UseGuards(AccessTokenGuard)
export class AskUserQuestionController {
    constructor(private configService: ConfigService, private askUserQuestionService: AskUserQuestionService) {}

    private readonly logger = createWinstonLogger(AskUserQuestionController.name, this.configService);

    @Get('/')
    async getList(@LoginUser() loginUser, @Query(new RemoveEmptyQueryPipe()) query: IGetAskUserQuestionQuery) {
        try {
            const result = await this.askUserQuestionService.getList(loginUser.userId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getMessages] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/')
    async create(@LoginUser() loginUser, @Body(new TrimBodyPipe()) body: ICreateAskUserQuestionBody) {
        try {
            const result = await this.askUserQuestionService.create(loginUser.userId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[create] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/:id')
    async update(@Param('id') id: string, @Body(new TrimBodyPipe()) body: IUpdateAskUserQuestionBody) {
        try {
            const result = await this.askUserQuestionService.update(id, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[updateMessage] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Delete('/:id')
    async delete(@Param('id') id: string) {
        try {
            const result = await this.askUserQuestionService.delete(id);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[deleteMessage] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}
