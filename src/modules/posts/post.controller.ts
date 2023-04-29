import {
    Body,
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginUser } from 'src/common/decorators/login-user.decorator';
import { AccessTokenGuard } from 'src/common/guards';
import { SuccessResponse } from 'src/common/helper';
import { createWinstonLogger } from 'src/common/modules/winston';
import { RemoveEmptyQueryPipe, TrimBodyPipe } from 'src/common/pipes';
import { ICreateCommentBody, IGetCommentListQuery } from '../comments/comment.interface';
import { ICreatePostBody, IGetPostListQuery, IUpdatePostBody } from './post.interface';
import { PostService } from './post.service';

@Controller('/posts')
export class PostController {
    constructor(private configService: ConfigService, private postService: PostService) {}

    private readonly logger = createWinstonLogger(PostController.name, 'post', this.configService);

    @Post('/')
    @UseGuards(AccessTokenGuard)
    async createNewPost(@LoginUser() loginUser, @Body(new TrimBodyPipe()) body: ICreatePostBody) {
        try {
            const result = await this.postService.createNewPost(loginUser.userId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[PostController][createNewPost] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/news-feed')
    @UseGuards(AccessTokenGuard)
    async getNewsFeed(@LoginUser() loginUser, @Query() query: IGetPostListQuery) {
        try {
            const result = await this.postService.getNewsFeed(loginUser.userId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[PostController][getNewsFeed] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/me')
    @UseGuards(AccessTokenGuard)
    async getUserPosts(@LoginUser() loginUser) {
        try {
            const result = await this.postService.getUserPosts(loginUser.userId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[PostController][createNewPost] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/:id')
    @UseGuards(AccessTokenGuard)
    async getPostDetail(@LoginUser() loginUser, @Param('id') postId: string) {
        try {
            const result = await this.postService.getDetail(loginUser.userId, postId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[PostController][getPostDetail] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Patch('/:postId')
    @UseGuards(AccessTokenGuard)
    async updatePost(
        @LoginUser() loginUser,
        @Param('postId') postId: string,
        @Body(new TrimBodyPipe()) body: IUpdatePostBody,
    ) {
        try {
            const result = await this.postService.updateUserPost(loginUser.userId, postId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[PostController][updatePost] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Delete('/:postId')
    @UseGuards(AccessTokenGuard)
    async deletePost(@LoginUser() loginUser, @Param('postId') postId: string) {
        try {
            const result = await this.postService.deleteUserPost(loginUser.userId, postId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[PostController][deletePost] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Get('/:postId/comments')
    @UseGuards(AccessTokenGuard)
    async getPostComments(
        @Param('postId') postId: string,
        @Query(new RemoveEmptyQueryPipe()) query: IGetCommentListQuery,
    ) {
        try {
            const result = await this.postService.getPostComment(postId, query);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[PostController][getPostComments] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Post('/:postId/comments')
    @UseGuards(AccessTokenGuard)
    async createPostComment(
        @LoginUser() loginUser,
        @Param('postId') postId: string,
        @Body(new TrimBodyPipe()) body: ICreateCommentBody,
    ) {
        try {
            const result = await this.postService.createPostComment(loginUser.userId, postId, body);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[PostController][createPostComment] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Patch('/:postId/comments/:commentId')
    @UseGuards(AccessTokenGuard)
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
            this.logger.error(`[PostController][updatePostComment] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }

    @Delete('/:postId/comments/:commentId')
    @UseGuards(AccessTokenGuard)
    async deletePostComment(
        @LoginUser() loginUser,
        @Param('postId') postId: string,
        @Param('commentId') commentId: string,
    ) {
        try {
            const result = await this.postService.deletePostComment(loginUser.userId, postId, commentId);
            return new SuccessResponse(result);
        } catch (error) {
            this.logger.error(`[PostController][deletePostComment] ${error.stack || JSON.stringify(error)}`);
            throw new InternalServerErrorException(error);
        }
    }
}
