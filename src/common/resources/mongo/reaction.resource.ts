import * as _ from 'lodash';
import { ReactionDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';

export class ReactionResource extends IGenericResource<ReactionDocument> {
    async mapToDto(reaction: ReactionDocument): Promise<object> {
        const reactionDto = _.cloneDeep(reaction.toObject());

        if (_.isObject(reactionDto.author)) {
            reactionDto.author = _.pick(reactionDto.author, ['_id', 'username', 'avatarId', 'fullName']);
        }

        if (_.isObject(reactionDto.target)) {
            reactionDto.target = _.pick(reactionDto.target, ['_id']);
        }

        return reactionDto;
    }
}
