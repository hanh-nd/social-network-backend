import * as _ from 'lodash';
import { toStringArray } from 'src/common/helper';
import { CommentDocument, Post, UserDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';

export class CommentResource extends IGenericResource<CommentDocument, UserDocument> {
    async mapToDto(comment: CommentDocument, user?: UserDocument): Promise<object> {
        const commentDto = _.cloneDeep(comment.toObject());

        let isAnonymous = false;

        if (_.isObject(commentDto.author)) {
            commentDto.author = _.pick(commentDto.author, ['_id', 'username', 'avatarId', 'fullName', 'subscriberIds']);
        }

        if (_.isObject(commentDto.post)) {
            isAnonymous = (commentDto.post as Post)?.isAnonymous;
            commentDto.post = _.pick(commentDto.post, ['_id']);
        }

        Object.assign(commentDto, {
            numberOfReactions: commentDto.reactIds.length,
        });

        if (user && commentDto?.author?.subscriberIds) {
            const isReacted = commentDto.reactIds.map((id) => `${id}`).includes(`${user._id}`);
            commentDto.isReacted = isReacted;
            if (isReacted) {
                const reactionType = await this.dataServices.reactions.findOne({
                    author: user._id,
                    target: commentDto._id,
                    targetType: 'Comment',
                });
                commentDto.reactionType = reactionType?.type;
            }
            const isSubscribing = toStringArray(commentDto.author.subscriberIds).includes(`${user._id}`);
            if (`${commentDto.author._id}` == `${user._id}`) {
                commentDto.author.isSelf = true;
            }
            commentDto.author.isSubscribing = isSubscribing;
        }

        Object.assign(commentDto, {
            numberOfReacts: commentDto.reactIds.length,
        });

        if (isAnonymous && !commentDto?.author?.isSelf) {
            commentDto.author = {
                fullName: 'Người dùng ẩn danh',
            };
        }

        delete commentDto.reactIds;
        delete commentDto.point;
        return commentDto;
    }
}
