import {
    BadGatewayException,
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import * as _ from 'lodash';
import {
    DEFAULT_PAGE_VALUE,
    ElasticsearchIndex,
    Privacy,
    ReactionTargetType,
    ReactionTypePoint,
} from 'src/common/constants';
import { toObjectId, toObjectIds } from 'src/common/helper';
import { ElasticsearchService } from 'src/common/modules/elasticsearch';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Comment, Post, User } from 'src/mongo-schemas';
import { ICreateCommentBody, IGetCommentListQuery, IUpdateCommentBody } from '../comments/comment.interface';
import { CommentService } from '../comments/comment.service';
import { FileService } from '../files/file.service';
import { ICreateReactionBody, IGetReactionListQuery } from '../reactions/reaction.interface';
import { ReactionService } from '../reactions/reaction.service';
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
        private reactionService: ReactionService,
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

    private async getSubscribedPosts(user: User, skip: number, limit: number) {
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

    private async getSuggestedPosts(user: User, skip: number, limit: number) {
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
        const [user, post] = await Promise.all([
            this.dataServices.users.findById(userId),
            this.dataServices.posts.findById(postId),
        ]);
        if (!user) {
            throw new BadGatewayException(`Không tìm thấy người dùng.`);
        }

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
        const [user, post] = await Promise.all([
            this.dataServices.users.findById(userId),
            this.dataServices.posts.findById(postId),
        ]);
        if (!user) {
            throw new BadGatewayException(`Không tìm thấy người dùng.`);
        }

        if (!post) {
            throw new BadGatewayException(`Không tìm thấy bài viết này.`);
        }

        await this.commentService.updateCommentInPost(commentId, user, post, body);
        return true;
    }

    async deletePostComment(userId: string, postId: string, commentId: string) {
        const [user, post] = await Promise.all([
            this.dataServices.users.findById(userId),
            this.dataServices.posts.findById(postId),
        ]);
        if (!user) {
            throw new BadGatewayException(`Không tìm thấy người dùng.`);
        }

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

    async getPostReactions(postId: string, query: IGetReactionListQuery) {
        const post = await this.dataServices.posts.findById(postId);
        if (!post) {
            throw new BadGatewayException(`Không tìm thấy bài viết này.`);
        }

        const reactions = await this.reactionService.getReactions(ReactionTargetType.POST, post, query);
        return reactions;
    }

    async reactOrUndoReactPost(userId: string, postId: string, body: ICreateReactionBody) {
        const [user, post] = await Promise.all([
            this.dataServices.users.findById(userId),
            this.dataServices.posts.findById(postId),
        ]);
        if (!user) {
            throw new BadGatewayException(`Không tìm thấy người dùng.`);
        }

        if (!post) {
            throw new BadGatewayException(`Không tìm thấy bài viết này.`);
        }
        const postReactIds = post.reactIds;
        const isUserReacted = postReactIds.map((id) => `${id}`).includes(`${user._id}`);
        if (isUserReacted) {
            await this.undoReactPost(user, post, body);
        } else {
            await this.reactPost(user, post, body);
        }

        return true;
    }

    private async reactPost(user: User, post: Post, body: ICreateReactionBody) {
        // Insert into reaction collection
        const toIncreasePoint = await this.reactionService.react(user, ReactionTargetType.POST, post, body);

        const postReactIds = post.reactIds;
        postReactIds.push(toObjectId(user._id));

        await this.dataServices.posts.updateById(post._id, {
            reactIds: postReactIds,
            $inc: {
                point: toIncreasePoint,
            },
        });

        return true;
    }

    private async undoReactPost(user: User, post: Post, body: ICreateReactionBody) {
        // Delete all document in reaction collection with author is user and target is post
        const toDecreasePoint = await this.reactionService.undoReact(user, ReactionTargetType.POST, post);

        const postReactIds = post.reactIds;
        _.remove(postReactIds, (id) => `${id}` == user._id);

        await this.dataServices.posts.updateById(post._id, {
            reactIds: postReactIds,
            $inc: {
                point: -toDecreasePoint,
            },
        });

        if (ReactionTypePoint[body.type] !== toDecreasePoint) {
            await this.reactPost(user, post, body);
        }
        return true;
    }

    async getPostCommentReactions(postId: string, commentId: string, query: IGetReactionListQuery) {
        const [post, comment] = await Promise.all([
            this.dataServices.posts.findById(postId),
            this.dataServices.comments.findById(commentId),
        ]);

        if (!post) {
            throw new BadGatewayException(`Không tìm thấy bài viết này.`);
        }

        if (!comment) {
            throw new BadGatewayException(`Không tìm thấy bình luận.`);
        }

        const reactions = await this.reactionService.getReactions(ReactionTargetType.COMMENT, comment, query);
        return reactions;
    }

    async reactOrUndoReactPostComment(userId: string, postId: string, commentId: string, body: ICreateReactionBody) {
        const [user, post, comment] = await Promise.all([
            this.dataServices.users.findById(userId),
            this.dataServices.posts.findById(postId),
            this.dataServices.comments.findById(commentId),
        ]);

        if (!user) {
            throw new BadGatewayException(`Không tìm thấy người dùng.`);
        }

        if (!post) {
            throw new BadGatewayException(`Không tìm thấy bài viết này.`);
        }

        if (!comment) {
            throw new BadGatewayException(`Không tìm thấy bình luận.`);
        }

        const commentReactIds = comment.reactIds;
        const isUserReacted = commentReactIds.map((id) => `${id}`).includes(`${user._id}`);
        if (isUserReacted) {
            await this.undoReactComment(user, comment, body);
        } else {
            await this.reactComment(user, comment, body);
        }

        return true;
    }

    private async reactComment(user: User, comment: Comment, body: ICreateReactionBody) {
        // Insert into reaction collection
        const toIncreasePoint = await this.reactionService.react(user, ReactionTargetType.COMMENT, comment, body);

        const commentReactIds = comment.reactIds;
        commentReactIds.push(toObjectId(user._id));

        await this.dataServices.comments.updateById(comment._id, {
            reactIds: commentReactIds,
            $inc: {
                point: toIncreasePoint,
            },
        });
    }

    private async undoReactComment(user: User, comment: Comment, body: ICreateReactionBody) {
        // Delete all document in reaction collection with author is user and target is post
        const toDecreasePoint = await this.reactionService.undoReact(user, ReactionTargetType.COMMENT, comment);

        const commentReactIds = comment.reactIds;
        _.remove(commentReactIds, (id) => `${id}` == user._id);

        await this.dataServices.comments.updateById(comment._id, {
            reactIds: commentReactIds,
            $inc: {
                point: -toDecreasePoint,
            },
        });

        if (ReactionTypePoint[body.type] !== toDecreasePoint) {
            await this.reactComment(user, comment, body);
        }
        return true;
    }
}
