import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import * as _ from 'lodash';
import { ObjectId } from 'mongodb';
import {
    DEFAULT_PAGE_LIMIT,
    DEFAULT_PAGE_VALUE,
    ElasticsearchIndex,
    SubscribeRequestStatus,
} from 'src/common/constants';
import { toObjectId, toObjectIds, toStringArray } from 'src/common/helper';
import { ElasticsearchService } from 'src/common/modules/elasticsearch';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Group, GroupPost, User } from 'src/mongo-schemas';
import { IGetGroupPostListQuery, IUpdateGroupPostBody } from '../group-posts/group-post.interface';
import { GroupPostService } from '../group-posts/group-post.service';
import { IUpdateJoinRequestBody } from '../join-requests/join-request.interface';
import { JoinRequestService } from '../join-requests/join-request.service';
import { IGetPostListQuery } from '../posts/post.interface';
import {
    ICreateNewGroupBody,
    ICreatePostInGroupBody,
    IGetGroupListQuery,
    IGetJoinRequestListQuery,
    IUpdateGroupBody,
} from './group.interface';

@Injectable()
export class GroupService {
    constructor(
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private elasticsearchService: ElasticsearchService,
        private joinRequestService: JoinRequestService,
        private groupPostService: GroupPostService,
    ) {}

    async createNewGroup(userId: string, body: ICreateNewGroupBody) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const { name, private: isPrivate = false, reviewPost, summary, coverId } = body;

        const createNewGroupBody: Partial<Group> = {
            name,
            administrators: [
                {
                    user: user._id as unknown,
                    isOwner: true,
                },
            ],
            private: isPrivate,
            reviewPost,
            summary,
            coverId: toObjectId(coverId),
            memberIds: [toObjectId(user._id)],
        };

        const createdGroup = await this.dataServices.groups.create(createNewGroupBody);
        const { groupIds } = user;
        groupIds.push(toObjectId(createdGroup._id));
        await this.dataServices.users.updateById(user._id, {
            groupIds,
        });

        await this.elasticsearchService.index<Group>(ElasticsearchIndex.GROUP, {
            id: createdGroup._id,
            name: createdGroup.name,
            summary: createdGroup.summary,
            blockIds: toStringArray(createdGroup.blockIds) as unknown as ObjectId[],
        });

