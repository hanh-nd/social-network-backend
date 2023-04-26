import * as _ from 'lodash';
import { PostDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';

export class PostResource implements IGenericResource<PostDocument> {
    async mapToDtoList(posts: PostDocument[]): Promise<object[]> {
        return await Promise.all(posts.map((p) => this.mapToDto(p)));
    }

    async mapToDto(post: PostDocument): Promise<object> {
        if (_.isObject(post.author)) {
            post.author = _.pick(post.author, ['_id', 'username', 'fullName']);
        }

        if (_.isObject(post.discussedIn)) {
            post.discussedIn = _.pick(post.discussedIn, ['_id', 'username', 'fullName']);
        }

        const postDto = Object.assign({}, post.toObject(), {
            numberOfComments: post.commentIds.length,
            numberOfReacts: post.reactIds.length,
            numberOfShares: post.sharedIds.length,
        });

        delete postDto.commentIds;
        delete postDto.reactIds;
        delete postDto.sharedIds;

        return postDto;
    }
}
