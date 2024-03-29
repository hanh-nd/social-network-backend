import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MANAGE_POST_PERMISSIONS } from 'src/common/constants';
import { LoginUser } from 'src/common/decorators/login-user.decorator';
import { AccessTokenGuard } from 'src/common/guards';
import { AuthorizationGuard, Permissions } from 'src/common/guards/authorization.guard';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { RemoveEmptyQueryPipe, TrimBodyPipe } from 'src/common/pipes';
import { ICreateCommentBody, IGetCommentListQuery } from '../comments/comment.interface';
import { ICreateReactionBody, IGetReactionListQuery } from '../reactions/reaction.interface';
import { ICreateReportBody } from '../reports/report.interface';
import { ICreatePostBody, IGetPostListQuery, IUpdatePostBody } from './post.interface';
import { PostService } from './post.service';

@Controller('/posts')
@UseGuards(AccessTokenGuard, AuthorizationGuard)
export class PostController {
    constructor(private configService: ConfigService, private postService: PostService) {}

    private readonly logger = createWinstonLogger(PostController.name, this.configService);

    @Post('/')
    async createNewPost(@LoginUser() loginUser, @Body(new TrimBodyPipe()) body: ICreatePostBody) {
        try {
            const result = await this.postService.createNewPost(loginUser.userId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[createNewPost] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/news-feed')
    async getNewsFeed(@LoginUser() loginUser, @Query() query: IGetPostListQuery) {
        try {
            const result = await this.postService.getNewsFeed(loginUser.userId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getNewsFeed] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/me')
    async getUserPosts(@LoginUser() loginUser) {
        try {
            const result = await this.postService.getUserPosts(loginUser.userId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getUserPosts] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/interested')
    async getUserInterestedPosts(@LoginUser() loginUser, @Query(new RemoveEmptyQueryPipe()) query: IGetPostListQuery) {
        try {
            const result = await this.postService.getUserInterestedTagPosts(loginUser.userId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getUserInterestedPosts] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:id')
    async getPostDetail(@LoginUser() loginUser, @Param('id') postId: string) {
        try {
            const result = await this.postService.getDetail(loginUser.userId, postId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getPostDetail] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/:postId')
    async updatePost(
        @LoginUser() loginUser,
        @Param('postId') postId: string,
        @Body(new TrimBodyPipe()) body: IUpdatePostBody,
    ) {
        try {
            const result = await this.postService.updateUserPost(loginUser.userId, postId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[updatePost] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Delete('/:postId')
    async deletePost(@LoginUser() loginUser, @Param('postId') postId: string) {
        try {
            const result = await this.postService.deleteUserPost(loginUser.userId, postId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[deletePost] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:postId/comments')
    async getPostComments(
        @LoginUser() loginUser,
        @Param('postId') postId: string,
        @Query(new RemoveEmptyQueryPipe()) query: IGetCommentListQuery,
    ) {
        try {
            const result = await this.postService.getPostComment(loginUser.userId, postId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getPostComments] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:postId/comments')
    async createPostComment(
        @LoginUser() loginUser,
        @Param('postId') postId: string,
        @Body(new TrimBodyPipe()) body: ICreateCommentBody,
    ) {
        try {
            const result = await this.postService.createPostComment(loginUser.userId, postId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[createPostComment] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Patch('/:postId/comments/:commentId')
    async updatePostComment(
        @LoginUser() loginUser,
        @Param('postId') postId: string,
        @Param('commentId') commentId: string,
        @Body(new TrimBodyPipe()) body: IUpdatePostBody,
    ) {
        try {
            const result = await this.postService.updatePostComment(loginUser.userId, postId, commentId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[updatePostComment] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Delete('/:postId/comments/:commentId')
    async deletePostComment(
        @LoginUser() loginUser,
        @Param('postId') postId: string,
        @Param('commentId') commentId: string,
    ) {
        try {
            const result = await this.postService.deletePostComment(loginUser.userId, postId, commentId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[deletePostComment] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:postId/reactions')
    async getPostReactions(
        @LoginUser() loginUser,
        @Param('postId') postId: string,
        @Query(new RemoveEmptyQueryPipe()) query: IGetReactionListQuery,
    ) {
        try {
            const result = await this.postService.getPostReactions(loginUser.userId, postId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getPostReactions] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:postId/react')
    async reactOrUndoReactPost(
        @LoginUser() loginUser,
        @Param('postId') postId: string,
        @Body(new TrimBodyPipe()) body: ICreateReactionBody,
    ) {
        try {
            const result = await this.postService.reactOrUndoReactPost(loginUser.userId, postId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[reactOrUndoReactPost] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:postId/comments/:commentId/reactions')
    async getPostCommentReactions(
        @LoginUser() loginUser,
        @Param('postId') postId: string,
        @Param('commentId') commentId: string,
        @Query(new RemoveEmptyQueryPipe()) query: IGetReactionListQuery,
    ) {
        try {
            const result = await this.postService.getPostCommentReactions(loginUser.userId, postId, commentId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getPostCommentReactions] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:postId/comments/:commentId/react')
    async reactOrUndoReactPostComment(
        @LoginUser() loginUser,
        @Param('postId') postId: string,
        @Param('commentId') commentId: string,
        @Body(new TrimBodyPipe()) body: ICreateReactionBody,
    ) {
        try {
            const result = await this.postService.reactOrUndoReactPostComment(
                loginUser.userId,
                postId,
                commentId,
                body,
            );
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[reactOrUndoReactPostComment] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:postId/report')
    async reportPost(
        @LoginUser() loginUser,
        @Param('postId') postId: string,
        @Body(new TrimBodyPipe()) body: ICreateReportBody,
    ) {
        try {
            const result = await this.postService.reportPost(loginUser.userId, postId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[reportPost] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:postId/comments/:commentId/report')
    async reportPostComment(
        @LoginUser() loginUser,
        @Param('postId') postId: string,
        @Param('commentId') commentId: string,
        @Body(new TrimBodyPipe()) body: ICreateReportBody,
    ) {
        try {
            const result = await this.postService.reportPostComment(loginUser.userId, postId, commentId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[reportPostComment] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Post('/:postId/share')
    async sharePost(
        @LoginUser() loginUser,
        @Param('postId') postId: string,
        @Body(new TrimBodyPipe()) body: ICreatePostBody,
    ) {
        try {
            const result = await this.postService.sharePost(loginUser.userId, postId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[sharePost] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }

    @Get('/:postId/shares')
    async getSharePosts(
        @LoginUser() loginUser,
        @Param('postId') postId: string,
        @Query(new RemoveEmptyQueryPipe()) query: IGetPostListQuery,
    ) {
        try {
            const result = await this.postService.getSharePosts(loginUser.userId, postId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[getSharePosts] ${error.stack || JSON.stringify(error)}`);
            throw error;
        }
    }
}
