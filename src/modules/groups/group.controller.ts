import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginUser } from 'src/common/decorators/login-user.decorator';
import { AccessTokenGuard } from 'src/common/guards';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { RemoveEmptyQueryPipe, TrimBodyPipe } from 'src/common/pipes';
import { IGetGroupPostListQuery, IUpdateGroupPostBody } from '../group-posts/group-post.interface';
import { IUpdateJoinRequestBody } from '../join-requests/join-request.interface';
import {
    ICreateNewGroupBody,
    ICreatePostInGroupBody,
    IGetJoinRequestListQuery,
    IUpdateGroupBody,
} from './group.interface';
import { GroupService } from './group.service';

@Controller('/groups')
export class GroupController {
    constructor(private configService: ConfigService, private groupService: GroupService) {}

    private readonly logger = createWinstonLogger(GroupController.name, this.configService);

    @Post('/')
    @UseGuards(AccessTokenGuard)
    async createNewGroup(@LoginUser() loginUser, @Body(new TrimBodyPipe()) body: ICreateNewGroupBody) {
        try {
            const result = await this.groupService.createNewGroup(loginUser.userId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[createNewGroup] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/:id')
    @UseGuards(AccessTokenGuard)
    async updateGroup(
        @LoginUser() loginUser,
        @Param('id') groupId: string,
        @Body(new TrimBodyPipe()) body: IUpdateGroupBody,
    ) {
        try {
            const result = await this.groupService.updateGroup(loginUser.userId, groupId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[updateGroup] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:id/members/:memberId/block')
    @UseGuards(AccessTokenGuard)
    async blockOrUnblockUser(
        @LoginUser() loginUser,
        @Param('id') groupId: string,
        @Param('memberId') memberId: string,
    ) {
        try {
            const result = await this.groupService.blockOrUnblockUser(loginUser.userId, groupId, memberId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[blockOrUnblockUser] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:id/members/:memberId/remove')
    @UseGuards(AccessTokenGuard)
    async removeMember(@LoginUser() loginUser, @Param('id') groupId: string, @Param('memberId') memberId: string) {
        try {
            const result = await this.groupService.removeMember(loginUser.userId, groupId, memberId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[removeMember] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id/join-requests')
    @UseGuards(AccessTokenGuard)
    async getJoinRequests(
        @LoginUser() loginUser,
        @Param('id') groupId: string,
        @Query(new RemoveEmptyQueryPipe()) query: IGetJoinRequestListQuery,
    ) {
        try {
            const result = await this.groupService.getJoinRequests(loginUser.userId, groupId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getJoinRequests] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/:id/join-requests/:requestId')
    @UseGuards(AccessTokenGuard)
    async acceptOrRejectJoinRequest(
        @LoginUser() loginUser,
        @Param('id') groupId: string,
        @Param('requestId') requestId: string,
        @Body(new TrimBodyPipe()) body: IUpdateJoinRequestBody,
    ) {
        try {
            const result = await this.groupService.acceptOrRejectJoinRequest(
                loginUser.userId,
                groupId,
                requestId,
                body,
            );
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[acceptOrRejectJoinRequest] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id/group-posts/pending')
    @UseGuards(AccessTokenGuard)
    async getPendingGroupPosts(
        @LoginUser() loginUser,
        @Param('id') groupId: string,
        @Query(new RemoveEmptyQueryPipe()) query: IGetGroupPostListQuery,
    ) {
        try {
            const result = await this.groupService.getPendingGroupPosts(loginUser.userId, groupId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getPendingGroupPosts] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/:id/group-posts/pending/:groupPostId')
    @UseGuards(AccessTokenGuard)
    async acceptOrRejectGroupPost(
        @LoginUser() loginUser,
        @Param('id') groupId: string,
        @Param('groupPostId') groupPostId: string,
        @Body(new TrimBodyPipe()) body: IUpdateGroupPostBody,
    ) {
        try {
            const result = await this.groupService.acceptOrRejectGroupPost(
                loginUser.userId,
                groupId,
                groupPostId,
                body,
            );
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[acceptOrRejectGroupPost] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:id/group-posts/:groupPostId/pin')
    @UseGuards(AccessTokenGuard)
    async pinOrUnpinGroupPost(
        @LoginUser() loginUser,
        @Param('id') groupId: string,
        @Param('groupPostId') groupPostId: string,
    ) {
        try {
            const result = await this.groupService.pinOrUnpinGroupPost(loginUser.userId, groupId, groupPostId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[pinOrUnpinGroupPost] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id')
    @UseGuards(AccessTokenGuard)
    async getDetail(@LoginUser() loginUser, @Param('id') groupId: string) {
        try {
            const result = await this.groupService.getDetail(loginUser.userId, groupId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getDetail] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id/members')
    @UseGuards(AccessTokenGuard)
    async getMembers(@LoginUser() loginUser, @Param('id') groupId: string) {
        try {
            const result = await this.groupService.getMembers(loginUser.userId, groupId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getMembers] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:id/join-requests')
    @UseGuards(AccessTokenGuard)
    async requestToJoin(@LoginUser() loginUser, @Param('id') groupId: string) {
        try {
            const result = await this.groupService.requestToJoin(loginUser.userId, groupId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[requestToJoin] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:id/leave')
    @UseGuards(AccessTokenGuard)
    async leave(@LoginUser() loginUser, @Param('id') groupId: string) {
        try {
            const result = await this.groupService.leave(loginUser.userId, groupId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[leave] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id/group-posts')
    @UseGuards(AccessTokenGuard)
    async getPosts(
        @LoginUser() loginUser,
        @Param('id') groupId: string,
        @Query(new RemoveEmptyQueryPipe()) query: IGetGroupPostListQuery,
    ) {
        try {
            const result = await this.groupService.getPosts(loginUser.userId, groupId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getPosts] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:id/group-posts')
    @UseGuards(AccessTokenGuard)
    async createPost(
        @LoginUser() loginUser,
        @Param('id') groupId: string,
        @Body(new TrimBodyPipe()) body: ICreatePostInGroupBody,
    ) {
        try {
            const result = await this.groupService.createPost(loginUser.userId, groupId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[createPost] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Delete('/:id/group-posts/:groupPostId')
    @UseGuards(AccessTokenGuard)
    async deletePost(@LoginUser() loginUser, @Param('id') groupId: string, @Param('groupPostId') groupPostId: string) {
        try {
            const result = await this.groupService.deletePost(loginUser.userId, groupId, groupPostId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[deletePost] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}
