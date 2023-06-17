import { Controller, Delete, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginUser } from 'src/common/decorators/login-user.decorator';
import { AccessTokenGuard } from 'src/common/guards';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { RemoveEmptyQueryPipe } from 'src/common/pipes';
import { IGetNotificationListQuery } from './notification.interface';
import { NotificationService } from './notification.service';

@Controller('/notifications')
@UseGuards(AccessTokenGuard)
export class NotificationController {
    constructor(private configService: ConfigService, private notificationService: NotificationService) {}

    private readonly logger = createWinstonLogger(NotificationController.name, this.configService);

    @Get('/')
    async getUserNotifications(
        @LoginUser() loginUser,
        @Query(new RemoveEmptyQueryPipe()) query: IGetNotificationListQuery,
    ) {
        try {
            const result = await this.notificationService.getList(loginUser.userId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getUserNotification] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/markAllAsRead')
    async markAllAsRead(@LoginUser() loginUser) {
        try {
            const result = await this.notificationService.markAllAsRead(loginUser.userId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[markAllAsRead] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/:id/read')
    async markAsRead(@LoginUser() loginUser, @Param('id') notificationId: string) {
        try {
            const result = await this.notificationService.markAsRead(loginUser.userId, notificationId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[markAsRead] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/:id/unread')
    async undoMarkAsRead(@LoginUser() loginUser, @Param('id') notificationId: string) {
        try {
            const result = await this.notificationService.undoMarkAsRead(loginUser.userId, notificationId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[undoMarkAsRead] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Delete('/:id')
    async deleteNotification(@LoginUser() loginUser, @Param('id') notificationId: string) {
        try {
            const result = await this.notificationService.delete(loginUser.userId, notificationId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[deleteNotification] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/count')
    async getUnreadNotificationCount(@LoginUser() loginUser) {
        try {
            const result = await this.notificationService.getUnreadNotificationCount(loginUser.userId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getUnreadNotificationCount] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}
