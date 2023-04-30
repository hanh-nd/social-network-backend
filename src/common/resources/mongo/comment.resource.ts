import * as _ from 'lodash';
import { CommentDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';

export class CommentResource extends IGenericResource<CommentDocument> {
    async mapToDto(comment: CommentDocument): Promise<object> {
        const commentDto = _.cloneDeep(comment.toObject());

        if (_.isObject(commentDto.author)) {
            commentDto.author = _.pick(commentDto.author, ['_id', 'username', 'avatarId', 'fullName']);
        }

        if (_.isObject(commentDto.post)) {
            commentDto.post = _.pick(commentDto.post, ['_id']);
        }

        Object.assign(commentDto, {
            numberOfReactions: commentDto.reactIds.length,
        });

        delete commentDto.reactIds;
        delete commentDto.point;
        return commentDto;
    }
}
