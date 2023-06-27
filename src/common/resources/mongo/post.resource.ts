import * as _ from 'lodash';
import { toObjectIds, toStringArray } from 'src/common/helper';
import { IDataServices } from 'src/common/repositories/data.service';
import { FileService } from 'src/modules/files/file.service';
import { PostDocument, User, UserDocument } from 'src/mongo-schemas';
import { IGenericResource } from '../generic.resource';

export class PostResource extends IGenericResource<PostDocument, UserDocument> {
    constructor(protected dataServices: IDataServices, protected fileService: FileService) {
        super(dataServices);
    }

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
                'isToxic',
                'isAnonymous',
                'createdAt',
                'updatedAt',
                'deletedAt',
            ]);

            if (postDto.postShared?.pictureIds) {
                const pictures = await this.fileService.findAll({
                    ids: toObjectIds(postDto.postShared.pictureIds),
                });
                postDto.postShared.medias = pictures;
            }

            if (_.isObject(postDto.postShared?.author)) {
                postDto.postShared.author = _.pick(postDto.postShared.author, [
                    '_id',
                    'username',
                    'avatarId',
                    'fullName',
                ]);

                if (`${postDto.postShared?.author?._id}` == `${user._id}`) {
                    postDto.postShared.author.isSelf = true;
                }
            }
        }

        Object.assign(postDto, {
            numberOfComments: postDto.commentIds.length,
            numberOfReacts: postDto.reactIds.length,
            numberOfShares: postDto.sharedIds.length,
        });

        if (user && postDto?.author?.subscriberIds) {
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
            if (`${postDto.author._id}` == `${user._id}`) {
                postDto.author.isSelf = true;
            }
            postDto.author.isSubscribing = isSubscribing;
        }

        if (postDto.isAnonymous && !postDto?.author?.isSelf) {
            postDto.author = {
                fullName: 'Người dùng ẩn danh',
            };
        }

        if (postDto.postShared?.isAnonymous && !postDto?.postShared?.author?.isSelf) {
            postDto.postShared.author = {
                fullName: 'Người dùng ẩn danh',
            };
        }

        if (postDto?.pictureIds) {
            const pictures = await this.fileService.findAll({
                ids: toObjectIds(postDto.pictureIds),
            });
            postDto.medias = pictures;
        }

        delete postDto.commentIds;
        delete postDto.reactIds;
        delete postDto.sharedIds;
        delete postDto.point;
        delete postDto.isDeletedBySystem;

        return postDto;
    }
}
