import {
    BadGatewayException,
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import * as _ from 'lodash';
import { DEFAULT_PAGE_VALUE, ElasticsearchIndex, Privacy } from 'src/common/constants';
import { toObjectIds } from 'src/common/helper';
import { ElasticsearchService } from 'src/common/modules/elasticsearch';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Post, User } from 'src/mongo-schemas';
import { ICreateCommentBody, IGetCommentListQuery, IUpdateCommentBody } from '../comments/comment.interface';
import { CommentService } from '../comments/comment.service';
import { FileService } from '../files/file.service';
import { DEFAULT_PAGE_LIMIT } from './../../common/constants';
import { ICreatePostBody, IGetPostListQuery, IUpdatePostBody } from './post.interface';

@Injectable()
export class PostService {
    constructor(
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private fileService: FileService,
        private elasticsearchService: ElasticsearchService,
        private commentService: CommentService,
    ) {}

    async createNewPost(userId: string, body: ICreatePostBody) {
        const { content, privacy = Privacy.PUBLIC, discussedInId, pictureIds = [], videoIds = [] } = body;

        const author = await this.dataServices.users.findById(userId);
        if (!author) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện tác vụ này.`);
        }

        const createPostBody: Partial<Post> = {
            author: author._id,
            content,
            privacy,
            commentIds: [],
            reactIds: [],
            sharedIds: [],
            pictureIds: toObjectIds(pictureIds),
            videoIds: toObjectIds(videoIds),
            point: 0,
        };

        if (discussedInId) {
            const discussedInUser = await this.dataServices.users.findById(discussedInId);
            if (!discussedInUser) {
                throw new BadRequestException(`Không tồn tại tường người dùng.`);
            }
            createPostBody.discussedIn = discussedInUser._id;
        }

        const createdPost = await this.dataServices.posts.create(createPostBody);
        await this.elasticsearchService.index<Post>(ElasticsearchIndex.POST, {
            id: createdPost._id,
            content: createdPost.content,
            author: author.fullName as unknown,
            privacy: createdPost.privacy,
        });
        return createdPost._id;
    }

    async getUserPosts(userId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }
        const posts = await this.dataServices.posts.findAll(
            {
                author: user._id,
                discussedIn: null,
            },
            {
                sort: [['createdAt', 'desc']],
                populate: ['author'],
            },
        );
        const postDtos = await this.dataResources.posts.mapToDtoList(posts, user);
        return postDtos;
    }

    async getNewsFeed(userId: string, query: IGetPostListQuery) {
        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT } = query;
        const skip = (page - 1) * +limit;
        const loginUser = await this.dataServices.users.findById(userId);
        if (!loginUser) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện tác vụ này.`);
        }

        const { items: subscribedItems, totalItems: totalSubscribedItems } = await this.getSubscribedPosts(
            loginUser,
            skip,
            limit,
        );

        const newsFeedPosts = subscribedItems;
        if (subscribedItems.length < +limit) {
            const pastPages = Math.ceil(totalSubscribedItems / +limit);
            const newSkip = pastPages * +limit - totalSubscribedItems + (page - pastPages - 1) * +limit;
            const posts = await this.getSuggestedPosts(loginUser, newSkip, limit);
            newsFeedPosts.push(...posts);
        }
        const postDtos = await this.dataResources.posts.mapToDtoList(newsFeedPosts, loginUser);
        return postDtos;
    }

    async getSubscribedPosts(user: User, skip: number, limit: number) {
        const result = await this.dataServices.posts.findAndCountAll(
            {
                $or: [
                    {
                        privacy: {
                            $in: [Privacy.SUBSCRIBED, Privacy.PUBLIC],
                        },
                        author: {
                            $in: user.subscribingIds,
                        },
                    },
                    {
                        author: user._id,
                    },
                ],
            },
            {
                sort: [
                    ['point', -1],
                    ['createdAt', -1],
                ],
                skip: skip,
                limit: +limit,
            },
        );
        return result;
    }

    async getSuggestedPosts(user: User, skip: number, limit: number) {
        if (skip < 0) {
            skip = 0;
            limit = limit + skip;
        }
        const posts = await this.dataServices.posts.findAll(
            {
                privacy: Privacy.PUBLIC,
                author: {
                    $nin: [...user.subscribingIds, ...user.blockedIds, user._id],
                },
            },
            {
                sort: [
                    ['point', -1],
                    ['createdAt', -1],
                ],
                skip: skip,
                limit: +limit,
            },
        );
        return posts;
    }

    async getDetail(userId: string, postId: string) {
        const loginUser = await this.dataServices.users.findById(userId);
        if (!loginUser) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện tác vụ này.`);
        }

        const post = await this.dataServices.posts.findById(postId, {
            populate: ['author', 'discussedIn'],
        });
        if (!post) {
            throw new NotFoundException(`Không tìm thấy bài viết này.`);
        }

        const postDto = await this.dataResources.posts.mapToDto(post, loginUser);
        return postDto;
    }

    async updateUserPost(userId: string, postId: string, body: IUpdatePostBody) {
        const { content, privacy, pictureIds, videoIds } = body;
        const existedPost = await this.dataServices.posts.findOne(
            {
                author: userId,
                _id: postId,
            },
            {
                populate: 'author',
            },
        );
        if (!existedPost) {
            throw new NotFoundException(`Không tìm thấy bài viết này.`);
        }

        const toUpdateBody: Partial<Post> = { content, privacy };
        if (pictureIds) {
            toUpdateBody.pictureIds = toObjectIds(pictureIds);
        }

        if (videoIds) {
            toUpdateBody.videoIds = toObjectIds(videoIds);
        }

        await this.dataServices.posts.updateById(existedPost._id, toUpdateBody);

        await this.elasticsearchService.updateById<Post>(ElasticsearchIndex.POST, existedPost._id, {
            id: existedPost._id,
            content: content ?? existedPost.content,
            author: existedPost.author.fullName as unknown,
            privacy: privacy ?? existedPost.privacy,
        });

        return true;
    }

    async deleteUserPost(userId: string, postId: string) {
        const existedPost = await this.dataServices.posts.findOne({
            author: userId,
            _id: postId,
        });
        if (!existedPost) {
            throw new NotFoundException(`Không tìm thấy bài viết này.`);
        }
        await this.dataServices.posts.deleteById(existedPost._id);
        await this.elasticsearchService.deleteById(ElasticsearchIndex.POST, existedPost._id);
        return true;
    }

    async getPostComment(postId: string, query: IGetCommentListQuery) {
        const post = await this.dataServices.posts.findById(postId);
        if (!post) {
            throw new BadGatewayException(`Không tìm thấy bài viết này.`);
        }

        const comment = await this.commentService.getCommentsInPost(post, query);
        return comment;
    }

    async createPostComment(userId: string, postId: string, body: ICreateCommentBody) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new BadGatewayException(`Không tìm thấy người dùng.`);
        }

        const post = await this.dataServices.posts.findById(postId);
        if (!post) {
            throw new BadGatewayException(`Không tìm thấy bài viết này.`);
        }

        const createdCommentId = await this.commentService.createCommentInPost(user, post, body);
        const postCommentIds = post.commentIds;
        postCommentIds.push(createdCommentId);
        await this.dataServices.posts.updateById(post._id, {
            commentIds: postCommentIds,
        });

        return createdCommentId;
    }

    async updatePostComment(userId: string, postId: string, commentId: string, body: IUpdateCommentBody) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new BadGatewayException(`Không tìm thấy người dùng.`);
        }

        const post = await this.dataServices.posts.findById(postId);
        if (!post) {
            throw new BadGatewayException(`Không tìm thấy bài viết này.`);
        }

        await this.commentService.updateCommentInPost(commentId, user, post, body);
        return true;
    }

    async deletePostComment(userId: string, postId: string, commentId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new BadGatewayException(`Không tìm thấy người dùng.`);
        }

        const post = await this.dataServices.posts.findById(postId);
        if (!post) {
            throw new BadGatewayException(`Không tìm thấy bài viết này.`);
        }

        const deletedCommentId = await this.commentService.deleteCommentInPost(commentId, user, post);
        const postCommentIds = post.commentIds;
        _.remove(postCommentIds, (id) => `${id}` == deletedCommentId);
        await this.dataServices.posts.updateById(post._id, {
            commentIds: postCommentIds,
        });
        return true;
    }
}
