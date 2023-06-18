import { BadRequestException, Injectable } from '@nestjs/common';
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_VALUE, SubscribeRequestStatus } from 'src/common/constants';
import { toObjectId } from 'src/common/helper';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { SubscribeRequest, User } from 'src/mongo-schemas';
import { IGetSubscribeRequestListQuery, IUpdateSubscribeRequestBody } from './subscribe-request.interface';
@Injectable()
export class SubscribeRequestService {
    constructor(private dataServices: IDataServices, private dataResources: IDataResources) {}

    async getSubscribeRequests(loginUser: User, query: IGetSubscribeRequestListQuery) {
        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT } = query;
        const skip = (+page - 1) * +limit;
        const subscribeRequests = await this.dataServices.subscribeRequests.findAll(
            {
                receiver: loginUser._id,
                status: SubscribeRequestStatus.PENDING,
            },
            {
                populate: [
                    {
                        path: 'sender',
                        select: '_id fullName avatarId',
                    },
                ],
                skip: skip,
                limit: +limit,
                sort: [['createdAt', -1]],
            },
        );
        return subscribeRequests;
    }

    async getSentSubscribeRequests(loginUser: User, query: IGetSubscribeRequestListQuery) {
        const { page = DEFAULT_PAGE_VALUE, limit = DEFAULT_PAGE_LIMIT } = query;
        const skip = (+page - 1) * +limit;
        const subscribeRequests = await this.dataServices.subscribeRequests.findAll(
            {
                sender: loginUser._id,
                status: SubscribeRequestStatus.PENDING,
            },
            {
                populate: [
                    {
                        path: 'receiver',
                        select: '_id fullName avatarId',
                    },
                ],
                skip: skip,
                limit: +limit,
                sort: [['createdAt', -1]],
            },
        );
        return subscribeRequests;
    }

    async create(sender: User, receiver: User, status: number) {
        const toCreateSubscribeRequestBody: Partial<SubscribeRequest> = {
            sender: sender._id as unknown,
            receiver: receiver._id as unknown,
            status,
        };

        const createdSubscribeRequest = await this.dataServices.subscribeRequests.create(toCreateSubscribeRequestBody);
        return createdSubscribeRequest;
    }

    async updateSubscribeRequest(user: User, subscribeRequestId: string, body: IUpdateSubscribeRequestBody) {
        const { status } = body;

        const toUpdateSubscribeRequest = await this.dataServices.subscribeRequests.findOne({
            _id: toObjectId(subscribeRequestId),
            status: SubscribeRequestStatus.PENDING,
        });

        if (!toUpdateSubscribeRequest) {
            throw new BadRequestException(`Không tìm thấy lời mời này.`);
        }

        const updatedSubscribeRequest = await this.dataServices.subscribeRequests.updateById(
            toUpdateSubscribeRequest._id,
            {
                status,
            },
            {
                populate: [
                    {
                        path: 'sender',
                        select: '_id fullName avatarId subscriberIds subscribingIds',
                    },
                    {
                        path: 'receiver',
                        select: '_id fullName avatarId subscriberIds subscribingIds',
                    },
                ],
            },
        );

        return updatedSubscribeRequest;
    }

    async cancelSubscribeRequest(user: User, targetUser: User) {
        const toUpdateSubscribeRequest = await this.dataServices.subscribeRequests.findOne({
            sender: user._id,
            receiver: targetUser._id,
            status: SubscribeRequestStatus.PENDING,
        });

        if (!toUpdateSubscribeRequest) {
            return null;
        }

        const updatedSubscribeRequest = await this.dataServices.subscribeRequests.updateById(
            toUpdateSubscribeRequest._id,
            {
                status: SubscribeRequestStatus.REJECTED,
            },
        );

        return updatedSubscribeRequest;
    }
}
