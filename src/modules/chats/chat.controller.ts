import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginUser } from 'src/common/decorators/login-user.decorator';
import { AccessTokenGuard } from 'src/common/guards';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { RemoveEmptyQueryPipe, TrimBodyPipe } from 'src/common/pipes';
import { ICreateReportBody } from '../reports/report.interface';
import { ICreateChatBody, IGetMessageListQuery, IUpdateChatBody } from './chat.interfaces';
import { ChatService } from './chat.service';

@Controller('/chats')
export class ChatController {
    constructor(private configService: ConfigService, private chatService: ChatService) {}

    private readonly logger = createWinstonLogger(ChatController.name, this.configService);

    @Post('/')
    @UseGuards(AccessTokenGuard)
    async createChat(@LoginUser() loginUser, @Body(new TrimBodyPipe()) body: ICreateChatBody) {
        try {
            const result = await this.chatService.createChat(loginUser.userId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ChatController][createChat] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/')
    @UseGuards(AccessTokenGuard)
    async getUserChats(@LoginUser() loginUser) {
        try {
            const result = await this.chatService.getUserChats(loginUser.userId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ChatController][getUserChats] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/:id')
    @UseGuards(AccessTokenGuard)
    async updateChat(@LoginUser() loginUser, @Param('id') chatId, @Body(new TrimBodyPipe()) body: IUpdateChatBody) {
        try {
            const result = await this.chatService.updateChat(loginUser.userId, chatId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ChatController][updateChat] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:id/members/:memberId')
    @UseGuards(AccessTokenGuard)
    async addOrRemoveMember(@LoginUser() loginUser, @Param('id') chatId: string, @Param('memberId') targetId: string) {
        try {
            const result = await this.chatService.addOrRemoveMember(loginUser.userId, chatId, targetId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ChatController][addOrRemoveMember] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:id/members/:memberId/admin')
    @UseGuards(AccessTokenGuard)
    async makeOrRemoveAdministrator(
        @LoginUser() loginUser,
        @Param('id') chatId: string,
        @Param('memberId') targetId: string,
    ) {
        try {
            const result = await this.chatService.makeOrRemoveAdministrator(loginUser.userId, chatId, targetId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ChatController][makeOrRemoveAdministrator] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:id/members/:memberId/block')
    @UseGuards(AccessTokenGuard)
    async blockOrUnblockMember(
        @LoginUser() loginUser,
        @Param('id') chatId: string,
        @Param('memberId') targetId: string,
    ) {
        try {
            const result = await this.chatService.blockOrUnblockMember(loginUser.userId, chatId, targetId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ChatController][blockOrUnblockMember] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Delete('/:id')
    @UseGuards(AccessTokenGuard)
    async deleteChat(@LoginUser() loginUser, @Param('id') chatId) {
        try {
            const result = await this.chatService.deleteChat(loginUser.userId, chatId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ChatController][deleteChat] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id/messages')
    @UseGuards(AccessTokenGuard)
    async getMessages(
        @LoginUser() loginUser,
        @Param('id') chatId: string,
        @Query(new RemoveEmptyQueryPipe()) query: IGetMessageListQuery,
    ) {
        try {
            const result = await this.chatService.getMessages(loginUser.userId, chatId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ChatController][getMessages] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Delete('/:id/messages/:messageId')
    @UseGuards(AccessTokenGuard)
    async deleteMessage(@LoginUser() loginUser, @Param('id') chatId: string, @Param('messageId') messageId: string) {
        try {
            const result = await this.chatService.deleteMessage(loginUser.userId, chatId, messageId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ChatController][deleteMessage] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:id/messages/:messageId')
    @UseGuards(AccessTokenGuard)
    async reportMessage(
        @LoginUser() loginUser,
        @Param('id') chatId: string,
        @Param('messageId') messageId: string,
        @Body(new TrimBodyPipe()) body: ICreateReportBody,
    ) {
        try {
            const result = await this.chatService.reportMessage(loginUser.userId, chatId, messageId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ChatController][reportMessage] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id')
    @UseGuards(AccessTokenGuard)
    async getChatDetail(@LoginUser() loginUser, @Param('id') chatId: string) {
        try {
            const result = await this.chatService.getChatDetail(loginUser.userId, chatId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ChatController][getChatDetail] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}
