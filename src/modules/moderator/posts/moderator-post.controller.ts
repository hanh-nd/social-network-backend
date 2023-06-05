import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PermissionName } from 'src/common/constants';
import { AccessTokenGuard } from 'src/common/guards';
import { AuthorizationGuard, Permissions } from 'src/common/guards/authorization.guard';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { RemoveEmptyQueryPipe } from 'src/common/pipes';
import { IGetPostListQuery } from 'src/modules/posts/post.interface';
import { IGetModPostStatisticQuery } from './moderator-post.interface';
import { ModeratorPostService } from './moderator-post.service';

@Controller('/admin/posts')
@UseGuards(AccessTokenGuard, AuthorizationGuard)
export class ModeratorPostController {
    constructor(private configService: ConfigService, private moderatorPostService: ModeratorPostService) {}

    private readonly logger = createWinstonLogger(ModeratorPostController.name, this.configService);

    @Get('/')
    @Permissions([PermissionName.GET_POST])
    async getPostList(@Query(new RemoveEmptyQueryPipe()) query: IGetPostListQuery) {
        try {
            const result = await this.moderatorPostService.getPostList(query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ModeratorPostController][getPostList] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/statistic')
    @Permissions([PermissionName.GET_POST_STATISTIC])
    async getPostStatistic(@Query(new RemoveEmptyQueryPipe()) query: IGetModPostStatisticQuery) {
        try {
            const result = await this.moderatorPostService.getPostStatistic(query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ModeratorPostController][getPostStatistic] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id')
    @Permissions([PermissionName.GET_POST])
    async getPostDetail(@Param('id') id: string) {
        try {
            const result = await this.moderatorPostService.getPostDetail(id);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ModeratorPostController][getPostDetail] ${error.stack || JSON.stringify(error)}`);
        }
    }

    @Delete('/:id')
    @Permissions([PermissionName.DELETE_POST])
    async deletePost(@Param('id') id: string) {
        try {
            const result = await this.moderatorPostService.deletePost(id);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ModeratorPostController][deletePost] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/bulk-delete')
    @Permissions([PermissionName.DELETE_POST])
    async bulkDeletePost(@Body() body: { ids: string[] }) {
        try {
            const result = await this.moderatorPostService.bulkDeletePosts(body.ids);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[ModeratorPostController][bulkDeletePost] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}
