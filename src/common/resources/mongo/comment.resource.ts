import * as _ from 'lodash';
import { CommentDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';

export class CommentResource extends IGenericResource<CommentDocument> {
    async mapToDto(comment: CommentDocument): Promise<object> {
        if (_.isObject(comment.author)) {
            comment.author = _.pick(comment.author, ['_id', 'username', 'avatarId', 'fullName']);
        }

        if (_.isObject(comment.post)) {
            comment.post = _.pick(comment.post, ['_id']);
        }

        const commentDto = Object.assign({}, comment.toObject(), {
            numberOfReactions: comment.reactIds.length,
        });

        delete commentDto.reactIds;
        delete commentDto.point;
        return commentDto;
    }
}
