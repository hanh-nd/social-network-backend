import { Controller, Delete, Get, InternalServerErrorException, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginUser } from 'src/common/decorators/login-user.decorator';
import { AccessTokenGuard } from 'src/common/guards';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { RemoveEmptyQueryPipe } from 'src/common/pipes';
import { IGetNotificationListQuery } from './notification.interface';
import { NotificationService } from './notification.service';

@Controller('/notifications')
export class NotificationController {
    constructor(private configService: ConfigService, private notificationService: NotificationService) {}

    private readonly logger = createWinstonLogger(NotificationController.name, this.configService);

    @Get('/')
    @UseGuards(AccessTokenGuard)
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

    @Patch('/:id/read')
    @UseGuards(AccessTokenGuard)
    async markOrUndoMarkAsRead(@LoginUser() loginUser, @Param('id') notificationId: string) {
        try {
            const result = await this.notificationService.markOrUndoMarkAsRead(loginUser.userId, notificationId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[markOrUndoMarkAsRead] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Delete('/:id')
    @UseGuards(AccessTokenGuard)
    async deleteNotification(@LoginUser() loginUser, @Param('id') notificationId: string) {
        try {
            const result = await this.notificationService.delete(loginUser.userId, notificationId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[deleteNotification] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}
