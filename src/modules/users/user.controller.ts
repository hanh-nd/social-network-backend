import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginUser } from 'src/common/decorators/login-user.decorator';
import { AccessTokenGuard } from 'src/common/guards';
import { AuthorizationGuard } from 'src/common/guards/authorization.guard';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { RemoveEmptyQueryPipe, TrimBodyPipe } from 'src/common/pipes';
import { IGetPostListQuery } from '../posts/post.interface';
import { ICreateReportBody } from '../reports/report.interface';
import {
    IGetSubscribeRequestListQuery,
    IUpdateSubscribeRequestBody,
} from '../subscribe-requests/subscribe-request.interface';
import {
    IChangePasswordBody,
    IGetUserListQuery,
    IRemoveSubscriberBody,
    IUpdateAlertTimeRange,
    IUpdateProfileBody,
} from './user.interface';
import { UserService } from './user.service';

@Controller('/users')
@UseGuards(AccessTokenGuard, AuthorizationGuard)
export class UserController {
    constructor(private configService: ConfigService, private userService: UserService) {}

    private readonly logger = createWinstonLogger(UserController.name, this.configService);

    @Get('/me')
    async getLoginUserProfile(@LoginUser() loginUser) {
        try {
            const user = await this.userService.getUserProfile(loginUser.userId, loginUser.userId);
            return new SuccessResponse(user);
        } catch (error) {
            this.logger.error(`[getLoginUserProfile] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/change-password')
    async changeUserPassword(@LoginUser() loginUser, @Body(new TrimBodyPipe()) body: IChangePasswordBody) {
        try {
            const result = await this.userService.changeUserPassword(loginUser.userId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[changeUserPassword] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/update-profile')
    async updateProfile(@LoginUser() loginUser, @Body(new TrimBodyPipe()) body: IUpdateProfileBody) {
        try {
            const result = await this.userService.updateProfile(loginUser.userId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[updateProfile] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id/subscribers')
    async getSubscribers(@Param('id') userId: string) {
        try {
            const result = await this.userService.getSubscribers(userId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getSubscribers] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/subscribers/remove')
    async removeSubscribers(@LoginUser() loginUser, @Body(new TrimBodyPipe()) body: IRemoveSubscriberBody) {
        try {
            const result = await this.userService.removeSubscribers(loginUser.userId, body.toRemoveId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[removeSubscribers] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/blocked-list')
    async getBlockedList(@LoginUser() loginUser) {
        try {
            const result = await this.userService.getBlockedList(loginUser.userId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getBlockedList] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get(':id/subscribing')
    async getSubscribing(@Param('id') userId) {
        try {
            const result = await this.userService.getSubscribing(userId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getSubscribing] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id/files')
    async getUserFiles(@Param('id') id: string) {
        try {
            const result = await this.userService.getUserFiles(id);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getUserFiles] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/:id/subscribe')
    async subscribeOrUnsubscribeUser(@LoginUser() loginUser, @Param('id') targetUserId: string) {
        try {
            const result = await this.userService.subscribeOrUnsubscribeUser(loginUser.userId, targetUserId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[subscribeOrUnsubscribeUser] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/:id/block')
    async blockOrUnblockUser(@LoginUser() loginUser, @Param('id') targetUserId: string) {
        try {
            const result = await this.userService.blockOrUnblockUser(loginUser.userId, targetUserId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[blockOrUnblockUser] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/subscribe-requests')
    async getSubscribeRequests(@LoginUser() loginUser, @Query() query: IGetSubscribeRequestListQuery) {
        try {
            const result = await this.userService.getSubscribeRequests(loginUser.userId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getSubscribeRequests] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/sent-subscribe-requests')
    async getSentSubscribeRequests(@LoginUser() loginUser, @Query() query: IGetSubscribeRequestListQuery) {
        try {
            const result = await this.userService.getSentSubscribeRequests(loginUser.userId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getSentSubscribeRequests] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/subscribe-requests/:subscribeRequestId')
    async updateSubscribeRequest(
        @LoginUser() loginUser,
        @Param('subscribeRequestId') subscribeRequestId: string,
        @Body(new TrimBodyPipe()) body: IUpdateSubscribeRequestBody,
    ) {
        try {
            const result = await this.userService.updateSubscribeRequest(loginUser.userId, subscribeRequestId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[updateSubscribeRequest] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/suggestions')
    async getUserSuggestions(@LoginUser() loginUser, @Query(new RemoveEmptyQueryPipe()) query: IGetUserListQuery) {
        try {
            const result = await this.userService.getUserSuggestions(loginUser.userId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[updateSubscribeRequest] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id/posts')
    async getUserPosts(
        @LoginUser() loginUser,
        @Param('id') userId,
        @Query(new RemoveEmptyQueryPipe()) query: IGetPostListQuery,
    ) {
        try {
            const result = await this.userService.getUserPosts(loginUser.userId, userId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getUserPosts] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id/details')
    async getUserDetail(@LoginUser() loginUser, @Param('id') userId: string) {
        try {
            const result = await this.userService.getUserDetail(loginUser.userId, userId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getUserDetail] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id')
    async getUserInformation(@LoginUser() loginUser, @Param('id') id: string) {
        try {
            const user = await this.userService.getUserProfile(loginUser.userId, id);
            return new SuccessResponse(user);
        } catch (error) {
            this.logger.error(`[getUserInformation] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/setting')
    async updateUserSetting(@LoginUser() loginUser, @Body(new TrimBodyPipe()) body: IUpdateAlertTimeRange) {
        try {
            const result = await this.userService.updateAlertTimeRange(loginUser.userId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[updateUserSetting] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:id/report')
    async reportUser(
        @LoginUser() loginUser,
        @Param('id') targetUserId: string,
        @Body(new TrimBodyPipe()) body: ICreateReportBody,
    ) {
        try {
            const result = await this.userService.reportUser(loginUser.userId, targetUserId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[reportUser] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}
