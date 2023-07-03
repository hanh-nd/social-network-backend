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
    IGetGroupListQuery,
    IGetJoinRequestListQuery,
    IUpdateGroupBody,
} from './group.interface';
import { GroupService } from './group.service';
import { AuthorizationGuard, Permissions } from 'src/common/guards/authorization.guard';
import { MANAGE_GROUP_PERMISSIONS } from 'src/common/constants';

@Controller('/groups')
@UseGuards(AccessTokenGuard, AuthorizationGuard)
export class GroupController {
    constructor(private configService: ConfigService, private groupService: GroupService) {}

    private readonly logger = createWinstonLogger(GroupController.name, this.configService);

    @Post('/')
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

    @Get('/:id/members')
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
    async requestToJoin(@LoginUser() loginUser, @Param('id') groupId: string) {
        try {
            const result = await this.groupService.requestToJoin(loginUser.userId, groupId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[requestToJoin] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:id/cancel-join-requests')
    async cancelToJoin(@LoginUser() loginUser, @Param('id') groupId: string) {
        try {
            const result = await this.groupService.cancelToJoin(loginUser.userId, groupId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[cancelToJoin] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:id/leave')
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
    async deletePost(@LoginUser() loginUser, @Param('id') groupId: string, @Param('groupPostId') groupPostId: string) {
        try {
            const result = await this.groupService.deletePost(loginUser.userId, groupId, groupPostId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[deletePost] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/my-groups')
    async getUserCreatedGroups(@LoginUser() loginUser, @Query(new RemoveEmptyQueryPipe()) query: IGetGroupListQuery) {
        try {
            const result = await this.groupService.getUserCreatedGroups(loginUser.userId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getUserCreatedGroups] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/')
    async getUserJoinedGroups(@LoginUser() loginUser, @Query(new RemoveEmptyQueryPipe()) query: IGetGroupListQuery) {
        try {
            const result = await this.groupService.getUserJoinedGroups(loginUser.userId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getUserJoinedGroups] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/group-posts')
    async getGroupFeed(@LoginUser() loginUser, @Query(new RemoveEmptyQueryPipe()) query: IGetGroupPostListQuery) {
        try {
            const result = await this.groupService.getGroupFeed(loginUser.userId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getGroupFeed] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id')
    async getDetail(@LoginUser() loginUser, @Param('id') groupId: string) {
        try {
            const result = await this.groupService.getDetail(loginUser.userId, groupId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getDetail] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id/my-pending')
    async getUserPendingPost(@LoginUser() loginUser, @Param('id') groupId: string, query: IGetGroupPostListQuery) {
        try {
            const result = await this.groupService.getUserPendingPost(loginUser.userId, groupId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getUserPendingPost] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:id/make-administrator/:targetId')
    async makeAdministrator(@LoginUser() loginUser, @Param('id') groupId: string, @Param('targetId') targetId: string) {
        try {
            const result = await this.groupService.makeAdministrator(loginUser.userId, groupId, targetId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[makeAdministrator] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:id/remove-administrator/:targetId')
    async removeAdministrator(
        @LoginUser() loginUser,
        @Param('id') groupId: string,
        @Param('targetId') targetId: string,
    ) {
        try {
            const result = await this.groupService.removeAdministrator(loginUser.userId, groupId, targetId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[removeAdministrator] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}