        const createdGroupDto = await this.getDetail(userId, createdGroup._id);
        return createdGroupDto;
    }

    async updateGroup(userId: string, groupId: string, body: IUpdateGroupBody) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const group = await this.dataServices.groups.findOne({
            _id: toObjectId(groupId),
            'administrators.user': toObjectId(user._id),
        });
        if (!group) {
            throw new ForbiddenException(`Nhóm không tồn tại hoặc bạn không có quyền thực hiện thao tác này.`);
        }

        const { name, private: isPrivate, summary, coverId, reviewPost } = body;
        const toUpdateBody: Partial<Group> = {
            name,
            private: isPrivate,
            reviewPost,
            summary,
        };
        if (coverId) {
            toUpdateBody.coverId = toObjectId(coverId);
        }

        await this.dataServices.groups.updateById(group._id, toUpdateBody);

        await this.elasticsearchService.updateById<Group>(ElasticsearchIndex.GROUP, group._id, {
            id: group._id,
            name: name ?? group.name,
            summary: summary ?? group.summary,
            blockIds: toStringArray(group.blockIds) as unknown as ObjectId[],
        });

        return true;
    }

    async blockOrUnblockUser(loginUserId: string, groupId: string, targetUserId: string) {
        const users = await this.dataServices.users.findAll({
            _id: toObjectIds([loginUserId, targetUserId]),
        });
        const loginUser = users.find((u) => `${u._id}` == loginUserId);
        const targetUser = users.find((u) => `${u._id}` == targetUserId);

        if (!loginUser || !targetUser) {
            throw new BadRequestException(`Không tìm thấy người dùng này.`);
        }

        const group = await this.dataServices.groups.findOne({
            _id: toObjectId(groupId),
            'administrators.user': toObjectId(loginUser._id),
        });
        if (!group) {
            throw new ForbiddenException(`Nhóm không tồn tại hoặc bạn không có quyền thực hiện thao tác này.`);
        }

        const { blockIds, administrators } = group;

        const isOwner = administrators.find((admin) => `${admin.user}` == targetUser._id && admin.isOwner);
        if (isOwner) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        if (toStringArray(blockIds).includes(`${targetUserId}`)) {
            await this.unblockUser(loginUser, group, targetUser);
        } else {
            await this.blockUser(loginUser, group, targetUser);
        }

        return true;
    }

    private async blockUser(loginUser: Partial<User>, group: Partial<Group>, targetUser: Partial<User>) {
        const { blockIds, memberIds, administrators } = group;
        blockIds.push(toObjectId(targetUser._id));

        const toUpdateBody: Partial<Group> = {
            blockIds,
        };

        if (toStringArray(memberIds).includes(`${targetUser._id}`)) {
            _.remove(memberIds, (id) => `${id}` == targetUser._id);
            toUpdateBody.memberIds = memberIds;
        }

        if (administrators.map((admin) => `${admin.user}`).includes(`${targetUser._id}`)) {
            _.remove(administrators, (admin) => `${admin.user}` == targetUser._id);
            toUpdateBody.administrators = administrators;
        }

        await this.dataServices.groups.updateById(group._id, toUpdateBody);
        await this.dataServices.joinRequests.bulkDelete({
            sender: toObjectId(targetUser._id),
            status: SubscribeRequestStatus.PENDING,
        });

        const { groupIds } = targetUser;
        if (toStringArray(groupIds).includes(`${group._id}`)) {
            _.remove(groupIds, (id) => `${id}` == group._id);
            await this.dataServices.users.updateById(targetUser._id, {
                groupIds: toObjectIds(groupIds),
            });
        }

        await this.elasticsearchService.updateById<Group>(ElasticsearchIndex.GROUP, group._id, {
            id: group._id,
            name: group.name,
            summary: group.summary,
            blockIds: toStringArray(blockIds) as unknown as ObjectId[],
        });

        return true;
    }

    private async unblockUser(loginUser: Partial<User>, group: Partial<Group>, targetUser: Partial<User>) {
        const { blockIds } = group;
        _.remove(blockIds, (id) => `${id}` == targetUser._id);
        await this.dataServices.groups.updateById(group._id, {
            blockIds,
        });

        await this.elasticsearchService.updateById<Group>(ElasticsearchIndex.GROUP, group._id, {
            id: group._id,
            name: group.name,
            summary: group.summary,
            blockIds: toStringArray(blockIds) as unknown as ObjectId[],
        });

        return true;
    }

    async removeMember(loginUserId: string, groupId: string, targetUserId: string) {
        const users = await this.dataServices.users.findAll({
            _id: toObjectIds([loginUserId, targetUserId]),
        });
        const loginUser = users.find((u) => `${u._id}` == loginUserId);
        const targetUser = users.find((u) => `${u._id}` == targetUserId);

        if (!loginUser || !targetUser) {
            throw new BadRequestException(`Không tìm thấy người dùng này.`);
        }

        const group = await this.dataServices.groups.findOne({
            _id: toObjectId(groupId),
            'administrators.user': toObjectId(loginUser._id),
        });
        if (!group) {
            throw new ForbiddenException(`Nhóm không tồn tại hoặc bạn không có quyền thực hiện thao tác này.`);
        }

        const { memberIds } = group;
        if (!toStringArray(memberIds).includes(`${targetUser._id}`)) {
            return false;
        }

        _.remove(memberIds, (id) => `${id}` == targetUser._id);
        await this.dataServices.groups.updateById(group._id, {
            memberIds,
        });

        const { groupIds } = targetUser;
        _.remove(groupIds, (id) => `${id}` == group._id);
        await this.dataServices.users.updateById(targetUser._id, {
            groupIds: toObjectIds(groupIds),
        });

        return true;
    }

    async getJoinRequests(userId: string, groupId: string, query: IGetJoinRequestListQuery) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const group = await this.dataServices.groups.findOne({
            _id: toObjectId(groupId),
            'administrators.user': toObjectId(user._id),
        });
        if (!group) {
            throw new ForbiddenException(`Nhóm không tồn tại hoặc bạn không có quyền thực hiện thao tác này.`);
        }

        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT } = query;
        const skip = (+page - 1) * +limit;
        const joinRequests = await this.dataServices.joinRequests.findAll(
            {
                group: toObjectId(groupId),
                sender: {
                    $nin: toObjectIds(group.blockIds),
                },
                status: SubscribeRequestStatus.PENDING,
            },
            {
                populate: ['sender'],
                sort: [['createdAt', -1]],
                skip,
                limit: +limit,
            },
        );

        return joinRequests;
    }

    async acceptOrRejectJoinRequest(
        userId: string,
        groupId: string,
        joinRequestId: string,
        body: IUpdateJoinRequestBody,
    ) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const group = await this.dataServices.groups.findOne({
            _id: toObjectId(groupId),
            'administrators.user': toObjectId(user._id),
        });
        if (!group) {
            throw new ForbiddenException(`Nhóm không tồn tại hoặc bạn không có quyền thực hiện thao tác này.`);
        }

        const { success, data } = await this.joinRequestService.update(group, joinRequestId, body);
        if (!success) {
            return false;
        }

        const { memberIds } = group;
        memberIds.push(toObjectId(`${data.sender}`));

        await this.dataServices.groups.updateById(group._id, {
            memberIds,
        });

        const senderUser = await this.dataServices.users.findById(`${data.sender}`);
        const { groupIds } = senderUser;
        groupIds.push(toObjectId(group._id));
        await this.dataServices.users.updateById(senderUser._id, {
            groupIds: toObjectIds(groupIds),
        });

        return true;
    }

    async getPendingGroupPosts(userId: string, groupId: string, query: IGetJoinRequestListQuery) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const group = await this.dataServices.groups.findOne({
            _id: toObjectId(groupId),
            'administrators.user': toObjectId(user._id),
        });
        if (!group) {
            throw new ForbiddenException(`Nhóm không tồn tại hoặc bạn không có quyền thực hiện thao tác này.`);
        }

        const groupPosts = await this.groupPostService.getGroupPosts(group, {
            ...query,
            status: SubscribeRequestStatus.PENDING,
        });

        const groupPostDtos = await this.dataResources.groupPosts.mapToDtoList(groupPosts, user);
        return groupPostDtos;
    }

    async acceptOrRejectGroupPost(userId: string, groupId: string, groupPostId: string, body: IUpdateGroupPostBody) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const group = await this.dataServices.groups.findOne({
            _id: toObjectId(groupId),
            'administrators.user': toObjectId(user._id),
        });
        if (!group) {
            throw new ForbiddenException(`Nhóm không tồn tại hoặc bạn không có quyền thực hiện thao tác này.`);
        }

        const { success } = await this.groupPostService.update(group, groupPostId, body);

        return success;
    }

    async pinOrUnpinGroupPost(userId: string, groupId: string, groupPostId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const group = await this.dataServices.groups.findOne({
            _id: toObjectId(groupId),
            'administrators.user': toObjectId(user._id),
        });
        if (!group) {
            throw new ForbiddenException(`Nhóm không tồn tại hoặc bạn không có quyền thực hiện thao tác này.`);
        }

        const groupPost = await this.dataServices.groupPosts.findOne({
            _id: toObjectId(groupPostId),
            status: SubscribeRequestStatus.ACCEPTED,
        });
        if (!groupPost) {
            throw new ForbiddenException(`Không tìm thấy bài viết này.`);
        }

        const { pinnedPosts } = group;
        if (toStringArray(pinnedPosts).includes(`${groupPost._id}`)) {
            await this.unpinGroupPost(user, group, groupPost);
        } else {
            await this.pinGroupPost(user, group, groupPost);
        }

        return true;
    }

    private async pinGroupPost(user: User, group: Group, groupPost: GroupPost) {
        const { pinnedPosts = [] } = group;
        pinnedPosts.push(toObjectId(`${groupPost._id}`));

        await this.dataServices.groups.updateById(group._id, {
            pinnedPosts,
        });

        return true;
    }

    private async unpinGroupPost(user: User, group: Group, groupPost: GroupPost) {
        const { pinnedPosts = [] } = group;
        _.remove(pinnedPosts, (id) => `${id}` == groupPost._id);

        await this.dataServices.groups.updateById(group._id, {
            pinnedPosts,
        });

        return true;
    }

    async getDetail(userId: string, groupId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Không tìm thấy người dùng này..`);
        }

        const group = await this.dataServices.groups.findOne(
            {
                _id: toObjectId(groupId),
            },
            {
                populate: [
                    'administrators.user',
                    {
                        path: 'pinnedPosts',
                        populate: [
                            {
                                path: 'post',
                                populate: 'author',
                            },
                        ],
                    },
                ],
            },
        );
        if (!group) {
            throw new ForbiddenException(`Nhóm không tồn tại.`);
        }

        const groupDto = await this.dataResources.groups.mapToDto(group, user);
        const userPendingRequest = await this.joinRequestService.findByUser(user, group, {
            status: SubscribeRequestStatus.PENDING,
        });
        const isPending = !_.isNil(userPendingRequest);
        Object.assign(groupDto, {
            isPending,
        });

        return groupDto;
    }

    async getMembers(userId: string, groupId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Không tìm thấy người dùng này..`);
        }

        const group = await this.dataServices.groups.findOne({
            _id: toObjectId(groupId),
        });
        if (!group) {
            throw new ForbiddenException(`Nhóm không tồn tại.`);
        }

        const { memberIds = [] } = group;

        const users = await this.dataServices.users.findAll({
            _id: toObjectIds(memberIds),
        });

        const userDtos = await this.dataResources.users.mapToDtoList(users, user);
        return userDtos;
    }

    async requestToJoin(userId: string, groupId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Không tìm thấy người dùng này..`);
        }

        const group = await this.dataServices.groups.findOne({
            _id: toObjectId(groupId),
        });
        if (!group) {
            throw new ForbiddenException(`Nhóm không tồn tại.`);
        }

        const { memberIds = [] } = group;
        if (toStringArray(memberIds).includes(`${user._id}`)) {
            throw new BadRequestException(`Bạn đã là thành viên của nhóm.`);
        }

        await this.joinRequestService.create(user, group, {
            status: group.private ? SubscribeRequestStatus.PENDING : SubscribeRequestStatus.ACCEPTED,
        });

        if (!group.private) {
            memberIds.push(toObjectId(user._id));
            await this.dataServices.groups.updateById(group._id, {
                memberIds,
            });

            user.groupIds.push(toObjectId(group._id));
            await this.dataServices.users.updateById(user._id, {
                groupIds: user.groupIds,
            });
        }

        return true;
    }

    async cancelToJoin(userId: string, groupId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Không tìm thấy người dùng này..`);
        }

        const group = await this.dataServices.groups.findOne({
            _id: toObjectId(groupId),
        });
        if (!group) {
            throw new ForbiddenException(`Nhóm không tồn tại.`);
        }

        const joinRequest = await this.joinRequestService.findByUser(user, group, {
            status: SubscribeRequestStatus.PENDING,
        });

        if (!joinRequest) {
            throw new BadRequestException(`Bạn chưa yêu cầu tham gia nhóm này.`);
        }

        await this.joinRequestService.update(group, joinRequest._id, {
            status: SubscribeRequestStatus.REJECTED,
        });

        return true;
    }

    async leave(userId: string, groupId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Không tìm thấy người dùng này..`);
        }

        const group = await this.dataServices.groups.findOne({
            _id: toObjectId(groupId),
        });
        if (!group) {
            throw new ForbiddenException(`Nhóm không tồn tại.`);
        }

        const { memberIds = [], administrators = [] } = group;
        if (!toStringArray(memberIds).includes(`${user._id}`)) {
            throw new BadRequestException(`Bạn không phải là thành viên của nhóm.`);
        }

        if (administrators.map((admin) => `${admin.user}`).includes(`${user._id}`)) {
            if (administrators.length < 2) {
                throw new BadRequestException(
                    `Bạn là quản trị viên cuối cùng của nhóm, vui lòng chỉ định người khác làm quản trị viên để rời khỏi nhóm.`,
                );
            }
        }

        _.remove(memberIds, (id) => `${id}` == user._id);
        _.remove(administrators, (admin) => `${admin.user}` == `${user._id}`);
        await this.dataServices.groups.updateById(group._id, {
            memberIds,
            administrators,
        });

        return true;
    }

    async getPosts(userId: string, groupId: string, query: IGetPostListQuery) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Không tìm thấy người dùng này..`);
        }

        const group = await this.dataServices.groups.findOne({
            _id: toObjectId(groupId),
            $or: [
                {
                    private: false,
                },
                {
                    private: true,
                    memberIds: toObjectId(user._id),
                },
            ],
        });
        if (!group) {
            throw new ForbiddenException(`Nhóm không tồn tại.`);
        }

        const groupPosts = await this.groupPostService.getGroupPosts(group, {
            ...query,
            status: SubscribeRequestStatus.ACCEPTED,
        });

        const groupPostDtos = await this.dataResources.groupPosts.mapToDtoList(groupPosts, user);
        return groupPostDtos;
    }

    async createPost(userId: string, groupId: string, body: ICreatePostInGroupBody) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Không tìm thấy người dùng này..`);
        }

        const group = await this.dataServices.groups.findOne({
            _id: toObjectId(groupId),
            $or: [
                {
                    private: false,
                },
                {
                    private: true,
                    memberIds: toObjectId(user._id),
                },
            ],
        });
        if (!group) {
            throw new ForbiddenException(`Nhóm không tồn tại.`);
        }

        const isUserAdministrator = group.administrators.find((admin) => admin.user == user._id);
        const status = isUserAdministrator
            ? SubscribeRequestStatus.ACCEPTED
            : group.reviewPost
            ? SubscribeRequestStatus.PENDING
            : SubscribeRequestStatus.ACCEPTED;
        const createdGroupPost = await this.groupPostService.create(user, group, {
            ...body,
            status,
        });

        const groupPostDto = await this.dataResources.groupPosts.mapToDto(createdGroupPost, user);
        return groupPostDto;
    }

    async deletePost(userId: string, groupId: string, groupPostId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const group = await this.dataServices.groups.findOne({
            _id: toObjectId(groupId),
            'administrators.user': toObjectId(user._id),
        });
        if (!group) {
            throw new ForbiddenException(`Nhóm không tồn tại hoặc bạn không có quyền thực hiện thao tác này.`);
        }

        const groupPost = await this.dataServices.groupPosts.findOne({
            _id: toObjectId(groupPostId),
            sender: toObjectId(user._id),
        });
        if (!groupPost) {
            throw new ForbiddenException(`Không tìm thấy bài viết này.`);
        }

        await Promise.all([
            this.dataServices.groupPosts.deleteById(groupPost._id),
            this.dataServices.posts.deleteById(toObjectId(`${groupPost.post}`)),
        ]);

        return true;
    }

    async getUserJoinedGroups(userId: string, query: IGetGroupListQuery) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT } = query;
        const skip = (+page - 1) * +limit;

        const { groupIds = [] } = user;
        const groups = await this.dataServices.groups.findAll(
            {
                _id: groupIds,
            },
            {
                skip: skip,
                limit: +limit,
            },
        );

        const groupDtos = await this.dataResources.groups.mapToDtoList(groups, user);
        return groupDtos;
    }

    async getUserCreatedGroups(userId: string, query: IGetGroupListQuery) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT } = query;
        const skip = (+page - 1) * +limit;

        const groups = await this.dataServices.groups.findAll(
            {
                'administrators.user': user._id,
            },
            {
                skip: skip,
                limit: +limit,
            },
        );

        const groupDtos = await this.dataResources.groups.mapToDtoList(groups, user);
        return groupDtos;
    }

    async getGroupFeed(userId: string, query: IGetPostListQuery) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Không tìm thấy người dùng này.`);
        }

        const groupPosts = await this.groupPostService.getGroupPosts({} as Group, {
            ...query,
            status: SubscribeRequestStatus.ACCEPTED,
            groupIds: user.groupIds,
        });

        const groupPostDtos = await this.dataResources.groupPosts.mapToDtoList(groupPosts, user);
        return groupPostDtos;
    }

    async getUserPendingPost(userId: string, groupId: string, query: IGetGroupPostListQuery) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Không tìm thấy người dùng này.`);
        }

        const group = await this.dataServices.groups.findOne({
            _id: toObjectId(groupId),
            $or: [
                {
                    private: false,
                },
                {
                    private: true,
                    memberIds: toObjectId(user._id),
                },
            ],
        });
        if (!group) {
            throw new ForbiddenException(`Nhóm không tồn tại.`);
        }

        const groupPosts = await this.groupPostService.getGroupPosts(group, {
            ...query,
            status: SubscribeRequestStatus.PENDING,
            authorId: user._id,
        });

        const groupPostDtos = await this.dataResources.groupPosts.mapToDtoList(groupPosts, user);
        return groupPostDtos;
    }

    async makeAdministrator(userId: string, groupId: string, targetId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const targetUser = await this.dataServices.users.findById(targetId);
        if (!targetUser) {
            throw new ForbiddenException(`Không tìm thấy người dùng này.`);
        }

        const group = await this.dataServices.groups.findOne({
            _id: toObjectId(groupId),
            'administrators.user': toObjectId(user._id),
        });
        if (!group) {
            throw new ForbiddenException(`Nhóm không tồn tại hoặc bạn không có quyền thực hiện thao tác này.`);
        }

        const { administrators = [] } = group;

        if (administrators.map((admin) => `${admin.user}`).includes(`${targetUser._id}`)) {
            throw new BadRequestException(`Người này đã là quản trị viên của nhóm.`);
        }

        administrators.push({
            user: toObjectId(targetUser._id) as unknown,
            isOwner: false,
        });

        await this.dataServices.groups.updateById(group._id, {
            administrators,
        });

        return true;
    }

    async removeAdministrator(userId: string, groupId: string, targetId: string) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const targetUser = await this.dataServices.users.findById(targetId);
        if (!targetUser) {
            throw new ForbiddenException(`Không tìm thấy người dùng này.`);
        }

        const group = await this.dataServices.groups.findOne({
            _id: toObjectId(groupId),
            'administrators.user': toObjectId(user._id),
        });
        if (!group) {
            throw new ForbiddenException(`Nhóm không tồn tại hoặc bạn không có quyền thực hiện thao tác này.`);
        }

        const { administrators = [] } = group;

        const targetAdmin = administrators.find((admin) => `${admin.user}` == `${targetUser._id}`);
        if (!targetAdmin) {
            throw new BadRequestException(`Người này không phải là quản trị viên của nhóm.`);
        }

        if (targetAdmin.isOwner) {
            throw new BadRequestException(`Bạn không có quyền thực hiện thao tác này với người sáng lập.`);
        }

        _.remove(administrators, (admin) => `${admin.user}` == `${targetUser._id}`);

        await this.dataServices.groups.updateById(group._id, {
            administrators,
        });

        return true;
    }
}
