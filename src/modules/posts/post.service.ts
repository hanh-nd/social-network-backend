import {
    BadGatewayException,
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as _ from 'lodash';
import {
    DEFAULT_PAGE_VALUE,
    ElasticsearchIndex,
    NotificationAction,
    NotificationTargetType,
    Privacy,
    ReactionTargetType,
    ReactionTypePoint,
    ReportTargetType,
    SHARE_POST_POINT,
    SocketEvent,
    SystemReporter,
} from 'src/common/constants';
import { toObjectId, toObjectIds } from 'src/common/helper';
import { ChatGPTService } from 'src/common/modules/chatgpt/chatgpt.service';
import { ElasticsearchService } from 'src/common/modules/elasticsearch';
import { RedisService } from 'src/common/modules/redis/redis.service';
import { createWinstonLogger } from 'src/common/modules/winston';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Comment, Post, User } from 'src/mongo-schemas';
import { ICreateCommentBody, IGetCommentListQuery, IUpdateCommentBody } from '../comments/comment.interface';
import { CommentService } from '../comments/comment.service';
import { FileService } from '../files/file.service';
import { SocketGateway } from '../gateway/socket.gateway';
import { NotificationService } from '../notifications/notification.service';
import { ICreateReactionBody, IGetReactionListQuery } from '../reactions/reaction.interface';
import { ReactionService } from '../reactions/reaction.service';
import { ICreateReportBody } from '../reports/report.interface';
import { ReportService } from '../reports/report.service';
import { TagService } from '../tags/tag.service';
import { DEFAULT_PAGE_LIMIT } from './../../common/constants';
import { POST_LIMIT } from './post.constants';
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
        private reportService: ReportService,
        private notificationService: NotificationService,
        private chatGPTService: ChatGPTService,
        private tagService: TagService,
        private configService: ConfigService,
        private socketGateway: SocketGateway,
        private redisService: RedisService,
    ) {}

    private readonly logger = createWinstonLogger(PostService.name, this.configService);

    async createNewPost(userId: string, body: ICreatePostBody) {
        const {
            content,
            privacy = Privacy.PUBLIC,
            discussedInId,
            pictureIds = [],
            videoIds = [],
            postSharedId,
            postedInGroupId,
            isAnonymous,
        } = body;

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
            postShared: toObjectId(postSharedId) as unknown,
            pictureIds: toObjectIds(pictureIds),
            videoIds: toObjectIds(videoIds),
            point: 0,
            isAnonymous,
        };

        if (discussedInId) {
            const discussedInUser = await this.dataServices.users.findById(discussedInId);
            if (!discussedInUser) {
                throw new BadRequestException(`Không tồn tại tường người dùng.`);
            }
            createPostBody.discussedIn = toObjectId(discussedInUser._id) as unknown;
        }

        if (postedInGroupId) {
            const group = await this.dataServices.groups.findById(postedInGroupId);
            if (!group) {
                throw new BadRequestException(`Không tồn tại nhóm này.`);
            }
            createPostBody.postedInGroup = toObjectId(group._id) as unknown;
        }

        const createdPost = await this.dataServices.posts.create(createPostBody);
        await this.elasticsearchService.index<Post>(ElasticsearchIndex.POST, {
            id: createdPost._id,
            content: createdPost.content,
            author: author.fullName as unknown,
            privacy: createdPost.privacy,
        });

        const post = await this.dataServices.posts.findById(createdPost._id, {
            populate: [
                'author',
                'tagIds',
                {
                    path: 'postShared',
                    populate: ['author'],
                },
                {
                    path: 'postedInGroup',
                    select: '_id name',
                },
            ],
        });

        this.updatePostMetaData(post);
        const postDto = await this.dataResources.posts.mapToDto(post);
        return postDto as Post;
    }

    private async updatePostMetaData(post: Post) {
        await this.updatePostIsToxic(post);
        await this.updatePostTagIds(post);
    }

    private async updatePostTagIds(post: Post) {
        const tagNames = await this.tagService.getTagNames();
        try {
            const prompts = [];
            prompts.push({
                role: 'user',
                content: `Give me 3 tags in the list "${tagNames.join(
                    ', ',
                )}" separated by commas that best fit for the paragraph below:\n${post.content}`,
            });
            const response = await this.chatGPTService.sendMessage(JSON.stringify(prompts));
            prompts.push({
                role: 'assistant',
                content: response.text,
            });
            this.logger.info(
                `[updatePostTagIds] postId = ${post._id}, message = ${response.text}, prompts=${JSON.stringify(
                    prompts,
                )}`,
            );
            let names = tagNames.reduce((names: string[], currentTagName: string) => {
                const regex = new RegExp(currentTagName, 'gi');
                const isMatched = regex.test(response.text);
                if (isMatched) {
                    names.push(currentTagName);
                }
                return names;
            }, []);

            let retriedTimes = 0;
            while (!names.length && retriedTimes < 3) {
                retriedTimes++;
                prompts.push({
                    role: 'user',
                    content: `Please give me 3 tags that separated by commas for the paragraph above`,
                });
                const resendResponse = await this.chatGPTService.sendMessage(JSON.stringify(prompts));
                prompts.push({
                    role: 'assistant',
                    content: resendResponse.text,
                });
                names = tagNames.reduce((names: string[], currentTagName: string) => {
                    const regex = new RegExp(currentTagName, 'gi');
                    const isMatched = regex.test(resendResponse.text);
                    if (isMatched) {
                        names.push(currentTagName);
                    }
                    return names;
                }, []);
                this.logger.info(
                    `[updatePostTagIds] postId = ${post._id}, message = ${
                        resendResponse.text
                    }, prompts=${JSON.stringify(prompts)}`,
                );
            }
            const tags = await this.tagService.getTag(names);
            const tagIds = tags.map((t) => t._id);
            this.socketGateway.server.emit(SocketEvent.POST_UPDATE, {
                postId: post._id,
                tagIds: tags,
            });
            await this.dataServices.posts.updateById(post._id, {
                tagIds: toObjectIds(tagIds),
            });
        } catch (error) {
            this.logger.error(`[updatePostTagIds] ${error.stack || JSON.stringify(error)}`);
        }
    }

    private async updatePostIsToxic(post: Post) {
        try {
            const prompts = [];
            prompts.push({
                role: 'user',
                content: `Give me the text "1" and the reason why it is toxic if and only if the paragraph below contains toxic words and why it is toxic, or else just the text "0", if you cannot determine give me the text "0":\n${post.content}`,
            });
            const response = await this.chatGPTService.sendMessage(JSON.stringify(prompts));
            prompts.push({
                role: 'assistant',
                content: response.text,
            });
            this.logger.info(
                `[updatePostIsToxic] postId = ${post._id}, message = ${response.text}, prompts=${JSON.stringify(
                    prompts,
                )}`,
            );
            let responseText = response.text;
            let retriedTimes = 0;
            while (responseText.split(' ').length > 10 && retriedTimes < 3) {
                retriedTimes++;
                prompts.push({
                    role: 'user',
                    content: `Give me only the text "1" or "0" for the result of the toxicity above within 8 words.`,
                });
                const resendResponse = await this.chatGPTService.sendMessage(JSON.stringify(prompts));
                prompts.push({
                    role: 'assistant',
                    content: resendResponse.text,
                });
                responseText = resendResponse.text;
                this.logger.info(
                    `[updatePostIsToxic] postId = ${post._id}, message = ${
                        resendResponse.text
                    }, prompts=${JSON.stringify(prompts)}`,
                );
            }
            const isToxic = /Yes|1/.test(responseText);
            this.socketGateway.server.emit(SocketEvent.POST_UPDATE, {
                postId: post._id,
                isToxic: isToxic,
            });
            await this.dataServices.posts.updateById(post._id, {
                isToxic: isToxic,
            });

            if (isToxic) {
                // Tạo báo cáo
                await this.reportService.create(SystemReporter.CHAT_GPT, ReportTargetType.POST, post, {
                    reportReason: response.text,
                });
            }
        } catch (error) {
            this.logger.error(`[updatePostIsToxic] ${error.stack || JSON.stringify(error)}`);
        }
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
                postedInGroup: null,
            },
            {
                sort: [['createdAt', 'desc']],
                populate: [
                    'author',
                    'tagIds',
                    {
                        path: 'postShared',
                        populate: ['author'],
                    },
                    {
                        path: 'postedInGroup',
                        select: '_id name',
                    },
                ],
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

        const isLimited = !_.isNil(loginUser.lastLimitedAt);
        if (isLimited) {
            if (page > 1) return [];
            const { items: subscribedItems, totalItems: totalSubscribedItems } = await this.getSubscribedPosts(
                loginUser,
                0,
                POST_LIMIT,
            );

            const newsFeedPosts = subscribedItems;
            if (subscribedItems.length < +POST_LIMIT) {
                const pastPages = Math.ceil(totalSubscribedItems / +POST_LIMIT);
                const newSkip = (pastPages - 1) * +POST_LIMIT - totalSubscribedItems;
                const posts = await this.getSuggestedPosts(loginUser, newSkip, POST_LIMIT);
                newsFeedPosts.push(...posts);
            }
            const postDtos = await this.dataResources.posts.mapToDtoList(newsFeedPosts, loginUser);
            return postDtos;
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

    private async getSubscribedPosts(user: User, skip: number, limit: number, query: object = {}) {
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
                ...query,
            },
            {
                populate: [
                    'author',
                    'tagIds',
                    {
                        path: 'postShared',
                        populate: ['author'],
                    },
                    {
                        path: 'postedInGroup',
                        select: '_id name',
                    },
                ],
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

    private async getSuggestedPosts(user: User, skip: number, limit: number, query: object = {}) {
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
                ...query,
            },
            {
                populate: [
                    'author',
                    'tagIds',
                    {
                        path: 'postShared',
                        populate: ['author'],
                    },
                    {
                        path: 'postedInGroup',
                        select: '_id name',
                    },
                ],
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
            populate: [
                'author',
                'discussedIn',
                'tagIds',
                {
                    path: 'postShared',
                    populate: ['author'],
                },
                {
                    path: 'postedInGroup',
                    select: '_id name',
                },
            ],
        });
        if (!post) {
            throw new NotFoundException(`Không tìm thấy bài viết này.`);
        }

        const postDto = await this.dataResources.posts.mapToDto(post, loginUser);
        return postDto;
    }

    async updateUserPost(userId: string, postId: string, body: IUpdatePostBody) {
        const { content, privacy, pictureIds, videoIds, tagIds } = body;
        const existedPost = await this.dataServices.posts.findOne(
            {
                author: toObjectId(userId),
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

        if (tagIds) {
            toUpdateBody.tagIds = toObjectIds(tagIds);
        }

        const updatedPost = await this.dataServices.posts.updateById(existedPost._id, toUpdateBody);
        this.updatePostMetaData(updatedPost);
        await this.elasticsearchService.updateById<Post>(ElasticsearchIndex.POST, existedPost._id, {
            id: existedPost._id,
            content: content ?? existedPost.content,
            author: existedPost.author.fullName as unknown,
            privacy: privacy ?? existedPost.privacy,
        });

        return true;
    }

    async deleteUserPost(userId: string, postId: string) {
        const existedPost = await this.dataServices.posts.findOne(
            {
                author: toObjectId(userId),
                _id: postId,
            },
            {
                populate: ['postShared'],
            },
        );
        if (!existedPost) {
            throw new NotFoundException(`Không tìm thấy bài viết này.`);
        }
        await this.dataServices.posts.deleteById(existedPost._id);
        await this.elasticsearchService.deleteById(ElasticsearchIndex.POST, existedPost._id);
        if (existedPost.postShared) {
            const postSharedShareIds = existedPost.postShared.sharedIds;
            _.remove(postSharedShareIds, (id) => `${id}` == existedPost._id);
            await this.dataServices.posts.updateById(existedPost.postShared._id, {
                sharedIds: postSharedShareIds,
            });
        }
        return true;
    }

    async getPostComment(userId: string, postId: string, query: IGetCommentListQuery) {
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

        const comment = await this.commentService.getCommentsInPost(user, post, query);
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
        const createdComment = await this.commentService.createCommentInPost(user, post, body);
        const postCommentIds = post.commentIds;
        postCommentIds.push(createdComment._id);
        await this.dataServices.posts.updateById(post._id, {
            commentIds: postCommentIds,
        });

        // send notification
        await this.notificationService.create(
            user,
            post.author,
            NotificationTargetType.POST,
            post,
            NotificationAction.COMMENT,
        );
        this.updateCommentIsToxic(createdComment);
        const populatedComment = await createdComment.populate(['author']);
        return this.dataResources.comments.mapToDto(populatedComment);
    }

    private async updateCommentIsToxic(comment: Comment) {
        try {
            const prompts = [];
            prompts.push({
                role: 'user',
                content: `Give me the text "1" and the reason why it is toxic if and only if the paragraph below contains toxic words and why it is toxic, or else just the text "0", if you cannot determine give me the text "0":\n${comment.content}`,
            });
            const response = await this.chatGPTService.sendMessage(JSON.stringify(prompts));
            prompts.push({
                role: 'assistant',
                content: response.text,
            });
            this.logger.info(
                `[updateCommentIsToxic] commentId = ${comment._id}, message = ${
                    response.text
                }, prompts=${JSON.stringify(prompts)}`,
            );
            let responseText = response.text;
            let retriedTimes = 0;
            while (responseText.length > 10 && retriedTimes < 3) {
                retriedTimes++;
                prompts.push({
                    role: 'user',
                    content: `Give me only the text "1" or "0" for the result of the toxicity above within 8 words.`,
                });
                const resendResponse = await this.chatGPTService.sendMessage(JSON.stringify(prompts));
                prompts.push({
                    role: 'assistant',
                    content: resendResponse.text,
                });
                responseText = resendResponse.text;
                this.logger.info(
                    `[updateCommentIsToxic] commentId = ${comment._id}, message = ${
                        resendResponse.text
                    }, prompts=${JSON.stringify(prompts)}`,
                );
            }
            const isToxic = /Yes|1/.test(responseText);
            this.socketGateway.server.emit(SocketEvent.POST_UPDATE, {
                postId: comment.post,
                comment: {
                    _id: comment._id,
                    isToxic: isToxic,
                },
            });

            await this.dataServices.comments.updateById(comment._id, {
                isToxic: isToxic,
            });

            if (isToxic) {
                // Tạo báo cáo
                await this.reportService.create(SystemReporter.CHAT_GPT, ReportTargetType.COMMENT, comment, {
                    reportReason: response.text,
                });
            }
        } catch (error) {
            this.logger.error(`[updateCommentIsToxic] ${error.stack || JSON.stringify(error)}`);
        }
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

        const updatedComment = await this.commentService.updateCommentInPost(commentId, user, post, body);
        this.updateCommentIsToxic(updatedComment);
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

    async getPostReactions(userId: string, postId: string, query: IGetReactionListQuery) {
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

        const reactions = await this.reactionService.getReactions(user, ReactionTargetType.POST, post, query);
        return reactions;
    }

    async reactOrUndoReactPost(userId: string, postId: string, body: ICreateReactionBody) {
        const [user, post] = await Promise.all([
            this.dataServices.users.findById(userId),
            this.dataServices.posts.findById(postId, { populate: ['author'] }),
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

        // send notification
        await this.notificationService.create(
            user,
            post.author,
            NotificationTargetType.POST,
            post,
            NotificationAction.REACT,
        );

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

    async getPostCommentReactions(userId: string, postId: string, commentId: string, query: IGetReactionListQuery) {
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

        const reactions = await this.reactionService.getReactions(user, ReactionTargetType.COMMENT, comment, query);
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

        // send notification
        await this.notificationService.create(
            user,
            comment.author,
            NotificationTargetType.COMMENT,
            comment,
            NotificationAction.REACT,
        );
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

    async reportPost(userId: string, postId: string, body: ICreateReportBody) {
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

        const createdReportId = await this.reportService.create(user, ReportTargetType.POST, post, body);
        return createdReportId;
    }

    async reportPostComment(userId: string, postId: string, commentId: string, body: ICreateReportBody) {
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

        const createdReportId = await this.reportService.create(user, ReportTargetType.COMMENT, comment, body);
        return createdReportId;
    }

    async sharePost(userId: string, postId: string, body: ICreatePostBody) {
        const { content } = body;
        const [user, post] = await Promise.all([
            this.dataServices.users.findById(userId),
            this.dataServices.posts.findById(postId),
        ]);

        if (!user) {
            throw new BadGatewayException(`Không tìm thấy người dùng.`);
        }

        if (!post) {
            throw new BadRequestException(`Không tìm thấy bài viết này.`);
        }
        const createdPost = await this.createNewPost(userId, {
            content: content || '',
            postSharedId: postId,
        });

        const postShareIds = post.sharedIds;
        post.sharedIds.push(toObjectId(createdPost._id));

        const toUpdatePostBody = {
            sharedIds: postShareIds,
        };

        if (`${post.author}` != userId) {
            // not a self share, then plus point to post
            Object.assign(toUpdatePostBody, {
                $inc: {
                    point: SHARE_POST_POINT,
                },
            });
        }
        await this.dataServices.posts.updateById(post._id, toUpdatePostBody);

        // send notification
        await this.notificationService.create(
            user,
            { _id: post.author as string },
            NotificationTargetType.POST,
            post,
            NotificationAction.SHARE,
        );

        return createdPost;
    }

    async getSharePosts(userId: string, postId: string, query: IGetPostListQuery) {
        const [user, post] = await Promise.all([
            this.dataServices.users.findById(userId),
            this.dataServices.posts.findById(postId),
        ]);

        if (!user) {
            throw new BadGatewayException(`Không tìm thấy người dùng.`);
        }

        if (!post) {
            throw new BadRequestException(`Không tìm thấy bài viết này.`);
        }

        const posts = await this.dataServices.posts.findAll(
            {
                postShared: post._id,
                author: {
                    $nin: toObjectIds(user.blockedIds),
                },
            },
            {
                sort: [['createdAt', 'desc']],
                populate: [
                    'author',
                    {
                        path: 'postShared',
                        populate: ['author'],
                    },
                ],
            },
        );

        const postDtos = await this.dataResources.posts.mapToDtoList(posts, user);
        return postDtos;
    }

    async getUserInterestedTagPosts(userId: string, query?: IGetPostListQuery) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const { tagIds = [] } = user;
        if (!tagIds.length) return [];

        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT } = query;
        const skip = (+page - 1) * +limit;

        const { items: subscribedItems, totalItems: totalSubscribedItems } = await this.getSubscribedPosts(
            user,
            skip,
            limit,
            {
                tagIds: {
                    $in: toObjectIds(tagIds),
                },
            },
        );

        const interestedPosts = subscribedItems;
        if (subscribedItems.length < +limit) {
            const pastPages = Math.ceil(totalSubscribedItems / +limit);
            const newSkip = pastPages * +limit - totalSubscribedItems + (page - pastPages - 1) * +limit;
            const posts = await this.getSuggestedPosts(user, newSkip, limit, {
                tagIds: toObjectIds(tagIds),
            });
            interestedPosts.push(...posts);
        }
        const postDtos = await this.dataResources.posts.mapToDtoList(interestedPosts, user);
        return postDtos;
    }
}
