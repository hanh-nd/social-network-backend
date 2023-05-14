import * as _ from 'lodash';
import { User, UserDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';
import { toStringArray } from 'src/common/helper';

export class UserResource extends IGenericResource<UserDocument> {
    async mapToDto(user: UserDocument, loginUser?: User): Promise<object> {
        const userDto = _.cloneDeep(user.toObject());

        Object.assign(userDto, {
            numberOfSubscribers: userDto.subscriberIds.length,
            numberOfSubscribing: userDto.subscribingIds.length,
            isSubscribing: toStringArray(userDto.subscriberIds).includes(`${loginUser?._id}`),
        });

        delete userDto.password;
        delete userDto.blockedIds;
        delete userDto.subscriberIds;
        delete userDto.subscribingIds;
        delete userDto.lastRefreshToken;

        return userDto;
    }
}
