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

    @Patch('/:id/read')
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
