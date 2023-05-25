import * as _ from 'lodash';
import { toStringArray } from 'src/common/helper';
import { GroupDocument, UserDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';
import { ObjectId } from 'mongodb';

export class GroupResource extends IGenericResource<GroupDocument, UserDocument> {
    async mapToDto(group: GroupDocument, user?: UserDocument): Promise<object> {
        const groupDto = _.cloneDeep(group.toObject());

        groupDto.administrators.forEach((administrator) => {
            if (!ObjectId.isValid(administrator.user) && _.isObject(administrator.user)) {
                const userDto = _.cloneDeep(administrator.user);
                Object.assign(userDto, {
                    numberOfSubscribers: userDto.subscriberIds?.length,
                    numberOfSubscribing: userDto.subscribingIds?.length,
                    isSubscribing: toStringArray(userDto?.subscriberIds).includes(`${user?._id}`),
                    isSelf: `${userDto?._id}` == user._id,
                });

                delete userDto.password;
                delete userDto.blockedIds;
                delete userDto.subscriberIds;
                delete userDto.subscribingIds;
                delete userDto.lastRefreshToken;
                administrator.user = userDto;
            }
        });

        const isMember = toStringArray(groupDto.memberIds).includes(`${user?._id}`);

        Object.assign(groupDto, {
            isMember,
        });

        return groupDto;
    }
}
