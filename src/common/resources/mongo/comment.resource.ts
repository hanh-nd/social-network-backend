import * as _ from 'lodash';
import { toStringArray } from 'src/common/helper';
import { CommentDocument, UserDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';

export class CommentResource extends IGenericResource<CommentDocument, UserDocument> {
    async mapToDto(comment: CommentDocument, user?: UserDocument): Promise<object> {
        const commentDto = _.cloneDeep(comment.toObject());

        if (_.isObject(commentDto.author)) {
            commentDto.author = _.pick(commentDto.author, ['_id', 'username', 'avatarId', 'fullName', 'subscriberIds']);
        }

        if (_.isObject(commentDto.post)) {
            commentDto.post = _.pick(commentDto.post, ['_id']);
        }

        Object.assign(commentDto, {
            numberOfReactions: commentDto.reactIds.length,
        });

        if (user) {
            const isReacted = commentDto.reactIds.map((id) => `${id}`).includes(`${user._id}`);
            commentDto.isReacted = isReacted;
            const isSubscribing = toStringArray(commentDto.author.subscriberIds).includes(`${user._id}`);
            commentDto.author.isSubscribing = isSubscribing;
        }

        delete commentDto.reactIds;
        delete commentDto.point;
        return commentDto;
    }
}
