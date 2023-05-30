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
import { AuthorizationGuard, Permissions } from 'src/common/guards/authorization.guard';
import { MANAGE_CHAT_PERMISSIONS } from 'src/common/constants';

@Controller('/chats')
@UseGuards(AccessTokenGuard, AuthorizationGuard)
export class ChatController {
    constructor(private configService: ConfigService, private chatService: ChatService) {}

    private readonly logger = createWinstonLogger(ChatController.name, this.configService);

    @Post('/')
    @Permissions(MANAGE_CHAT_PERMISSIONS)
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
    @Permissions(MANAGE_CHAT_PERMISSIONS)
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
    @Permissions(MANAGE_CHAT_PERMISSIONS)
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
    @Permissions(MANAGE_CHAT_PERMISSIONS)
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
    @Permissions(MANAGE_CHAT_PERMISSIONS)
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
    @Permissions(MANAGE_CHAT_PERMISSIONS)
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
    @Permissions(MANAGE_CHAT_PERMISSIONS)
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
    @Permissions(MANAGE_CHAT_PERMISSIONS)
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
    @Permissions(MANAGE_CHAT_PERMISSIONS)
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
    @Permissions(MANAGE_CHAT_PERMISSIONS)
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
    @Permissions(MANAGE_CHAT_PERMISSIONS)
    async getChatDetail(@LoginUser() loginUser, @Param('id') chatId: string) {
        try {
            const result = await this.chatService.getChatDetail(loginUser.userId, chatId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ChatController][getChatDetail] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:id/leave')
    @Permissions(MANAGE_CHAT_PERMISSIONS)
    async leaveChat(@LoginUser() loginUser, @Param('id') chatId: string) {
        try {
            const result = await this.chatService.leaveChat(loginUser.userId, chatId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ChatController][leaveChat] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}