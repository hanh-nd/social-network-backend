import * as _ from 'lodash';
import { toObjectId } from 'src/common/helper';
import { ChatDocument, UserDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';

export class ChatResource extends IGenericResource<ChatDocument, UserDocument> {
    async mapToDto(chat: ChatDocument, user?: UserDocument): Promise<object> {
        const chatDto = _.cloneDeep(chat.toObject());
        const lastMessageCondition = {
            chat: toObjectId(chat._id),
        };
        if (user) {
            Object.assign(lastMessageCondition, {
                deletedFor: {
                    $ne: toObjectId(user._id),
                },
            });
        }
        const lastMessage = await this.dataServices.messages.findOne(lastMessageCondition, {
            sort: [['createdAt', -1]],
        });

        chatDto.lastMessage = lastMessage;

        return chatDto;
    }
}
