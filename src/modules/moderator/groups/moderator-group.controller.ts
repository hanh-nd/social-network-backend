import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PermissionName } from 'src/common/constants';
import { AccessTokenGuard } from 'src/common/guards';
import { AuthorizationGuard, Permissions } from 'src/common/guards/authorization.guard';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { RemoveEmptyQueryPipe } from 'src/common/pipes';
import { IGetGroupListQuery } from 'src/modules/groups/group.interface';
import { IGetModGroupStatisticQuery } from './moderator-group.interface';
import { ModeratorGroupService } from './moderator-group.service';

@Controller('/admin/groups')
@UseGuards(AccessTokenGuard, AuthorizationGuard)
export class ModeratorGroupController {
    constructor(private configService: ConfigService, private moderatorGroupService: ModeratorGroupService) {}

    private readonly logger = createWinstonLogger(ModeratorGroupController.name, this.configService);

    @Get('/')
    @Permissions([PermissionName.GET_POST])
    async getGroupList(@Query(new RemoveEmptyQueryPipe()) query: IGetGroupListQuery) {
        try {
            const result = await this.moderatorGroupService.getGroupList(query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ModeratorGroupController][getGroupList] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/statistic')
    @Permissions([PermissionName.GET_POST_STATISTIC])
    async getGroupStatistic(@Query(new RemoveEmptyQueryPipe()) query: IGetModGroupStatisticQuery) {
        try {
            const result = await this.moderatorGroupService.getGroupStatistic(query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ModeratorGroupController][getGroupStatistic] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id')
    @Permissions([PermissionName.GET_POST])
    async getGroupDetail(@Param('id') id: string) {
        try {
            const result = await this.moderatorGroupService.getGroupDetail(id);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ModeratorGroupController][getGroupDetail] ${error.stack || JSON.stringify(error)}`);
        }
    }

    @Delete('/:id')
    @Permissions([PermissionName.DELETE_POST])
    async deleteGroup(@Param('id') id: string) {
        try {
            const result = await this.moderatorGroupService.deleteGroup(id);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ModeratorGroupController][deleteGroup] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/bulk-delete')
    @Permissions([PermissionName.DELETE_POST])
    async bulkDeleteGroups(@Body() body: { ids: string[] }) {
        try {
            const result = await this.moderatorGroupService.bulkDeleteGroups(body.ids);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ModeratorGroupController][bulkDeleteGroups] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}
