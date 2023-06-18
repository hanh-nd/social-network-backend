import * as _ from 'lodash';
import { toStringArray } from 'src/common/helper';
import { ReactionDocument, UserDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';

export class ReactionResource extends IGenericResource<ReactionDocument, UserDocument> {
    async mapToDto(reaction: ReactionDocument, user: UserDocument): Promise<object> {
        const reactionDto = _.cloneDeep(reaction.toObject());

        if (_.isObject(reactionDto.author)) {
            reactionDto.author = _.pick(reactionDto.author, [
                '_id',
                'username',
                'avatarId',
                'fullName',
                'subscriberIds',
            ]);
        }

        if (_.isObject(reactionDto.target)) {
            reactionDto.target = _.pick(reactionDto.target, ['_id']);
        }

        if (user && reactionDto?.author?.subscriberIds) {
            const isSubscribing = toStringArray(reactionDto.author.subscriberIds).includes(`${user._id}`);
            if (`${reactionDto.author._id}` == `${user._id}`) {
                reactionDto.author.isSelf = true;
            }
            reactionDto.author.isSubscribing = isSubscribing;
        }

        return reactionDto;
    }
}
