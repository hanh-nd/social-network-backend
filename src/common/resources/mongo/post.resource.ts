import * as _ from 'lodash';
import { toStringArray } from 'src/common/helper';
import { PostDocument, User, UserDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';

export class PostResource extends IGenericResource<PostDocument, UserDocument> {
    async mapToDto(post: PostDocument, user?: User): Promise<object> {
        const postDto = _.cloneDeep(post.toObject());

        if (_.isObject(postDto.author)) {
            postDto.author = _.pick(postDto.author, ['_id', 'username', 'avatarId', 'fullName', 'subscriberIds']);
        }

        if (_.isObject(postDto.discussedIn)) {
            postDto.discussedIn = _.pick(postDto.discussedIn, ['_id', 'username', 'avatarId', 'fullName']);
        }

        if (_.isObject(postDto.postShared)) {
            postDto.postShared = _.pick(postDto.postShared, [
                '_id',
                'author',
                'content',
                'privacy',
                'pictureIds',
                'videoIds',
                'createdAt',
                'updatedAt',
                'deletedAt',
            ]);

            if (_.isObject(postDto.postShared?.author)) {
                postDto.postShared.author = _.pick(postDto.postShared.author, [
                    '_id',
                    'username',
                    'avatarId',
                    'fullName',
                ]);
            }
        }

        Object.assign(postDto, {
            numberOfComments: postDto.commentIds.length,
            numberOfReacts: postDto.reactIds.length,
            numberOfShares: postDto.sharedIds.length,
        });

        if (user) {
            const isReacted = postDto.reactIds.map((id) => `${id}`).includes(`${user._id}`);
            postDto.isReacted = isReacted;
            if (isReacted) {
                const reactionType = await this.dataServices.reactions.findOne({
                    author: user._id,
                    target: postDto._id,
                    targetType: 'Post',
                });
                postDto.reactionType = reactionType?.type;
            }
            const isSubscribing = toStringArray(postDto.author.subscriberIds).includes(`${user._id}`);
            postDto.author.isSubscribing = isSubscribing;
        }

        delete postDto.commentIds;
        delete postDto.reactIds;
        delete postDto.sharedIds;
        delete postDto.point;
        delete postDto.isDeletedBySystem;

        return postDto;
    }
}
