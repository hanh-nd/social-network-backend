import { BadRequestException, Injectable } from '@nestjs/common';
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_VALUE, SubscribeRequestStatus } from 'src/common/constants';
import { toObjectId, toObjectIds, toStringArray } from 'src/common/helper';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Group, GroupPost, User } from 'src/mongo-schemas';
import { PostService } from '../posts/post.service';
import { ICreateGroupPostBody, IGetGroupPostListQuery, IUpdateGroupPostBody } from './group-post.interface';

@Injectable()
export class GroupPostService {
    constructor(
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private postService: PostService,
    ) {}

    async getGroupPosts(group: Group, query: IGetGroupPostListQuery) {
        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT } = query;
        const skip = (+page - 1) * +limit;
        const where = await this.buildWhereQuery(query);
        const groupPosts = await this.dataServices.groupPosts.findAll(
            {
                group: toObjectId(group._id),
                ...where,
            },
            {
                populate: [
                    {
                        path: 'post',
                        populate: ['author'],
                    },
                    'group',
                ],
                sort: [['updatedAt', -1]],
                skip,
                limit: +limit,
            },
        );

        return groupPosts;
    }

    private async buildWhereQuery(query: IGetGroupPostListQuery) {
        const where: any = {};

        const { status, groupIds, authorId } = query;
        if (status) {
            where.status = status;
        }

        if (groupIds) {
            where.group = toObjectIds(groupIds);
        }

        if (authorId) {
            where.author = toObjectId(authorId);
        }

        return where;
    }

    async create(user: User, group: Group, body: ICreateGroupPostBody) {
        const createdPost = await this.postService.createNewPost(
            user._id,
            {
                ...body,
                postedInGroupId: group._id,
            },
            { waitForChatGPT: true },
        );
        let { status } = body;

        if (group.autoReject && createdPost.isToxic && status == SubscribeRequestStatus.PENDING) {
            console.log(`in here`);
            status = SubscribeRequestStatus.REJECTED;
        }

        const toCreateBody: Partial<GroupPost> = {
            author: toObjectId(user._id) as unknown,
            group: toObjectId(group._id) as unknown,
            post: toObjectId(createdPost._id) as unknown,
            status,
        };

        const createdGroupPost = await this.dataServices.groupPosts.create(toCreateBody);
        const groupPost = await this.findById(createdGroupPost._id);
        return groupPost;
    }

    async findById(groupPostId: string) {
        const groupPost = await this.dataServices.groupPosts.findById(groupPostId, {
            populate: [
                {
                    path: 'post',
                    populate: ['author'],
                },
                'group',
            ],
        });
        return groupPost;
    }

    async update(group: Group, groupPostId: string, body: IUpdateGroupPostBody) {
        const existedGroupPost = await this.dataServices.groupPosts.findOne(
            {
                group: toObjectId(group._id),
                _id: toObjectId(groupPostId),
                status: SubscribeRequestStatus.PENDING,
            },
            {
                populate: 'post',
            },
        );

        if (!existedGroupPost) {
            throw new BadRequestException(`Không tìm thấy yêu cầu này.`);
        }

        const { blockIds } = group;
        if (toStringArray(blockIds).includes(`${existedGroupPost.author}`)) {
            return {
                success: false,
            };
        }

        const { status } = body;
        await this.dataServices.groupPosts.updateById(existedGroupPost._id, {
            status,
        });

        if (status !== SubscribeRequestStatus.ACCEPTED) {
            return {
                success: false,
            };
        }

        if (existedGroupPost.post.isToxic) {
            await this.dataServices.posts.updateById(existedGroupPost.post._id, {
                isToxic: false,
            });
        }

        return {
            success: true,
            data: existedGroupPost,
        };
    }
}
