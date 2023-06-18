import * as _ from 'lodash';
import { toObjectId, toStringArray } from 'src/common/helper';
import { User, UserDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';
import { SubscribeRequestStatus } from 'src/common/constants';

export class UserResource extends IGenericResource<UserDocument> {
    async mapToDto(user: UserDocument, loginUser?: User): Promise<object> {
        const userDto = _.cloneDeep(user.toObject());

        Object.assign(userDto, {
            numberOfSubscribers: userDto.subscriberIds.length,
            numberOfSubscribing: userDto.subscribingIds.length,
            isSubscribing: toStringArray(userDto.subscriberIds).includes(`${loginUser?._id}`),
            isBlocked: toStringArray(loginUser?.blockedIds || []).includes(`${user?._id}`),
            isSelf: `${userDto._id}` == `${loginUser?._id}`,
        });

        if (userDto.isSelf) {
            userDto.numberOfBlocked = userDto.blockedIds?.length;
        } else if (loginUser) {
            const isSentRequest = await this.dataServices.subscribeRequests.findOne({
                sender: toObjectId(loginUser._id),
                receiver: toObjectId(user._id),
                status: SubscribeRequestStatus.PENDING,
            });
            userDto.isSentRequest = isSentRequest ? true : false;
        }

        delete userDto.password;
        delete userDto.blockedIds;
        delete userDto.subscriberIds;
        delete userDto.subscribingIds;
        delete userDto.lastRefreshToken;

        return userDto;
    }
}
