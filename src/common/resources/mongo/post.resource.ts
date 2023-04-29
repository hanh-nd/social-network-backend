import * as _ from 'lodash';
import { PostDocument, User, UserDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';

export class PostResource extends IGenericResource<PostDocument, UserDocument> {
    async mapToDto(post: PostDocument, user?: User): Promise<object> {
        if (_.isObject(post.author)) {
            post.author = _.pick(post.author, ['_id', 'username', 'avatarId', 'fullName']);
        }

        if (_.isObject(post.discussedIn)) {
            post.discussedIn = _.pick(post.discussedIn, ['_id', 'username', 'avatarId', 'fullName']);
        }

        if (_.isObject(post.postShared)) {
            post.postShared = _.pick(post.postShared, [
                '_id',
                'author',
                'content',
                'privacy',
                'pictureIds',
                'videoIds',
            ]);

            if (_.isObject(post.postShared?.author)) {
                post.postShared.author = _.pick(post.postShared.author, ['_id', 'username', 'avatarId', 'fullName']);
            }
        }

        const postDto = Object.assign({}, post.toObject(), {
            numberOfComments: post.commentIds.length,
            numberOfReacts: post.reactIds.length,
            numberOfShares: post.sharedIds.length,
        });

        if (user) {
            const isReacted = post.reactIds.map((id) => `${id}`).includes(`${user._id}`);
            postDto.isReacted = isReacted;
        }

        delete postDto.commentIds;
        delete postDto.reactIds;
        delete postDto.sharedIds;
        delete postDto.point;
        delete postDto.isDeletedBySystem;

        return postDto;
    }
}
