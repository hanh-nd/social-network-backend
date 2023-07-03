import { BadRequestException, Injectable } from '@nestjs/common';
import { NotificationAction, NotificationTargetType, SubscribeRequestStatus } from 'src/common/constants';
import { toObjectId, toStringArray } from 'src/common/helper';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Group, JoinRequest, User } from 'src/mongo-schemas';
import { NotificationService } from '../notifications/notification.service';
import { ICreateJoinRequestBody, IGetJoinRequestQuery, IUpdateJoinRequestBody } from './join-request.interface';

@Injectable()
export class JoinRequestService {
    constructor(
        private dataServices: IDataServices,
        private dataResources: IDataResources,
        private notificationService: NotificationService,
    ) {}

    async create(user: User, group: Group, body: ICreateJoinRequestBody) {
        const toCreateBody: Partial<JoinRequest> = {
            ...body,
            sender: toObjectId(user._id) as unknown,
            group: toObjectId(group._id) as unknown,
        };

        const createdJoinRequest = await this.dataServices.joinRequests.create(toCreateBody);

        // Send notification to group's owner
        const groupAdminIds = group.administrators.map((admin) => `${admin.user}`);
        for (const adminId of groupAdminIds) {
            this.notificationService.create(
                user,
                {
                    _id: adminId,
                },
                NotificationTargetType.GROUP,
                group,
                NotificationAction.REQUEST_JOIN_GROUP,
            );
        }
        return createdJoinRequest;
    }

    async findByUser(user: User, group: Group, query: IGetJoinRequestQuery) {
        const { status } = query;
        const joinRequest = await this.dataServices.joinRequests.findOne({
            sender: user._id,
            group: group._id,
            status,
        });

        return joinRequest;
    }

    async update(group: Group, joinRequestId: string, body: IUpdateJoinRequestBody) {
        const existedJoinRequest = await this.dataServices.joinRequests.findOne({
            _id: toObjectId(joinRequestId),
            status: SubscribeRequestStatus.PENDING,
        });

        if (!existedJoinRequest) {
            throw new BadRequestException(`Không tìm thấy yêu cầu này`);
        }

        const { blockIds, memberIds } = group;
        if (toStringArray(blockIds).includes(`${existedJoinRequest.sender}`)) {
            return {
                success: false,
            };
        }

        if (toStringArray(memberIds).includes(`${existedJoinRequest.sender}`)) {
            return {
                success: false,
            };
        }

        const { status } = body;
        await this.dataServices.joinRequests.updateById(existedJoinRequest._id, {
            status,
        });

        if (status !== SubscribeRequestStatus.ACCEPTED) {
            this.notificationService.create(
                {
                    _id: group?.administrators?.[0]?.user?._id ?? (group?.administrators?.[0]?.user as string),
                },
                {
                    _id: existedJoinRequest.sender as string,
                },
                NotificationTargetType.GROUP,
                group,
                NotificationAction.ACCEPT_JOIN_GROUP,
            );
            return {
                success: false,
            };
        }

        return {
            success: true,
            data: existedJoinRequest,
        };
    }
}
