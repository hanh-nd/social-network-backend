import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PermissionName } from 'src/common/constants';
import { AccessTokenGuard } from 'src/common/guards';
import { AuthorizationGuard, Permissions } from 'src/common/guards/authorization.guard';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { RemoveEmptyQueryPipe, TrimBodyPipe } from 'src/common/pipes';
import { IGetUserListQuery, IUpdateProfileBody } from 'src/modules/users/user.interface';
import { IGetModUserStatisticQuery } from './moderator-user.interface';
import { ModeratorUserService } from './moderator-user.service';

@Controller('/admin/users')
@UseGuards(AccessTokenGuard, AuthorizationGuard)
export class ModeratorUserController {
    constructor(private configService: ConfigService, private moderatorUserService: ModeratorUserService) {}

    private readonly logger = createWinstonLogger(ModeratorUserController.name, this.configService);

    @Get('/')
    @Permissions([PermissionName.GET_PROFILE])
    async getUserList(@Query(new RemoveEmptyQueryPipe()) query: IGetUserListQuery) {
        try {
            const result = await this.moderatorUserService.getUserList(query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getUserList] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/statistic')
    @Permissions([PermissionName.GET_USER_STATISTIC])
    async getUserStatistic(@Query(new RemoveEmptyQueryPipe()) query: IGetModUserStatisticQuery) {
        try {
            const result = await this.moderatorUserService.getUserStatistic(query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getUserStatistic] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id')
    @Permissions([PermissionName.GET_PROFILE])
    async getUserDetail(@Param('id') id: string) {
        try {
            const result = await this.moderatorUserService.getUserDetail(id);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getUserDetail] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/:id/activate')
    @Permissions([PermissionName.DELETE_PROFILE])
    async deleteUser(@Param('id') id: string) {
        try {
            const result = await this.moderatorUserService.activateOrDeactivate(id);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[deleteUser] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/:id')
    @Permissions([PermissionName.UPDATE_PROFILE])
    async updateUser(@Param('id') id: string, @Body(new TrimBodyPipe()) body: IUpdateProfileBody) {
        try {
            const result = await this.moderatorUserService.updateUser(id, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[updateUser] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}
