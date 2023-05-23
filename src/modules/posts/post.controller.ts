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
import { ICommonGetListQuery } from 'src/common/interfaces';
import { createWinstonLogger } from 'src/common/modules/winston';
import { TrimBodyPipe } from 'src/common/pipes';
import { ICreatePostBody, IUpdatePostBody } from './post.interface';
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
    async getNewsFeed(@LoginUser() loginUser, @Query() query: ICommonGetListQuery) {
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
    async getPostDetail(@Param('id') id: string) {
        try {
            const result = await this.postService.getDetail(id);
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
}
