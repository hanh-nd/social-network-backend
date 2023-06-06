import * as _ from 'lodash';
import { UserDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';

export class UserResource extends IGenericResource<UserDocument> {
    async mapToDto(user: UserDocument): Promise<object> {
        const userDto = _.cloneDeep(user.toObject());

        Object.assign(userDto, {
            numberOfSubscribers: userDto.subscriberIds.length,
            numberOfSubscribing: userDto.subscribingIds.length,
        });

        delete userDto.password;
        delete userDto.blockedIds;
        delete userDto.subscriberIds;
        delete userDto.subscribingIds;
        delete userDto.lastRefreshToken;

        return userDto;
    }
}
