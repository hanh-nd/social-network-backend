import * as _ from 'lodash';
import { ReactionDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';

export class ReactionResource extends IGenericResource<ReactionDocument> {
    async mapToDto(reaction: ReactionDocument): Promise<object> {
        if (_.isObject(reaction.author)) {
            reaction.author = _.pick(reaction.author, ['_id', 'username', 'avatarId', 'fullName']);
        }

        if (_.isObject(reaction.target)) {
            reaction.target = _.pick(reaction.target, ['_id']);
        }

        const reactionDto = Object.assign({}, reaction.toObject());
        return reactionDto;
    }
}
