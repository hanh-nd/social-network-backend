import { UserDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';

export class UserResource extends IGenericResource<UserDocument> {
    async mapToDto(user: UserDocument): Promise<object> {
        const userDto = Object.assign({}, user.toObject(), {
            numberOfSubscribers: user.subscriberIds.length,
            numberOfSubscribing: user.subscribingIds.length,
        });

        delete userDto.password;
        delete userDto.blockedIds;
        delete userDto.subscriberIds;
        delete userDto.subscribingIds;
        delete userDto.lastRefreshToken;

        return userDto;
    }
}
