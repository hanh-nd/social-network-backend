import {
    BadGatewayException,
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import * as _ from 'lodash';
import * as moment from 'moment';
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
import { User } from 'src/mongo-schemas';
import { compare, hash } from 'src/plugins/bcrypt';
import { FileService } from '../files/file.service';
import { SocketGateway } from '../gateway/socket.gateway';
import { NotificationService } from '../notifications/notification.service';
import { IGetPostListQuery } from '../posts/post.interface';
import {
    IGetSubscribeRequestListQuery,
    IUpdateSubscribeRequestBody,
} from '../subscribe-requests/subscribe-request.interface';
import { SubscribeRequestService } from '../subscribe-requests/subscribe-request.service';
import { IChangePasswordBody, IGetUserListQuery, IUpdateProfileBody } from './user.interface';

@Injectable()
export class UserService {
    constructor(
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private fileService: FileService,
        private elasticsearchService: ElasticsearchService,
        private socketGateway: SocketGateway,
        private subscribeRequestService: SubscribeRequestService,
        private notificationService: NotificationService,
    ) {}

    async getUserProfile(loginUserId: string, userId: string) {
        const [loginUser, user] = await Promise.all([
            this.dataServices.users.findById(loginUserId, {
                select: ['-password'],
            }),
            this.dataServices.users.findById(userId, {
                select: ['-password'],
            }),
        ]);

        if (!loginUser) {
            throw new NotFoundException('Bạn không có quyền thực hiên thao tác này.');
        }

        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng này.');
        }

        if (toStringArray(loginUser.blockedIds).includes(`${user._id}`)) {
            throw new NotFoundException('Không tìm thấy người dùng này.');
        }

        const userDto = await this.dataResources.users.mapToDto(user, loginUser);
        return userDto;
    }

    async getUserDetail(loginUserId: string, userId: string) {
        const [loginUser, user] = await Promise.all([
            this.dataServices.users.findById(loginUserId),
            this.dataServices.users.findById(userId),
        ]);

        if (!loginUser) {
            throw new NotFoundException('Bạn không có quyền thực hiên thao tác này.');
        }

        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng này.');
        }

        const userDetail = await this.dataServices.userDetails.findOne({
            userId: toObjectId(userId),
        });
        if (!userDetail) return null;
        return {
            ...userDetail.toObject(),
            tagIds: user.tagIds,
        };
    }

    async changeUserPassword(userId: string, body: IChangePasswordBody) {
        const existedUser = await this.dataServices.users.findById(userId);
        if (!existedUser) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }
        const isCorrectPassword = await compare(body.oldPassword, existedUser.password);
        if (!isCorrectPassword) {
            throw new ForbiddenException(`Mật khẩu không đúng. Vui lòng thử lại.`);
        }

        const hashedPassword = await hash(body.password);
        await this.dataServices.users.updateById(existedUser._id, {
            password: hashedPassword,
        });

        return true;
    }

    async updateProfile(userId: string, body: IUpdateProfileBody) {
        const existedUser = await this.dataServices.users.findById(userId);
        if (!existedUser) {
            throw new NotFoundException(`Không tìm thấy user này.`);
        }

        const { birthday } = body;

        await this.dataServices.users.updateById(userId, body);
        await this.dataServices.userDetails.updateOne(
            {
                userId: toObjectId(userId),
            },
            {
                ...body,
                userId: toObjectId(userId),
                birthday: moment(birthday).utc(true).toISOString(),
            },
            {
                upsert: true,
            },
        );

        this.elasticsearchService.updateById<User>(ElasticsearchIndex.USER, existedUser._id, {
            id: existedUser._id,
            username: existedUser.username,
            fullName: body.fullName ?? existedUser.fullName,
        });

        return true;
    }

    async getSubscribers(userId: string) {
        const existedUser = await this.dataServices.users.findById(userId);
        if (!existedUser) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const subscriberIds = existedUser.subscriberIds;
        const subscribers = await this.dataServices.users.findAll({
            _id: {
                $in: subscriberIds,
            },
        });

        const subscriberDtos = await this.dataResources.users.mapToDtoList(subscribers, existedUser);
        return subscriberDtos;
    }

    async removeSubscribers(loginUserId: string, targetUserId: string) {
        const users = await this.dataServices.users.findAll({
            _id: toObjectIds([loginUserId, targetUserId]),
        });
        if (users.length < [loginUserId, targetUserId].length) {
            throw new NotFoundException(`Không tìm thấy người dùng.`);
        }

        const loginUser = users.find((u) => `${u._id}` == loginUserId);
        const targetUser = users.find((u) => `${u._id}` == targetUserId);

        await this.unsubscribeTargetUser(targetUser, loginUser);
        return true;
    }

    async getBlockedList(userId: string) {
        const existedUser = await this.dataServices.users.findById(userId);
        if (!existedUser) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const blockedIds = existedUser.blockedIds;
        const blockedList = await this.dataServices.users.findAll({
            _id: {
                $in: blockedIds,
            },
        });
        const blockedDtos = await this.dataResources.users.mapToDtoList(blockedList, existedUser);
        return blockedDtos;
    }

    async getSubscribing(userId: string) {
        const existedUser = await this.dataServices.users.findById(userId);
        if (!existedUser) {
            throw new ForbiddenException(`Bạn không có quyền thực hiện thao tác này.`);
        }

        const subscribingIds = existedUser.subscribingIds;
        const subscribing = await this.dataServices.users.findAll({
            _id: {
                $in: subscribingIds,
            },
        });
        const subscribingDtos = await this.dataResources.users.mapToDtoList(subscribing, existedUser);
        return subscribingDtos;
    }

    async getUserFiles(userId: string) {
        return await this.fileService.findAll({
            userId,
        });
    }

    async subscribeOrUnsubscribeUser(loginUserId: string, targetUserId: string) {
        const users = await this.dataServices.users.findAll({
            _id: toObjectIds([loginUserId, targetUserId]),
        });
        if (users.length < [loginUserId, targetUserId].length) {
            throw new NotFoundException(`Không tìm thấy người dùng.`);
        }

        const loginUser = users.find((u) => `${u._id}` == loginUserId);
        const targetUser = users.find((u) => `${u._id}` == targetUserId);
        const targetUserBlockIds = targetUser.blockedIds;
        const isUserBlockedByTargetUser = targetUserBlockIds.map((id) => `${id}`).includes(`${loginUser._id}`);
        if (isUserBlockedByTargetUser) {
            throw new BadGatewayException(`Bạn đã bị chặn bởi người dùng này.`);
        }

        const loginUserSubscribingIds = loginUser.subscribingIds;
        const isUserSubscribingTargetUser = loginUserSubscribingIds.map((id) => `${id}`).includes(`${targetUserId}`);
        if (isUserSubscribingTargetUser) {
            return await this.unsubscribeTargetUser(loginUser, targetUser);
        } else {
            const canceledSubscribeRequest = await this.subscribeRequestService.cancelSubscribeRequest(
                loginUser,
                targetUser,
            );
            if (canceledSubscribeRequest) return canceledSubscribeRequest;
            return await this.subscribeUser(loginUser, targetUser);
        }
    }

    private async subscribeUser(loginUser: User, targetUser: User) {
        if (targetUser.private) {
            await this.subscribePrivateUser(loginUser, targetUser);
        } else {
            await this.subscribePublicUser(loginUser, targetUser);
        }

        return true;
    }

    private async subscribePublicUser(loginUser: User, targetUser: User) {
        // target user is public. no need to wait for target user to accept
        // create subscribe request with status accepted
        const createdSubscribeRequestId = await this.subscribeRequestService.create(
            loginUser,
            targetUser,
            SubscribeRequestStatus.ACCEPTED,
        );
        // TODO: Send notification to target user;

        await this.subscribeTargetUser(loginUser, targetUser);
        return true;
    }

    private async subscribePrivateUser(loginUser: User, targetUser: User) {
        // target user is private. have to wait for target user to accept
        const createdSubscribeRequestId = await this.subscribeRequestService.create(
            loginUser,
            targetUser,
            SubscribeRequestStatus.PENDING,
        );
        // TODO: Send notification to target user;

        return true;
    }

    private async subscribeTargetUser(loginUser: User, targetUser: User) {
        const loginUserSubscribingIds = loginUser.subscribingIds;
        loginUserSubscribingIds.push(toObjectId(targetUser._id));
        const targetUserSubscriberIds = targetUser.subscriberIds;
        targetUserSubscriberIds.push(toObjectId(loginUser._id));

        await Promise.all([
            this.dataServices.users.updateById(loginUser._id, {
                subscribingIds: loginUserSubscribingIds,
            }),
            this.dataServices.users.updateById(targetUser._id, {
                subscriberIds: targetUserSubscriberIds,
            }),
        ]);

        return true;
    }

    private async unsubscribeTargetUser(loginUser: User, targetUser: User) {
        const loginUserSubscribingIds = loginUser.subscribingIds;
        _.remove(loginUserSubscribingIds, (id) => `${id}` == targetUser._id);
        const targetUserSubscriberIds = targetUser.subscriberIds;
        _.remove(targetUserSubscriberIds, (id) => `${id}` == loginUser._id);

        await Promise.all([
            this.dataServices.users.updateById(loginUser._id, {
                subscribingIds: loginUserSubscribingIds,
            }),
            this.dataServices.users.updateById(targetUser._id, {
                subscriberIds: targetUserSubscriberIds,
            }),
        ]);

        return true;
    }

    async blockOrUnblockUser(loginUserId: string, targetUserId: string) {
        const users = await this.dataServices.users.findAll({
            _id: toObjectIds([loginUserId, targetUserId]),
        });
        if (users.length < [loginUserId, targetUserId].length) {
            throw new NotFoundException(`Không tìm thấy người dùng.`);
        }

        const loginUser = users.find((u) => `${u._id}` === loginUserId);
        const targetUser = users.find((u) => `${u._id}` === targetUserId);
        const loginUserBlockIds = loginUser.blockedIds;
        const isTargetUserBlockedByLoginUser = loginUserBlockIds.map((id) => `${id}`).includes(`${targetUser._id}`);
        if (isTargetUserBlockedByLoginUser) {
            await this.unblockUser(loginUser, targetUser);
        } else {
            await this.blockUser(loginUser, targetUser);
        }

        return true;
    }

    private async blockUser(loginUser: User, targetUser: User) {
        const loginUserBlockIds = loginUser.blockedIds;
        loginUserBlockIds.push(toObjectId(targetUser._id));
        await this.dataServices.users.updateById(loginUser._id, {
            blockedIds: loginUserBlockIds,
        });

        const targetUserSubscribingIds = targetUser.subscribingIds;
        const isTargetUserSubscribingLoginUser = targetUserSubscribingIds
            .map((id) => `${id}`)
            .includes(`${loginUser._id}`);
        if (isTargetUserSubscribingLoginUser) {
            // unsubscribe
            await this.unsubscribeTargetUser(targetUser, loginUser);
        }
        const targetUserSubscriberIds = targetUser.subscriberIds;
        const isLoginUserSubscribingTargetUser = targetUserSubscriberIds
            .map((id) => `${id}`)
            .includes(`${loginUser._id}`);
        if (isLoginUserSubscribingTargetUser) {
            // unsubscribe
            await this.unsubscribeTargetUser(loginUser, targetUser);
        }
    }

    private async unblockUser(loginUser: User, targetUser: User) {
        const loginUserBlockIds = loginUser.blockedIds;
        _.remove(loginUserBlockIds, (id) => `${id}` == targetUser._id);
        await this.dataServices.users.updateById(loginUser._id, {
            blockedIds: loginUserBlockIds,
        });
    }

    async getSubscribeRequests(userId: string, query: IGetSubscribeRequestListQuery) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new BadRequestException(`Không tìm thấy người dùng này.`);
        }

        const subscribeRequests = await this.subscribeRequestService.getSubscribeRequests(user, query);
        return subscribeRequests;
    }

    async getSentSubscribeRequests(userId: string, query: IGetSubscribeRequestListQuery) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new BadRequestException(`Không tìm thấy người dùng này.`);
        }

        const subscribeRequests = await this.subscribeRequestService.getSentSubscribeRequests(user, query);
        return subscribeRequests;
    }

    async updateSubscribeRequest(userId: string, subscribeRequestId: string, body: IUpdateSubscribeRequestBody) {
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new BadRequestException(`Không tìm thấy người dùng này.`);
        }

        const updatedSubscribeRequest = await this.subscribeRequestService.updateSubscribeRequest(
            user,
            subscribeRequestId,
            body,
        );
        if (updatedSubscribeRequest.status === SubscribeRequestStatus.ACCEPTED) {
            // update user's, target user's subscribeIds;
            const { sender, receiver } = updatedSubscribeRequest;
            await this.subscribeTargetUser(sender as User, receiver as User);

            // TODO: Send notification to target user;
        }

        return true;
    }

    async getUserSuggestions(userId: string, query: IGetUserListQuery) {
        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT } = query;
        const skip = (+page - 1) * +limit;
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new BadRequestException(`Không tìm thấy người dùng này.`);
        }

        const POINT_RANGE = 100;
        const userPointMinValue = user.point - POINT_RANGE;
        const userPointMaxValue = user.point + POINT_RANGE;

        const suggestions = await this.dataServices.users.findAll(
            {
                point: {
                    $gte: userPointMinValue,
                    $lte: userPointMaxValue,
                },
            },
            {
                skip: skip,
                limit: +limit,
                sort: [['point', -1]],
            },
        );

        const suggestionDtos = await this.dataResources.users.mapToDtoList(suggestions, user);
        return suggestionDtos;
    }

    async getUserPosts(loginUserId: string, userId: string, query: IGetPostListQuery) {
        const loginUser = await this.dataServices.users.findById(loginUserId);
        if (!loginUser) {
            throw new ForbiddenException(`Không tìm thấy người dùng này.`);
        }
        const user = await this.dataServices.users.findById(userId);
        if (!user) {
            throw new ForbiddenException(`Không tìm thấy người dùng này.`);
        }
        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT } = query;
        const skip = (page - 1) * +limit;
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
                    {
                        path: 'postShared',
                        populate: ['author'],
                    },
                ],
                skip: skip,
                limit: +limit,
            },
        );
        const postDtos = await this.dataResources.posts.mapToDtoList(posts, loginUser);
        return postDtos;
    }
}
