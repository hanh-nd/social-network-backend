import { BadRequestException, Injectable } from '@nestjs/common';
import { SubscribeRequestStatus } from 'src/common/constants';
import { toObjectId, toStringArray } from 'src/common/helper';
import { IDataServices } from 'src/common/repositories/data.service';
import { IDataResources } from 'src/common/resources/data.resource';
import { Group, JoinRequest, User } from 'src/mongo-schemas';
import { ICreateJoinRequestBody, IUpdateJoinRequestBody } from './join-request.interface';

@Injectable()
export class JoinRequestService {
    constructor(private dataServices: IDataServices, private dataResources: IDataResources) {}

    async create(user: User, group: Group, body: ICreateJoinRequestBody) {
        const toCreateBody: Partial<JoinRequest> = {
            ...body,
            sender: toObjectId(user._id) as unknown,
            group: toObjectId(group._id) as unknown,
        };

        const createdJoinRequest = await this.dataServices.joinRequests.create(toCreateBody);
        return createdJoinRequest;
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
