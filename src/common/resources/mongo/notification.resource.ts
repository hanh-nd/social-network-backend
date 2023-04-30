import * as _ from 'lodash';
import { NotificationDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';

export class NotificationResource extends IGenericResource<NotificationDocument> {
    async mapToDto(notification: NotificationDocument): Promise<object> {
        const notificationDto = _.cloneDeep(notification.toObject());

        if (_.isObject(notificationDto.author)) {
            notificationDto.author = _.pick(notificationDto.author, ['_id', 'username', 'avatarId', 'fullName']);
        }

        if (_.isObject(notificationDto.target)) {
            notificationDto.target = _.pick(notificationDto.target, ['_id', 'content']);
        }

        return notificationDto;
    }
}
